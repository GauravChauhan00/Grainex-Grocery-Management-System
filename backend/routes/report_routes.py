"""URL definitions for reporting endpoints with token protection."""

from flask import Blueprint, g, request

from controllers.report_controller import sales_report
from utils.auth import token_required

report_blueprint = Blueprint("reports", __name__)


@report_blueprint.get("/sales")
@token_required
def get_sales_report():
    return sales_report(
        store_id=g.store_id,
        start_date=request.args.get("start_date"),
        end_date=request.args.get("end_date"),
        period=request.args.get("period", "daily"),
    )
