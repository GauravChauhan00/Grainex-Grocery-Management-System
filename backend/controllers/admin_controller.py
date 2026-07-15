"""Controller logic for Super Admin management endpoints."""

from flask import jsonify, request

from models import auth_model


def get_stats():
    """Retrieve database metrics and tenant activity ratios."""
    try:
        stats = auth_model.get_admin_stats()
        return jsonify({"data": stats})
    except Exception as e:
        return jsonify({"message": f"Failed to fetch stats: {str(e)}"}), 500


def list_stores():
    """Search and list registered grocery store tenants."""
    try:
        search = request.args.get("search", "")
        stores = auth_model.get_all_stores(search)
        return jsonify({"data": stores})
    except Exception as e:
        return jsonify({"message": f"Failed to list stores: {str(e)}"}), 500


def change_store_status(store_id: int):
    """Toggle a store status between active and suspended."""
    try:
        payload = request.get_json() or {}
        status = str(payload.get("status", "")).strip().lower()

        if status not in ["active", "suspended"]:
            return jsonify({"message": "Invalid status value."}), 400

        success = auth_model.update_store_status(store_id, status)
        if not success:
            return jsonify({"message": "Store not found."}), 404

        return jsonify(
            {
                "message": f"Store status updated to {status} successfully.",
                "status": status,
            }
        )
    except Exception as e:
        return jsonify({"message": f"Failed to update store: {str(e)}"}), 500


def remove_store(store_id: int):
    """Permanently delete a store and all associated inventory and sale records."""
    try:
        # Prevent deleting the main system seed store (id = 1) if desired,
        # but let's allow it if requested. Let's keep it safe.
        if store_id == 1:
            return (
                jsonify(
                    {"message": "The system seed store (ID 1) cannot be deleted."}
                ),
                403,
            )

        success = auth_model.delete_store(store_id)
        if not success:
            return jsonify({"message": "Store not found."}), 404

        return jsonify({"message": "Store and all related records deleted."})
    except Exception as e:
        return jsonify({"message": f"Failed to delete store: {str(e)}"}), 500
