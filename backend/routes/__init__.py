"""Register all REST API blueprints in one place."""

from flask import Flask

from config import API_PREFIX
from routes.category_routes import category_blueprint
from routes.dashboard_routes import dashboard_blueprint
from routes.product_routes import product_blueprint
from routes.report_routes import report_blueprint
from routes.sale_routes import sale_blueprint
from routes.auth_routes import auth_blueprint
from routes.admin_routes import admin_blueprint


def register_routes(app: Flask) -> None:
    app.register_blueprint(product_blueprint, url_prefix=f"{API_PREFIX}/products")
    app.register_blueprint(category_blueprint, url_prefix=f"{API_PREFIX}/categories")
    app.register_blueprint(sale_blueprint, url_prefix=f"{API_PREFIX}/sales")
    app.register_blueprint(dashboard_blueprint, url_prefix=API_PREFIX)
    app.register_blueprint(report_blueprint, url_prefix=f"{API_PREFIX}/reports")
    app.register_blueprint(auth_blueprint, url_prefix=f"{API_PREFIX}/auth")
    app.register_blueprint(admin_blueprint, url_prefix=f"{API_PREFIX}/admin")

