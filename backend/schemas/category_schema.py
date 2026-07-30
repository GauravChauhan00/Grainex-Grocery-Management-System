"""Pydantic schemas for category management."""

from pydantic import BaseModel, Field


class CategorySchema(BaseModel):
    name: str = Field(..., example="Dairy & Eggs")
    description: str | None = Field(default="", example="Fresh dairy products, eggs, butter, cheese.")
