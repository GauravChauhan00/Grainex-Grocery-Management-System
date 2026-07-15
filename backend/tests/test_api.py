"""Beginner-readable integration tests for the most important API flows."""

import os
import sys
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
TEST_DATABASE = BACKEND_DIR / "tests" / "test_grocery.db"

# config.py reads this environment variable while app.py is imported.
os.environ["GROCERY_DB_PATH"] = str(TEST_DATABASE)
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402
from database.initialize import initialize_database  # noqa: E402


class GroceryApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app({"TESTING": True})
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        if TEST_DATABASE.exists():
            TEST_DATABASE.unlink()

    def setUp(self):
        # Every test starts with the same predictable demo records.
        initialize_database(force_reset=True)

    def test_health_and_seeded_dashboard(self):
        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.get_json()["status"], "ok")

        dashboard = self.client.get("/api/dashboard-summary")
        self.assertEqual(dashboard.status_code, 200)
        summary = dashboard.get_json()["data"]
        self.assertGreater(summary["total_products"], 0)
        self.assertGreater(summary["total_categories"], 0)
        self.assertGreater(summary["total_sales"], 0)

    def test_category_and_product_crud(self):
        category_response = self.client.post(
            "/api/categories",
            json={"name": "Interview Test Category", "description": "Created by an API test"},
        )
        self.assertEqual(category_response.status_code, 201)
        category = category_response.get_json()["data"]

        product_response = self.client.post(
            "/api/products",
            json={
                "product_name": "Interview Test Product",
                "category_id": category["id"],
                "quantity": 20,
                "unit_price": 99.5,
                "supplier_name": "Test Supplier",
                "expiry_date": None,
                "low_stock_threshold": 5,
            },
        )
        self.assertEqual(product_response.status_code, 201)
        product = product_response.get_json()["data"]
        self.assertEqual(product["stock_status"], "In Stock")

        update_response = self.client.put(
            f"/api/products/{product['id']}",
            json={
                "product_name": "Interview Test Product Updated",
                "category_id": category["id"],
                "quantity": 4,
                "unit_price": 105,
                "supplier_name": "Test Supplier",
                "expiry_date": None,
                "low_stock_threshold": 5,
            },
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.get_json()["data"]["stock_status"], "Low Stock")

        delete_product = self.client.delete(f"/api/products/{product['id']}")
        self.assertEqual(delete_product.status_code, 200)
        delete_category = self.client.delete(f"/api/categories/{category['id']}")
        self.assertEqual(delete_category.status_code, 200)

    def test_sale_reduces_stock_and_rejects_overselling(self):
        products_response = self.client.get("/api/products?search=Bananas")
        product = products_response.get_json()["data"][0]
        starting_quantity = product["quantity"]

        sale_response = self.client.post(
            "/api/sales",
            json={"product_id": product["id"], "quantity_sold": 2, "sale_date": "2026-06-23"},
        )
        self.assertEqual(sale_response.status_code, 201)
        sale = sale_response.get_json()["data"]
        self.assertEqual(sale["quantity_sold"], 2)
        self.assertEqual(sale["total_amount"], round(product["unit_price"] * 2, 2))

        updated_product = self.client.get(f"/api/products/{product['id']}").get_json()["data"]
        self.assertEqual(updated_product["quantity"], starting_quantity - 2)

        oversell_response = self.client.post(
            "/api/sales",
            json={"product_id": product["id"], "quantity_sold": 99999},
        )
        self.assertEqual(oversell_response.status_code, 400)

        unchanged_product = self.client.get(f"/api/products/{product['id']}").get_json()["data"]
        self.assertEqual(unchanged_product["quantity"], starting_quantity - 2)

    def test_sales_report_and_history_protection(self):
        report_response = self.client.get("/api/reports/sales?period=daily")
        self.assertEqual(report_response.status_code, 200)
        report = report_response.get_json()["data"]
        self.assertGreater(len(report["history"]), 0)
        self.assertGreater(len(report["top_products"]), 0)

        sold_product_id = report["history"][0]["id"]
        # Use the real product id from the sale endpoint response.
        sales = self.client.get("/api/sales?limit=1").get_json()["data"]
        product_id = sales[0]["product_id"]
        protected_delete = self.client.delete(f"/api/products/{product_id}")
        self.assertEqual(protected_delete.status_code, 409)
        self.assertIn("sale record", protected_delete.get_json()["message"])
        self.assertIsInstance(sold_product_id, int)


if __name__ == "__main__":
    unittest.main(verbosity=2)
