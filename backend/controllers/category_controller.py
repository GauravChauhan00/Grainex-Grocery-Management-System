"""Validation and response logic for category endpoints with store isolation."""

import sqlite3
from flask import jsonify
from models import category_model


def _validate_category(payload: dict) -> tuple[str, str]:
    name = str(payload.get("name", "")).strip()
    description = str(payload.get("description", "")).strip()

    if not name:
        raise ValueError("Category name is required.")
    if len(name) > 80:
        raise ValueError("Category name must be 80 characters or fewer.")
    if len(description) > 250:
        raise ValueError("Description must be 250 characters or fewer.")

    return name, description


def list_categories(store_id: int):
    return jsonify({"data": category_model.get_all_categories(store_id)})


def create_category(store_id: int, payload: dict):
    try:
        name, description = _validate_category(payload)
        category = category_model.create_category(store_id, name, description)
        return (
            jsonify({"message": "Category added successfully.", "data": category}),
            201,
        )
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    except sqlite3.IntegrityError:
        return (
            jsonify(
                {"message": "A category with this name already exists in your store."}
            ),
            409,
        )


def update_category(category_id: int, store_id: int, payload: dict):
    try:
        name, description = _validate_category(payload)
        category = category_model.update_category(
            category_id, store_id, name, description
        )
        if category is None:
            return jsonify({"message": "Category not found."}), 404
        return jsonify({"message": "Category updated successfully.", "data": category})
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    except sqlite3.IntegrityError:
        return (
            jsonify(
                {"message": "A category with this name already exists in your store."}
            ),
            409,
        )


def delete_category(category_id: int, store_id: int):
    if category_model.get_category_by_id(category_id, store_id) is None:
        return jsonify({"message": "Category not found."}), 404

    product_count = category_model.count_products_in_category(category_id, store_id)
    if product_count > 0:
        return (
            jsonify(
                {
                    "message": (
                        f"This category contains {product_count} product(s). "
                        "Move or delete those products first."
                    )
                }
            ),
            409,
        )

    category_model.delete_category(category_id, store_id)
    return jsonify({"message": "Category deleted successfully."})
