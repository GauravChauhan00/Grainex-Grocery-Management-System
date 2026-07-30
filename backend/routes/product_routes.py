"""URL definitions for product endpoints with token authentication protection."""

from typing import Optional
from fastapi import APIRouter, Depends

from controllers import product_controller
from schemas.product_schema import ProductSchema
from utils.auth import get_current_user

product_router = APIRouter(tags=["Products"])


@product_router.get("")
def list_products(
    search: str = "",
    category_id: Optional[str] = None,
    status: str = "",
    current_user: dict = Depends(get_current_user),
):
    return product_controller.list_products(
        store_id=current_user.get("store_id"),
        search=search,
        category_id=category_id,
        status=status,
    )


@product_router.get("/{product_id}")
def get_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
):
    return product_controller.get_product(product_id, current_user.get("store_id"))


@product_router.post("")
def create_product(
    payload: ProductSchema,
    current_user: dict = Depends(get_current_user),
):
    return product_controller.create_product(
        current_user.get("store_id"), payload.model_dump()
    )


@product_router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductSchema,
    current_user: dict = Depends(get_current_user),
):
    return product_controller.update_product(
        product_id,
        current_user.get("store_id"),
        payload.model_dump(),
    )


@product_router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: dict = Depends(get_current_user),
):
    return product_controller.delete_product(product_id, current_user.get("store_id"))
