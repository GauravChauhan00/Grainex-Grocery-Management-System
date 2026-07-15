"""Database queries for sales and the atomic stock-reduction transaction with store_id isolation."""

from database.connection import database_connection

SALE_SELECT = """
    SELECT
        s.id,
        s.product_id,
        p.product_name,
        c.name AS category,
        s.quantity_sold,
        s.price_per_unit,
        s.total_amount,
        s.sale_date
    FROM sales s
    JOIN products p ON p.id = s.product_id AND p.store_id = s.store_id
    JOIN categories c ON c.id = p.category_id AND c.store_id = s.store_id
"""


def get_sales(
    store_id: int,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
) -> list[dict]:
    conditions: list[str] = ["s.store_id = ?"]
    parameters: list[object] = [store_id]

    if start_date:
        conditions.append("date(s.sale_date) >= date(?)")
        parameters.append(start_date)
    if end_date:
        conditions.append("date(s.sale_date) <= date(?)")
        parameters.append(end_date)

    where_clause = f"WHERE {' AND '.join(conditions)}"
    parameters.append(limit)

    with database_connection() as connection:
        rows = connection.execute(
            f"{SALE_SELECT} {where_clause} ORDER BY s.sale_date DESC, s.id DESC LIMIT ?",
            parameters,
        ).fetchall()
        return [dict(row) for row in rows]


def get_sale_by_id(sale_id: int, store_id: int) -> dict | None:
    with database_connection() as connection:
        row = connection.execute(
            f"{SALE_SELECT} WHERE s.id = ? AND s.store_id = ?",
            (sale_id, store_id),
        ).fetchone()
        return dict(row) if row else None


def create_sale(
    store_id: int, product_id: int, quantity_sold: int, sale_date: str
) -> dict:
    """Record a sale and reduce stock inside one SQLite transaction, with store validation."""

    with database_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")

        # Select product and ensure it belongs to the store
        product = connection.execute(
            "SELECT id, product_name, quantity, unit_price FROM products WHERE id = ? AND store_id = ?",
            (product_id, store_id),
        ).fetchone()

        if product is None:
            raise LookupError("The selected product does not exist in your store.")

        if quantity_sold > product["quantity"]:
            raise ValueError(
                f"Only {product['quantity']} unit(s) of {product['product_name']} are available."
            )

        update_cursor = connection.execute(
            """
            UPDATE products
            SET quantity = quantity - ?, updated_at = datetime('now', 'localtime')
            WHERE id = ? AND store_id = ? AND quantity >= ?
            """,
            (quantity_sold, product_id, store_id, quantity_sold),
        )

        if update_cursor.rowcount == 0:
            raise ValueError(
                "Stock changed before this sale was saved. Please try again."
            )

        price_per_unit = round(float(product["unit_price"]), 2)
        total_amount = round(price_per_unit * quantity_sold, 2)

        cursor = connection.execute(
            """
            INSERT INTO sales (
                store_id,
                product_id,
                quantity_sold,
                price_per_unit,
                total_amount,
                sale_date
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                store_id,
                product_id,
                quantity_sold,
                price_per_unit,
                total_amount,
                sale_date,
            ),
        )
        sale_id = cursor.lastrowid

    return get_sale_by_id(sale_id, store_id)
