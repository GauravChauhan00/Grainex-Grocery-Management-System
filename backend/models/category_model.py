"""Database queries for category CRUD operations with multi-tenant store_id isolation."""

from database.connection import database_connection


def get_all_categories(store_id: int) -> list[dict]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                c.id,
                c.name,
                c.description,
                c.created_at,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.store_id = c.store_id
            WHERE c.store_id = ?
            GROUP BY c.id
            ORDER BY c.name COLLATE NOCASE
            """,
            (store_id,),
        ).fetchall()
        return [dict(row) for row in rows]


def get_category_by_id(category_id: int, store_id: int) -> dict | None:
    with database_connection() as connection:
        row = connection.execute(
            """
            SELECT
                c.id,
                c.name,
                c.description,
                c.created_at,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.store_id = c.store_id
            WHERE c.id = ? AND c.store_id = ?
            GROUP BY c.id
            """,
            (category_id, store_id),
        ).fetchone()
        return dict(row) if row else None


def create_category(store_id: int, name: str, description: str) -> dict:
    with database_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO categories (store_id, name, description) VALUES (?, ?, ?)",
            (store_id, name, description),
        )
        category_id = cursor.lastrowid

    return get_category_by_id(category_id, store_id)


def update_category(
    category_id: int, store_id: int, name: str, description: str
) -> dict | None:
    with database_connection() as connection:
        cursor = connection.execute(
            "UPDATE categories SET name = ?, description = ? WHERE id = ? AND store_id = ?",
            (name, description, category_id, store_id),
        )
        if cursor.rowcount == 0:
            return None

    return get_category_by_id(category_id, store_id)


def delete_category(category_id: int, store_id: int) -> bool:
    with database_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM categories WHERE id = ? AND store_id = ?",
            (category_id, store_id),
        )
        return cursor.rowcount > 0


def count_products_in_category(category_id: int, store_id: int) -> int:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT COUNT(*) AS total FROM products WHERE category_id = ? AND store_id = ?",
            (category_id, store_id),
        ).fetchone()
        return int(row["total"])
