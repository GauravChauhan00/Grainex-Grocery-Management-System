"""Create the SQLite database and insert demo data when required."""

from pathlib import Path

from config import DATABASE_PATH, PROJECT_ROOT
from database.connection import database_connection
from database.migration import run_migrations

SCHEMA_PATH = PROJECT_ROOT / "database" / "schema.sql"
SEED_PATH = PROJECT_ROOT / "database" / "seed.sql"


def initialize_database(force_reset: bool = False) -> Path:
    """Create tables and seed an empty database, then execute tenant migrations."""

    if force_reset and DATABASE_PATH.exists():
        DATABASE_PATH.unlink()

    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Migrate existing database first to add columns before schema.sql tries to create indexes on them
    run_migrations()

    with database_connection() as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

        table_counts = connection.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM categories) AS categories_count,
                (SELECT COUNT(*) FROM products) AS products_count,
                (SELECT COUNT(*) FROM sales) AS sales_count
            """
        ).fetchone()

        if all(table_counts[key] == 0 for key in table_counts.keys()):
            connection.executescript(SEED_PATH.read_text(encoding="utf-8"))

    # Always ensure existing databases are migrated to SaaS schema
    run_migrations()

    return DATABASE_PATH

