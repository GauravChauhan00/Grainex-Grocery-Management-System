"""URL definitions for product endpoints with token authentication protection."""

from flask import Blueprint, g, request

from controllers import product_controller
from utils.auth import token_required

product_blueprint = Blueprint("products", __name__)


@product_blueprint.get("")
@token_required
def list_products():
    return product_controller.list_products(
        store_id=g.store_id,
        search=request.args.get("search", ""),
        category_id=request.args.get("category_id"),
        status=request.args.get("status", ""),
    )


@product_blueprint.get("/<int:product_id>")
@token_required
def get_product(product_id: int):
    return product_controller.get_product(product_id, g.store_id)


@product_blueprint.post("")
@token_required
def create_product():
    return product_controller.create_product(
        g.store_id, request.get_json(silent=True) or {}
    )


@product_blueprint.put("/<int:product_id>")
@token_required
def update_product(product_id: int):
    return product_controller.update_product(
        product_id,
        g.store_id,
        request.get_json(silent=True) or {},
    )


@product_blueprint.delete("/<int:product_id>")
@token_required
def delete_product(product_id: int):
    return product_controller.delete_product(product_id, g.store_id)
