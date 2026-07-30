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

from fastapi.testclient import TestClient  # noqa: E402
from app import create_app  # noqa: E402
from database.initialize import initialize_database  # noqa: E402
from utils.auth import generate_token  # noqa: E402


class GroceryApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = TestClient(cls.app)

        # Seeded store owner token (store_id = 1)
        cls.store_token = generate_token(
            {
                "store_id": 1,
                "role": "store_owner",
                "email": "owner@grainex.com",
                "name": "Seed Owner",
                "store_name": "Fresh Mart",
            }
        )
        cls.auth_headers = {"Authorization": f"Bearer {cls.store_token}"}

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
        self.assertEqual(health.json()["status"], "ok")

        dashboard = self.client.get(
            "/api/dashboard-summary", headers=self.auth_headers
        )
        self.assertEqual(dashboard.status_code, 200)
        summary = dashboard.json()["data"]
        self.assertGreater(summary["total_products"], 0)
        self.assertGreater(summary["total_categories"], 0)
        self.assertGreater(summary["total_sales"], 0)

    def test_category_and_product_crud(self):
        category_response = self.client.post(
            "/api/categories",
            json={
                "name": "Interview Test Category",
                "description": "Created by an API test",
            },
            headers=self.auth_headers,
        )
        self.assertEqual(category_response.status_code, 201)
        category = category_response.json()["data"]

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
            headers=self.auth_headers,
        )
        self.assertEqual(product_response.status_code, 201)
        product = product_response.json()["data"]
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
            headers=self.auth_headers,
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(
            update_response.json()["data"]["stock_status"], "Low Stock"
        )

        delete_product = self.client.delete(
            f"/api/products/{product['id']}", headers=self.auth_headers
        )
        self.assertEqual(delete_product.status_code, 200)
        delete_category = self.client.delete(
            f"/api/categories/{category['id']}", headers=self.auth_headers
        )
        self.assertEqual(delete_category.status_code, 200)

    def test_sale_reduces_stock_and_rejects_overselling(self):
        products_response = self.client.get(
            "/api/products?search=Bananas", headers=self.auth_headers
        )
        product = products_response.json()["data"][0]
        starting_quantity = product["quantity"]

        sale_response = self.client.post(
            "/api/sales",
            json={
                "product_id": product["id"],
                "quantity_sold": 2,
                "sale_date": "2026-06-23",
            },
            headers=self.auth_headers,
        )
        self.assertEqual(sale_response.status_code, 201)
        sale = sale_response.json()["data"]
        self.assertEqual(sale["quantity_sold"], 2)
        self.assertEqual(
            sale["total_amount"], round(product["unit_price"] * 2, 2)
        )

        updated_product = self.client.get(
            f"/api/products/{product['id']}", headers=self.auth_headers
        ).json()["data"]
        self.assertEqual(updated_product["quantity"], starting_quantity - 2)

        oversell_response = self.client.post(
            "/api/sales",
            json={"product_id": product["id"], "quantity_sold": 99999},
            headers=self.auth_headers,
        )
        self.assertEqual(oversell_response.status_code, 400)

        unchanged_product = self.client.get(
            f"/api/products/{product['id']}", headers=self.auth_headers
        ).json()["data"]
        self.assertEqual(unchanged_product["quantity"], starting_quantity - 2)

    def test_sales_report_and_history_protection(self):
        report_response = self.client.get(
            "/api/reports/sales?period=daily", headers=self.auth_headers
        )
        self.assertEqual(report_response.status_code, 200)
        report = report_response.json()["data"]
        self.assertGreater(len(report["history"]), 0)
        self.assertGreater(len(report["top_products"]), 0)

        sold_product_id = report["history"][0]["id"]
        sales = self.client.get(
            "/api/sales?limit=1", headers=self.auth_headers
        ).json()["data"]
        product_id = sales[0]["product_id"]
        protected_delete = self.client.delete(
            f"/api/products/{product_id}", headers=self.auth_headers
        )
        self.assertEqual(protected_delete.status_code, 409)
        self.assertIn("sale record", protected_delete.json()["message"])
        self.assertIsInstance(sold_product_id, int)


if __name__ == "__main__":
    unittest.main(verbosity=2)
