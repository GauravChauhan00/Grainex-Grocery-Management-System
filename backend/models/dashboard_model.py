"""Read-only summary queries used by the dashboard with store_id isolation."""

from database.connection import database_connection


def get_dashboard_summary(store_id: int) -> dict:
    with database_connection() as connection:
        summary = connection.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM products WHERE store_id = ?) AS total_products,
                (SELECT COUNT(*) FROM categories WHERE store_id = ?) AS total_categories,
                (SELECT COUNT(*) FROM products
                    WHERE store_id = ? AND quantity > 0 AND quantity <= low_stock_threshold) AS low_stock_products,
                (SELECT COUNT(*) FROM products WHERE store_id = ? AND quantity = 0) AS out_of_stock_products,
                COALESCE((SELECT SUM(quantity * unit_price) FROM products WHERE store_id = ?), 0) AS inventory_value,
                COALESCE((SELECT SUM(total_amount) FROM sales WHERE store_id = ?), 0) AS total_sales,
                COALESCE((SELECT SUM(total_amount) FROM sales
                    WHERE store_id = ? AND date(sale_date) = date('now', 'localtime')), 0) AS sales_today,
                COALESCE((SELECT SUM(quantity_sold) FROM sales WHERE store_id = ?), 0) AS total_items_sold
            """,
            (
                store_id,
                store_id,
                store_id,
                store_id,
                store_id,
                store_id,
                store_id,
                store_id,
            ),
        ).fetchone()

        recent_sales = connection.execute(
            """
            SELECT
                s.id,
                p.product_name,
                s.quantity_sold,
                s.total_amount,
                s.sale_date
            FROM sales s
            JOIN products p ON p.id = s.product_id AND p.store_id = s.store_id
            WHERE s.store_id = ?
            ORDER BY s.sale_date DESC, s.id DESC
            LIMIT 6
            """,
            (store_id,),
        ).fetchall()

        low_stock_items = connection.execute(
            """
            SELECT
                p.id,
                p.product_name,
                c.name AS category,
                p.quantity,
                p.low_stock_threshold,
                CASE WHEN p.quantity = 0 THEN 'Out of Stock' ELSE 'Low Stock' END AS stock_status
            FROM products p
            JOIN categories c ON c.id = p.category_id AND c.store_id = p.store_id
            WHERE p.store_id = ? AND p.quantity <= p.low_stock_threshold
            ORDER BY p.quantity ASC, p.product_name COLLATE NOCASE
            LIMIT 6
            """,
            (store_id,),
        ).fetchall()

        sales_trend = connection.execute(
            """
            WITH RECURSIVE dates(day) AS (
                SELECT date('now', 'localtime', '-6 days')
                UNION ALL
                SELECT date(day, '+1 day') FROM dates WHERE day < date('now', 'localtime')
            )
            SELECT
                dates.day AS period,
                COALESCE(SUM(s.total_amount), 0) AS total
            FROM dates
            LEFT JOIN sales s ON date(s.sale_date) = dates.day AND s.store_id = ?
            GROUP BY dates.day
            ORDER BY dates.day
            """,
            (store_id,),
        ).fetchall()

        stock_distribution = connection.execute(
            """
            SELECT
                SUM(CASE WHEN quantity > low_stock_threshold THEN 1 ELSE 0 END) AS in_stock,
                SUM(CASE WHEN quantity > 0 AND quantity <= low_stock_threshold THEN 1 ELSE 0 END) AS low_stock,
                SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) AS out_of_stock
            FROM products
            WHERE store_id = ?
            """,
            (store_id,),
        ).fetchone()

    result = dict(summary)
    result["recent_sales"] = [dict(row) for row in recent_sales]
    result["low_stock_items"] = [dict(row) for row in low_stock_items]
    result["sales_trend"] = [dict(row) for row in sales_trend]
    # Ensure stock_distribution fields are not None if products are empty
    sd = dict(stock_distribution) if stock_distribution else {}
    result["stock_distribution"] = {
        "in_stock": sd.get("in_stock") or 0,
        "low_stock": sd.get("low_stock") or 0,
        "out_of_stock": sd.get("out_of_stock") or 0,
    }
    return result
