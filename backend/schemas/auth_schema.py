"""Pydantic schemas for authentication and user account operations."""

from pydantic import BaseModel, EmailStr, Field


class RegisterStoreSchema(BaseModel):
    store_name: str = Field(..., example="Grainex Fresh Mart")
    owner_name: str = Field(..., example="Gaurav Chauhan")
    email: str = Field(..., example="owner@example.com")
    phone: str | None = Field(default="", example="9876543210")
    password: str = Field(..., example="securepassword")


class LoginSchema(BaseModel):
    email: str = Field(..., example="owner@example.com")
    password: str = Field(..., example="securepassword")


class ForgotPasswordSchema(BaseModel):
    email: str = Field(..., example="owner@example.com")


class ContactSchema(BaseModel):
    name: str = Field(..., example="John Doe")
    email: str = Field(..., example="john@example.com")
    message: str = Field(..., example="Great application!")
