"""FastAPI application entry point for the Grocery Management Store API."""

import contextlib
import os
import sqlite3
import sys

# Load environment variables from .env file (if present)
try:
    from dotenv import load_dotenv

    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import ALLOWED_FRONTEND_ORIGINS, API_PREFIX, DATABASE_PATH
from database.initialize import initialize_database
from routes import register_routes


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database on app startup
    initialize_database()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Grocery Management Store API",
        description="RESTful SaaS Backend for Grocery Store Inventory & Sales",
        version="2.0.0",
        lifespan=lifespan,
    )

    # Enable CORS for local development frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_FRONTEND_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_routes(app)

    @app.get(f"{API_PREFIX}/health", tags=["Health"])
    def health_check():
        return {
            "status": "ok",
            "message": "Grocery Management API is running.",
            "database": str(DATABASE_PATH),
        }

    # Custom exception handler for HTTPException to guarantee {"message": "..."} key structure
    @app.exception_handler(HTTPException)
    async def custom_http_exception_handler(request: Request, exc: HTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else exc.detail
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": detail},
        )

    @app.exception_handler(sqlite3.Error)
    async def database_exception_handler(request: Request, exc: sqlite3.Error):
        return JSONResponse(
            status_code=500,
            content={"message": "A database error occurred. Please try again."},
        )

    @app.exception_handler(Exception)
    async def unexpected_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"message": f"An unexpected server error occurred: {str(exc)}"},
        )

    return app


app = create_app()

if __name__ == "__main__":
    if "--reset-db" in sys.argv:
        path = initialize_database(force_reset=True)
        print(f"Database reset successfully: {path}")
        sys.exit(0)

    print("Backend API running on FastAPI: http://127.0.0.1:5000/api")
    print("Interactive Swagger Docs: http://127.0.0.1:5000/docs")
    print(f"SQLite database file: {DATABASE_PATH}")
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)
