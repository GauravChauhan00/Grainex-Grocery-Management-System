"""Flask application entry point for the Grocery Management Store API."""

import sqlite3
import sys
import os

# Load environment variables from .env file (if present)
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
except ImportError:
    pass  # python-dotenv not installed; rely on real OS environment variables

from flask import Flask, jsonify
from flask_cors import CORS

from config import ALLOWED_FRONTEND_ORIGINS, API_PREFIX, DATABASE_PATH
from database.initialize import initialize_database
from routes import register_routes


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.update(JSON_SORT_KEYS=False)

    if test_config:
        app.config.update(test_config)

    # The React development server uses port 5173, so CORS allows it to call
    # this API on port 5000 during local development.
    CORS(
        app,
        resources={f"{API_PREFIX}/*": {"origins": ALLOWED_FRONTEND_ORIGINS}},
    )

    initialize_database()
    register_routes(app)

    @app.get(f"{API_PREFIX}/health")
    def health_check():
        return jsonify(
            {
                "status": "ok",
                "message": "Grocery Management API is running.",
                "database": str(DATABASE_PATH),
            }
        )

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify({"message": "API endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return jsonify({"message": "This HTTP method is not allowed here."}), 405

    @app.errorhandler(sqlite3.Error)
    def database_error(error):
        app.logger.exception("SQLite error: %s", error)
        return jsonify({"message": "A database error occurred. Please try again."}), 500

    @app.errorhandler(Exception)
    def unexpected_error(error):
        app.logger.exception("Unexpected error: %s", error)
        return jsonify({"message": "An unexpected server error occurred."}), 500

    return app


if __name__ == "__main__":
    if "--reset-db" in sys.argv:
        path = initialize_database(force_reset=True)
        print(f"Database reset successfully: {path}")
        raise SystemExit(0)

    application = create_app()
    print("Backend API: http://127.0.0.1:5000/api")
    print(f"SQLite file: {DATABASE_PATH}")
    application.run(host="127.0.0.1", port=5000, debug=True)
