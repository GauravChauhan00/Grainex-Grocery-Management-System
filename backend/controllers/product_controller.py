"""Validation and response logic for product CRUD endpoints with store isolation."""

import sqlite3
from datetime import datetime

from config import DEFAULT_LOW_STOCK_THRESHOLD
from models import product_model
from utils.response import jsonify


def _parse_integer(value, field_name: str, minimum: int = 0) -> int:
    if isinstance(value, bool) or (
        isinstance(value, float) and not value.is_integer()
    ):
        raise ValueError(f"{field_name} must be a whole number.")
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a whole number.") from None
    if number < minimum:
        raise ValueError(f"{field_name} cannot be less than {minimum}.")
    return number


def _parse_price(value) -> float:
    try:
        price = round(float(value), 2)
    except (TypeError, ValueError):
        raise ValueError("Unit price must be a valid number.") from None
    if price < 0:
        raise ValueError("Unit price cannot be negative.")
    return price


def _validate_expiry_date(value) -> str | None:
    expiry_date = str(value or "").strip()
    if not expiry_date:
        return None
    try:
        datetime.strptime(expiry_date, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Expiry date must use YYYY-MM-DD format.") from None
    return expiry_date


def _validate_product(store_id: int, payload: dict) -> dict:
    product_name = str(payload.get("product_name", "")).strip()
    supplier_name = str(payload.get("supplier_name", "")).strip()

    if not product_name:
        raise ValueError("Product name is required.")
    if len(product_name) > 120:
        raise ValueError("Product name must be 120 characters or fewer.")
    if len(supplier_name) > 120:
        raise ValueError("Supplier name must be 120 characters or fewer.")

    category_id = _parse_integer(payload.get("category_id"), "Category", minimum=1)
    if not product_model.category_exists(category_id, store_id):
        raise ValueError("Please select a valid category from your store.")

    return {
        "product_name": product_name,
        "category_id": category_id,
        "quantity": _parse_integer(payload.get("quantity"), "Quantity"),
        "unit_price": _parse_price(payload.get("unit_price")),
        "supplier_name": supplier_name,
        "expiry_date": _validate_expiry_date(payload.get("expiry_date")),
        "low_stock_threshold": _parse_integer(
            payload.get("low_stock_threshold", DEFAULT_LOW_STOCK_THRESHOLD),
            "Low-stock threshold",
        ),
    }


def list_products(store_id: int, search: str, category_id: str | None, status: str):
    parsed_category_id = None
    if category_id:
        try:
            parsed_category_id = int(category_id)
        except ValueError:
            return jsonify({"message": "Category filter must be a number."}, 400)

    products = product_model.get_all_products(
        store_id=store_id,
        search=search.strip(),
        category_id=parsed_category_id,
        status=status,
    )
    return jsonify({"data": products})


def get_product(product_id: int, store_id: int):
    product = product_model.get_product_by_id(product_id, store_id)
    if product is None:
        return jsonify({"message": "Product not found."}, 404)
    return jsonify({"data": product})


def create_product(store_id: int, payload: dict):
    try:
        product_data = _validate_product(store_id, payload)
        product = product_model.create_product(store_id, product_data)
        return jsonify(
            {"message": "Product added successfully.", "data": product}, 201
        )
    except ValueError as error:
        return jsonify({"message": str(error)}, 400)
    except sqlite3.IntegrityError:
        return jsonify(
            {"message": "This product already exists in the selected category."},
            409,
        )


def update_product(product_id: int, store_id: int, payload: dict):
    if product_model.get_product_by_id(product_id, store_id) is None:
        return jsonify({"message": "Product not found."}, 404)

    try:
        product_data = _validate_product(store_id, payload)
        product = product_model.update_product(product_id, store_id, product_data)
        return jsonify({"message": "Product updated successfully.", "data": product})
    except ValueError as error:
        return jsonify({"message": str(error)}, 400)
    except sqlite3.IntegrityError:
        return jsonify(
            {"message": "This product already exists in the selected category."},
            409,
        )


def delete_product(product_id: int, store_id: int):
    if product_model.get_product_by_id(product_id, store_id) is None:
        return jsonify({"message": "Product not found."}, 404)

    sale_count = product_model.count_sales_for_product(product_id, store_id)
    if sale_count > 0:
        return jsonify(
            {
                "message": (
                    f"This product has {sale_count} sale record(s), so it cannot be deleted. "
                    "Keeping it protects the sales report history."
                )
            },
            409,
        )

    product_model.delete_product(product_id, store_id)
    return jsonify({"message": "Product deleted successfully."})
