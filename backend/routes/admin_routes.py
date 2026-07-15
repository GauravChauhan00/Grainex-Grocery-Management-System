"""Super Admin management routes blueprint."""

from flask import Blueprint

from controllers import admin_controller
from utils.auth import admin_required

admin_blueprint = Blueprint("admin_routes", __name__)


@admin_blueprint.get("/stats")
@admin_required
def stats_route():
    return admin_controller.get_stats()


@admin_blueprint.get("/stores")
@admin_required
def stores_route():
    return admin_controller.list_stores()


@admin_blueprint.post("/stores/<int:store_id>/status")
@admin_required
def change_status_route(store_id: int):
    return admin_controller.change_store_status(store_id)


@admin_blueprint.delete("/stores/<int:store_id>")
@admin_required
def remove_store_route(store_id: int):
    return admin_controller.remove_store(store_id)
