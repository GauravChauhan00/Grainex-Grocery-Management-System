"""Small central configuration file for the Flask backend."""

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE_PATH = PROJECT_ROOT / "database" / "grocery.db"
DATABASE_PATH = Path(os.getenv("GROCERY_DB_PATH", str(DEFAULT_DATABASE_PATH))).resolve()

API_PREFIX = "/api"
DEFAULT_LOW_STOCK_THRESHOLD = 10
ALLOWED_FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-saas-platform-982183")
ADMIN_NOTIFICATION_EMAIL = "gaurav94855@gmail.com"



