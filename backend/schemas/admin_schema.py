"""Pydantic schemas for super admin actions."""

from pydantic import BaseModel, Field


class StoreStatusSchema(BaseModel):
    status: str = Field(..., example="active")
