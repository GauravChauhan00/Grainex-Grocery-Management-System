"""Dashboard endpoint controller with store isolation."""

from models.dashboard_model import get_dashboard_summary
from utils.response import jsonify


def dashboard_summary(store_id: int):
    return jsonify({"data": get_dashboard_summary(store_id)})
