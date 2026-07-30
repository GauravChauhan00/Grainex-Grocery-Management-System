"""URL definitions for category endpoints with token authentication protection."""

from fastapi import APIRouter, Depends

from controllers import category_controller
from schemas.category_schema import CategorySchema
from utils.auth import get_current_user

category_router = APIRouter(tags=["Categories"])


@category_router.get("")
def list_categories(current_user: dict = Depends(get_current_user)):
    return category_controller.list_categories(current_user.get("store_id"))


@category_router.post("")
def create_category(
    payload: CategorySchema,
    current_user: dict = Depends(get_current_user),
):
    return category_controller.create_category(
        current_user.get("store_id"), payload.model_dump()
    )


@category_router.put("/{category_id}")
def update_category(
    category_id: int,
    payload: CategorySchema,
    current_user: dict = Depends(get_current_user),
):
    return category_controller.update_category(
        category_id, current_user.get("store_id"), payload.model_dump()
    )


@category_router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: dict = Depends(get_current_user),
):
    return category_controller.delete_category(
        category_id, current_user.get("store_id")
    )
