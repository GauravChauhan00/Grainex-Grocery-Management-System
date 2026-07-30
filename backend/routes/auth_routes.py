"""Authentication routes router."""

from fastapi import APIRouter, Depends

from controllers import auth_controller
from schemas.auth_schema import (
    ContactSchema,
    ForgotPasswordSchema,
    LoginSchema,
    RegisterStoreSchema,
)
from utils.auth import get_current_user
from utils.response import jsonify

auth_router = APIRouter(tags=["Authentication"])


@auth_router.post("/register")
def register_route(payload: RegisterStoreSchema):
    return auth_controller.register_store(payload.model_dump())


@auth_router.post("/login")
def login_route(payload: LoginSchema):
    return auth_controller.login(payload.model_dump())


@auth_router.get("/me")
def me_route(current_user: dict = Depends(get_current_user)):
    return jsonify({"data": current_user})


@auth_router.post("/forgot-password")
def forgot_password_route(payload: ForgotPasswordSchema):
    return auth_controller.forgot_password(payload.model_dump())


@auth_router.post("/contact")
def contact_route(payload: ContactSchema):
    return auth_controller.submit_contact_form(payload.model_dump())
