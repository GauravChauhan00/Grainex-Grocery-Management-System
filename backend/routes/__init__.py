"""Register all REST API routers in one place."""

from fastapi import FastAPI

from config import API_PREFIX
from routes.admin_routes import admin_router
from routes.auth_routes import auth_router
from routes.category_routes import category_router
from routes.dashboard_routes import dashboard_router
from routes.product_routes import product_router
from routes.report_routes import report_router
from routes.sale_routes import sale_router



def register_routes(app: FastAPI) -> None:
    app.include_router(product_router, prefix=f"{API_PREFIX}/products")
    app.include_router(category_router, prefix=f"{API_PREFIX}/categories")
    app.include_router(sale_router, prefix=f"{API_PREFIX}/sales")
    app.include_router(dashboard_router, prefix=API_PREFIX)
    app.include_router(report_router, prefix=f"{API_PREFIX}/reports")
    app.include_router(auth_router, prefix=f"{API_PREFIX}/auth")
    app.include_router(admin_router, prefix=f"{API_PREFIX}/admin")
