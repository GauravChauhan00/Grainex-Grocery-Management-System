"""Authentication decorators and token management utilities using itsdangerous."""

import functools
from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from config import SECRET_KEY

# Tokens expire after 30 days
TOKEN_MAX_AGE = 30 * 24 * 60 * 60


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


def token_required(f):
    """Decorator to require token authentication on API routes."""

    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Authentication token is missing."}), 401

        user_data = decode_token(token)
        if not user_data:
            return jsonify({"message": "Invalid or expired token."}), 401

        g.user = user_data
        g.store_id = user_data.get("store_id")

        # Block requests if store is suspended (excluding super admin)
        if user_data.get("role") != "admin" and g.store_id:
            from database.connection import database_connection

            with database_connection() as conn:
                row = conn.execute(
                    "SELECT status FROM stores WHERE id = ?", (g.store_id,)
                ).fetchone()
                if row and row["status"] == "suspended":
                    return (
                        jsonify(
                            {
                                "message": "Your store account has been suspended. Please contact customer support."
                            }
                        ),
                        403,
                    )

        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator to require superadmin privileges."""

    @functools.wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.user.get("role") != "admin":
            return jsonify({"message": "Super Admin access required."}), 403
        return f(*args, **kwargs)

    return decorated
