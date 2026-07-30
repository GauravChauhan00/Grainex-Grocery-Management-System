"""Pydantic schemas for product management."""

from typing import Any
from pydantic import BaseModel, Field


class ProductSchema(BaseModel):
    product_name: str = Field(..., example="Organic Whole Milk 1L")
    category_id: Any = Field(..., example=1)
    quantity: Any = Field(default=0, example=50)
    unit_price: Any = Field(default=0.0, example=65.00)
    supplier_name: str | None = Field(default="", example="Amul Dairy")
    expiry_date: str | None = Field(default=None, example="2026-12-31")
    low_stock_threshold: Any = Field(default=10, example=10)
