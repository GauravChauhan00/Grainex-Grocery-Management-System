"""Read-only sales reporting queries with store_id data isolation."""

from database.connection import database_connection


def _date_conditions(
    store_id: int, start_date: str | None, end_date: str | None
) -> tuple[str, list[object]]:
    conditions: list[str] = ["s.store_id = ?"]
    parameters: list[object] = [store_id]

    if start_date:
        conditions.append("date(s.sale_date) >= date(?)")
        parameters.append(start_date)
    if end_date:
        conditions.append("date(s.sale_date) <= date(?)")
        parameters.append(end_date)

    where_clause = f"WHERE {' AND '.join(conditions)}"
    return where_clause, parameters


def get_sales_report(
    store_id: int,
    start_date: str | None,
    end_date: str | None,
    period: str,
) -> dict:
    where_clause, parameters = _date_conditions(store_id, start_date, end_date)

    period_expression = {
        "daily": "strftime('%Y-%m-%d', s.sale_date)",
        "weekly": "strftime('%Y-W%W', s.sale_date)",
        "monthly": "strftime('%Y-%m', s.sale_date)",
    }[period]

    with database_connection() as connection:
        summary = connection.execute(
            f"""
            SELECT
                COALESCE(SUM(s.total_amount), 0) AS total_sales,
                COUNT(s.id) AS total_transactions,
                COALESCE(SUM(s.quantity_sold), 0) AS total_items_sold,
                COALESCE(AVG(s.total_amount), 0) AS average_sale
            FROM sales s
            {where_clause}
            """,
            parameters,
        ).fetchone()

        trend = connection.execute(
            f"""
            SELECT
                {period_expression} AS period,
                ROUND(SUM(s.total_amount), 2) AS total,
                SUM(s.quantity_sold) AS items_sold,
                COUNT(s.id) AS transactions
            FROM sales s
            {where_clause}
            GROUP BY {period_expression}
            ORDER BY MIN(s.sale_date)
            """,
            parameters,
        ).fetchall()

        top_products = connection.execute(
            f"""
            SELECT
                p.id AS product_id,
                p.product_name,
                c.name AS category,
                SUM(s.quantity_sold) AS quantity_sold,
                ROUND(SUM(s.total_amount), 2) AS revenue
            FROM sales s
            JOIN products p ON p.id = s.product_id AND p.store_id = s.store_id
            JOIN categories c ON c.id = p.category_id AND c.store_id = s.store_id
            {where_clause}
            GROUP BY p.id, p.product_name, c.name
            ORDER BY quantity_sold DESC, revenue DESC
            LIMIT 5
            """,
            parameters,
        ).fetchall()

        history = connection.execute(
            f"""
            SELECT
                s.id,
                p.product_name,
                c.name AS category,
                s.quantity_sold,
                s.price_per_unit,
                s.total_amount,
                s.sale_date
            FROM sales s
            JOIN products p ON p.id = s.product_id AND p.store_id = s.store_id
            JOIN categories c ON c.id = p.category_id AND c.store_id = s.store_id
            {where_clause}
            ORDER BY s.sale_date DESC, s.id DESC
            LIMIT 500
            """,
            parameters,
        ).fetchall()

    return {
        "summary": dict(summary),
        "trend": [dict(row) for row in trend],
        "top_products": [dict(row) for row in top_products],
        "history": [dict(row) for row in history],
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
            "period": period,
        },
    }
