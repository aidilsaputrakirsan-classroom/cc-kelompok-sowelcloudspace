"""Pydantic schemas for Auth Service — disesuaikan dengan backend monolith."""
from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    # Validasi Email dengan regex (memastikan format user@domain.com)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")

    name: str

    # Validasi Password: Minimal 8 karakter
    password: str = Field(
        ...,
        min_length=8,
        description="Password minimal 8 karakter"
    )


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