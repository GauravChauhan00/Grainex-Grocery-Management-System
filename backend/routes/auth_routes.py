"""Authentication routes blueprint."""

from flask import Blueprint, g, jsonify, request

from controllers import auth_controller
from utils.auth import token_required

auth_blueprint = Blueprint("auth_routes", __name__)


@auth_blueprint.post("/register")
def register_route():
    payload = request.get_json() or {}
    return auth_controller.register_store(payload)


@auth_blueprint.post("/login")
def login_route():
    payload = request.get_json() or {}
    return auth_controller.login(payload)


@auth_blueprint.get("/me")
@token_required
def me_route():
    return jsonify({"data": g.user})


@auth_blueprint.post("/forgot-password")
def forgot_password_route():
    payload = request.get_json() or {}
    return auth_controller.forgot_password(payload)


@auth_blueprint.post("/contact")
def contact_route():
    payload = request.get_json() or {}
    return auth_controller.submit_contact_form(payload)

