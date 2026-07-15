"""Database queries for product CRUD operations with multi-tenant store_id isolation."""

from database.connection import database_connection

PRODUCT_SELECT = """
    SELECT
        p.id,
        p.product_name,
        p.category_id,
        c.name AS category,
        p.quantity,
        p.unit_price,
        p.supplier_name,
        p.expiry_date,
        p.low_stock_threshold,
        p.created_at,
        p.updated_at,
        CASE
            WHEN p.quantity = 0 THEN 'Out of Stock'
            WHEN p.quantity <= p.low_stock_threshold THEN 'Low Stock'
            ELSE 'In Stock'
        END AS stock_status
    FROM products p
    JOIN categories c ON c.id = p.category_id AND c.store_id = p.store_id
"""


def get_all_products(
    store_id: int,
    search: str = "",
    category_id: int | None = None,
    status: str = "",
) -> list[dict]:
    conditions: list[str] = ["p.store_id = ?"]
    parameters: list[object] = [store_id]

    if search:
        search_value = f"%{search}%"
        conditions.append(
            "(p.product_name LIKE ? OR p.supplier_name LIKE ? OR c.name LIKE ?)"
        )
        parameters.extend([search_value, search_value, search_value])

    if category_id is not None:
        conditions.append("p.category_id = ?")
        parameters.append(category_id)

    normalized_status = status.strip().lower()
    if normalized_status == "in-stock":
        conditions.append("p.quantity > p.low_stock_threshold")
    elif normalized_status == "low-stock":
        conditions.append("p.quantity > 0 AND p.quantity <= p.low_stock_threshold")
    elif normalized_status == "out-of-stock":
        conditions.append("p.quantity = 0")

    where_clause = f"WHERE {' AND '.join(conditions)}"
    query = f"{PRODUCT_SELECT} {where_clause} ORDER BY p.product_name COLLATE NOCASE"

    with database_connection() as connection:
        rows = connection.execute(query, parameters).fetchall()
        return [dict(row) for row in rows]


def get_product_by_id(product_id: int, store_id: int) -> dict | None:
    with database_connection() as connection:
        row = connection.execute(
            f"{PRODUCT_SELECT} WHERE p.id = ? AND p.store_id = ?",
            (product_id, store_id),
        ).fetchone()
        return dict(row) if row else None


def create_product(store_id: int, product: dict) -> dict:
    with database_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO products (
                store_id,
                product_name,
                category_id,
                quantity,
                unit_price,
                supplier_name,
                expiry_date,
                low_stock_threshold
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                store_id,
                product["product_name"],
                product["category_id"],
                product["quantity"],
                product["unit_price"],
                product["supplier_name"],
                product["expiry_date"],
                product["low_stock_threshold"],
            ),
        )
        product_id = cursor.lastrowid

    return get_product_by_id(product_id, store_id)


def update_product(
    product_id: int, store_id: int, product: dict
) -> dict | None:
    with database_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE products
            SET
                product_name = ?,
                category_id = ?,
                quantity = ?,
                unit_price = ?,
                supplier_name = ?,
                expiry_date = ?,
                low_stock_threshold = ?,
                updated_at = datetime('now', 'localtime')
            WHERE id = ? AND store_id = ?
            """,
            (
                product["product_name"],
                product["category_id"],
                product["quantity"],
                product["unit_price"],
                product["supplier_name"],
                product["expiry_date"],
                product["low_stock_threshold"],
                product_id,
                store_id,
            ),
        )
        if cursor.rowcount == 0:
            return None

    return get_product_by_id(product_id, store_id)


def delete_product(product_id: int, store_id: int) -> bool:
    with database_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM products WHERE id = ? AND store_id = ?",
            (product_id, store_id),
        )
        return cursor.rowcount > 0


def count_sales_for_product(product_id: int, store_id: int) -> int:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT COUNT(*) AS total FROM sales WHERE product_id = ? AND store_id = ?",
            (product_id, store_id),
        ).fetchone()
        return int(row["total"])


def category_exists(category_id: int, store_id: int) -> bool:
    with database_connection() as connection:
        row = connection.execute(
            "SELECT 1 FROM categories WHERE id = ? AND store_id = ?",
            (category_id, store_id),
        ).fetchone()
        return row is not None
