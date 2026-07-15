"""URL definition for the dashboard summary endpoint with token protection."""

from flask import Blueprint, g
from controllers.dashboard_controller import dashboard_summary
from utils.auth import token_required

dashboard_blueprint = Blueprint("dashboard", __name__)


@dashboard_blueprint.get("/dashboard-summary")
@token_required
def get_summary_route():
    return dashboard_summary(g.store_id)
