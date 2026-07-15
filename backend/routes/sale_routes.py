"""URL definitions for sale endpoints with token authentication protection."""

from flask import Blueprint, g, request

from controllers import sale_controller
from utils.auth import token_required

sale_blueprint = Blueprint("sales", __name__)


@sale_blueprint.get("")
@token_required
def list_sales():
    return sale_controller.list_sales(
        store_id=g.store_id,
        start_date=request.args.get("start_date"),
        end_date=request.args.get("end_date"),
        limit_value=request.args.get("limit", "100"),
    )


@sale_blueprint.post("")
@token_required
def create_sale():
    return sale_controller.create_sale(
        g.store_id, request.get_json(silent=True) or {}
    )
