"""Pydantic schemas for Auth Service — disesuaikan dengan backend monolith."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional


class UserCreate(BaseModel):
    # Validasi Email dengan regex (memastikan format user@domain.com)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")

    name: str = Field(..., max_length=200)

    # Validasi Password: Minimal 8 karakter
    password: str = Field(
        ...,
        min_length=8,
        description="Password minimal 8 karakter"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("Nama minimal 2 karakter")
        return v.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf besar")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return v


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenVerifyResponse(BaseModel):
    user_id: int