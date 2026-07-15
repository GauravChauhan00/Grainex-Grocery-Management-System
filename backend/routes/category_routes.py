"""URL definitions for category endpoints with token authentication protection."""

from flask import Blueprint, g, request
from controllers import category_controller
from utils.auth import token_required

category_blueprint = Blueprint("categories", __name__)


@category_blueprint.get("")
@token_required
def list_categories():
    return category_controller.list_categories(g.store_id)


@category_blueprint.post("")
@token_required
def create_category():
    return category_controller.create_category(
        g.store_id, request.get_json(silent=True) or {}
    )


@category_blueprint.put("/<int:category_id>")
@token_required
def update_category(category_id: int):
    return category_controller.update_category(
        category_id, g.store_id, request.get_json(silent=True) or {}
    )


@category_blueprint.delete("/<int:category_id>")
@token_required
def delete_category(category_id: int):
    return category_controller.delete_category(category_id, g.store_id)
