"""URL definitions for sale endpoints with token authentication protection."""

from typing import Optional
from fastapi import APIRouter, Depends

from controllers import sale_controller
from schemas.sale_schema import SaleCreateSchema
from utils.auth import get_current_user

sale_router = APIRouter(tags=["Sales"])


@sale_router.get("")
def list_sales(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: str = "100",
    current_user: dict = Depends(get_current_user),
):
    return sale_controller.list_sales(
        store_id=current_user.get("store_id"),
        start_date=start_date,
        end_date=end_date,
        limit_value=limit,
    )


@sale_router.post("")
def create_sale(
    payload: SaleCreateSchema,
    current_user: dict = Depends(get_current_user),
):
    return sale_controller.create_sale(
        current_user.get("store_id"), payload.model_dump()
    )
