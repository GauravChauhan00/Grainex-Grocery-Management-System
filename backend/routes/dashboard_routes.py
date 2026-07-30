"""URL definition for the dashboard summary endpoint with token protection."""

from fastapi import APIRouter, Depends

from controllers.dashboard_controller import dashboard_summary
from utils.auth import get_current_user

dashboard_router = APIRouter(tags=["Dashboard"])


@dashboard_router.get("/dashboard-summary")
def get_summary_route(current_user: dict = Depends(get_current_user)):
    return dashboard_summary(current_user.get("store_id"))
