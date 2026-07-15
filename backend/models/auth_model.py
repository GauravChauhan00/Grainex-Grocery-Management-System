"""Database queries for authentication and store management."""

import sqlite3
from database.connection import database_connection


def get_store_by_email(email: str) -> dict | None:
    with database_connection() as conn:
        row = conn.execute(
            "SELECT * FROM stores WHERE email = ? COLLATE NOCASE", (email.strip(),)
        ).fetchone()
        return dict(row) if row else None


def store_exists_by_name(name: str) -> bool:
    with database_connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM stores WHERE name = ? COLLATE NOCASE", (name.strip(),)
        ).fetchone()
        return row is not None


def store_exists_by_email(email: str) -> bool:
    with database_connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM stores WHERE email = ? COLLATE NOCASE", (email.strip(),)
        ).fetchone()
        return row is not None


def create_store(store: dict) -> int:
    with database_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO stores (name, owner_name, email, phone, password_hash)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                store["name"].strip(),
                store["owner_name"].strip(),
                store["email"].strip().lower(),
                store.get("phone", "").strip() or None,
                store["password_hash"],
            ),
        )
        return cursor.lastrowid


def get_store_by_id(store_id: int) -> dict | None:
    with database_connection() as conn:
        row = conn.execute(
            "SELECT id, name, owner_name, email, phone, status, plan, created_at FROM stores WHERE id = ?",
            (store_id,),
        ).fetchone()
        return dict(row) if row else None


def get_all_stores(search: str = "") -> list[dict]:
    with database_connection() as conn:
        query = "SELECT id, name, owner_name, email, phone, status, plan, created_at FROM stores"
        params = []
        if search:
            query += " WHERE name LIKE ? OR owner_name LIKE ? OR email LIKE ?"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
        query += " ORDER BY id DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def update_store_status(store_id: int, status: str) -> bool:
    with database_connection() as conn:
        cursor = conn.execute(
            "UPDATE stores SET status = ? WHERE id = ?", (status, store_id)
        )
        return cursor.rowcount > 0


def delete_store(store_id: int) -> bool:
    with database_connection() as conn:
        # Delete related records
        conn.execute("DELETE FROM sales WHERE store_id = ?", (store_id,))
        conn.execute("DELETE FROM products WHERE store_id = ?", (store_id,))
        conn.execute("DELETE FROM categories WHERE store_id = ?", (store_id,))
        cursor = conn.execute("DELETE FROM stores WHERE id = ?", (store_id,))
        return cursor.rowcount > 0


def get_admin_stats() -> dict:
    with database_connection() as conn:
        stores_count = conn.execute(
            """
            SELECT
                COUNT(*) AS total_stores,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_stores,
                SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended_stores
            FROM stores
            """
        ).fetchone()

        items_count = conn.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM products) AS total_products,
                (SELECT COUNT(*) FROM sales) AS total_sales
            """
        ).fetchone()

        return {
            "total_stores": stores_count["total_stores"] or 0,
            "active_stores": stores_count["active_stores"] or 0,
            "suspended_stores": stores_count["suspended_stores"] or 0,
            "total_products": items_count["total_products"] or 0,
            "total_sales": items_count["total_sales"] or 0,
        }
