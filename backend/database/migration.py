"""Automated SQLite migrations to support multi-store SaaS structure."""

import sqlite3
from pathlib import Path
from config import DATABASE_PATH


def run_migrations():
    """Migrate the database to support multi-tenancy without losing existing data."""
    if not DATABASE_PATH.exists():
        # Let initialize_database handle the initial empty creation and seed
        return

    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.row_factory = sqlite3.Row

        # 1. Create stores table if it doesn't exist
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                owner_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                phone TEXT,
                password_hash TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                plan TEXT NOT NULL DEFAULT 'free',
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            );
            """
        )

        # Ensure default store 1 exists for migration backfill
        cursor = conn.execute("SELECT 1 FROM stores WHERE id = 1")
        if not cursor.fetchone():
            default_hash = "scrypt:32768:8:1$mUN0hb1WGvOlxNMu$6ca8cc9bd9c264045d0de8090c908698d2f4dabce66ea37f6afeb3ed1587a40b164ba8fede76d38c8d251d67e0cd7976d79f03c13ae1edd4a93167784443c36c"
            conn.execute(
                """
                INSERT INTO stores (id, name, owner_name, email, phone, password_hash, status, plan)
                VALUES (1, 'Gaurav''s Store', 'Gaurav', 'gaurav@example.com', '9876543210', ?, 'active', 'premium')
                """,
                (default_hash,),
            )

        # 2. Add store_id to categories, products, and sales
        tables = ["categories", "products", "sales"]
        for table in tables:
            cursor = conn.execute(f"PRAGMA table_info({table})")
            columns = [row["name"] for row in cursor.fetchall()]
            if "store_id" not in columns:
                conn.execute(
                    f"ALTER TABLE {table} ADD COLUMN store_id INTEGER NOT NULL DEFAULT 1"
                )
                print(f"Migration: Added store_id to {table}")

        conn.commit()
