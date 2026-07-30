"""Authentication token management utilities and FastAPI security dependencies using itsdangerous."""

from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from config import SECRET_KEY

# Tokens expire after 30 days
TOKEN_MAX_AGE = 30 * 24 * 60 * 60

security_scheme = HTTPBearer(auto_error=False)


def get_serializer():
    return URLSafeTimedSerializer(SECRET_KEY, salt="auth-salt")


def generate_token(payload: dict) -> str:
    """Encode user information into a secure timed token."""
    serializer = get_serializer()
    return serializer.dumps(payload)


def decode_token(token: str) -> dict | None:
    """Decode token and verify signature & expiry."""
    serializer = get_serializer()
    try:
        return serializer.loads(token, max_age=TOKEN_MAX_AGE)
    except (SignatureExpired, BadSignature):
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),
) -> dict:
    """FastAPI dependency to validate token and return user payload."""
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication token is missing.")

    token = credentials.credentials
    user_data = decode_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    store_id = user_data.get("store_id")

    # Block requests if store is suspended (excluding super admin)
    if user_data.get("role") != "admin" and store_id:
        from database.connection import database_connection

        with database_connection() as conn:
            row = conn.execute(
                "SELECT status FROM stores WHERE id = ?", (store_id,)
            ).fetchone()
            if row and row["status"] == "suspended":
                raise HTTPException(
                    status_code=403,
                    detail="Your store account has been suspended. Please contact customer support.",
                )

    return user_data


def get_current_admin(user_data: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency to ensure user has superadmin role."""
    if user_data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Super Admin access required.")
    return user_data
