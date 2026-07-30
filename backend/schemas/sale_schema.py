"""Pydantic schemas for sale transactions."""

from typing import Any
from pydantic import BaseModel, Field


class SaleCreateSchema(BaseModel):
    product_id: Any = Field(..., example=1)
    quantity_sold: Any = Field(..., example=2)
    sale_date: str | None = Field(default=None, example="2026-07-30")
