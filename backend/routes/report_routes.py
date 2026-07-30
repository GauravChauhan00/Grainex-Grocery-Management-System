"""URL definitions for reporting endpoints with token protection."""

from typing import Optional
from fastapi import APIRouter, Depends

from controllers.report_controller import sales_report
from utils.auth import get_current_user

report_router = APIRouter(tags=["Reports"])


@report_router.get("/sales")
def get_sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    period: str = "daily",
    current_user: dict = Depends(get_current_user),
):
    return sales_report(
        store_id=current_user.get("store_id"),
        start_date=start_date,
        end_date=end_date,
        period=period,
    )
