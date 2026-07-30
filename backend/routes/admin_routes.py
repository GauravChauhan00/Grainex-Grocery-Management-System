"""Super Admin management routes router."""

from fastapi import APIRouter, Depends

from controllers import admin_controller
from schemas.admin_schema import StoreStatusSchema
from utils.auth import get_current_admin

admin_router = APIRouter(tags=["Super Admin"])


@admin_router.get("/stats")
def stats_route(_admin: dict = Depends(get_current_admin)):
    return admin_controller.get_stats()


@admin_router.get("/stores")
def stores_route(
    search: str = "",
    _admin: dict = Depends(get_current_admin),
):
    return admin_controller.list_stores(search=search)


@admin_router.post("/stores/{store_id}/status")
def change_status_route(
    store_id: int,
    payload: StoreStatusSchema,
    _admin: dict = Depends(get_current_admin),
):
    return admin_controller.change_store_status(store_id, payload.model_dump())


@admin_router.delete("/stores/{store_id}")
def remove_store_route(
    store_id: int,
    _admin: dict = Depends(get_current_admin),
):
    return admin_controller.remove_store(store_id)
