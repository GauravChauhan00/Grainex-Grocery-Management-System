"""Validation and response logic for sale endpoints with store isolation."""

from datetime import datetime
from flask import jsonify

from models import sale_model


def _validate_date(value: str | None, field_name: str) -> str | None:
    if not value:
        return None
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise ValueError(f"{field_name} must use YYYY-MM-DD format.") from None
    return value


def list_sales(
    store_id: int, start_date: str | None, end_date: str | None, limit_value: str
):
    try:
        start_date = _validate_date(start_date, "Start date")
        end_date = _validate_date(end_date, "End date")
        limit = int(limit_value)
        if not 1 <= limit <= 500:
            raise ValueError("Limit must be between 1 and 500.")
        if start_date and end_date and start_date > end_date:
            raise ValueError("Start date cannot be after end date.")
    except ValueError as error:
        return jsonify({"message": str(error)}), 400

    return jsonify(
        {"data": sale_model.get_sales(store_id, start_date, end_date, limit)}
    )


def _parse_positive_integer(value, field_name: str) -> int:
    if isinstance(value, bool) or (
        isinstance(value, float) and not value.is_integer()
    ):
        raise ValueError(f"{field_name} must be a whole number.")
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a whole number.") from None
    if number <= 0:
        raise ValueError(f"{field_name} must be at least 1.")
    return number


def create_sale(store_id: int, payload: dict):
    try:
        product_id = _parse_positive_integer(
            payload.get("product_id"), "Product"
        )
        quantity_sold = _parse_positive_integer(
            payload.get("quantity_sold"), "Quantity sold"
        )

        selected_date = _validate_date(payload.get("sale_date"), "Sale date")
        now_time = datetime.now().strftime("%H:%M:%S")
        sale_date = (
            f"{selected_date} {now_time}"
            if selected_date
            else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        sale = sale_model.create_sale(
            store_id, product_id, quantity_sold, sale_date
        )
        return (
            jsonify({"message": "Sale recorded and stock updated.", "data": sale}),
            201,
        )
    except (TypeError, ValueError) as error:
        message = str(error) or "Product and quantity are required."
        return jsonify({"message": message}), 400
    except LookupError as error:
        return jsonify({"message": str(error)}), 404
