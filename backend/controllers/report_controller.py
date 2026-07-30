"""Validation and response logic for sales reporting with store isolation."""

from datetime import datetime

from models.report_model import get_sales_report
from utils.response import jsonify

VALID_PERIODS = {"daily", "weekly", "monthly"}


def _validate_date(value: str | None, field_name: str) -> str | None:
    if not value:
        return None
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise ValueError(f"{field_name} must use YYYY-MM-DD format.") from None
    return value


def sales_report(
    store_id: int, start_date: str | None, end_date: str | None, period: str
):
    try:
        start_date = _validate_date(start_date, "Start date")
        end_date = _validate_date(end_date, "End date")
        period = period.lower().strip()
        if period not in VALID_PERIODS:
            raise ValueError("Period must be daily, weekly or monthly.")
        if start_date and end_date and start_date > end_date:
            raise ValueError("Start date cannot be after end date.")
    except ValueError as error:
        return jsonify({"message": str(error)}, 400)

    report = get_sales_report(store_id, start_date, end_date, period)
    return jsonify({"data": report})
