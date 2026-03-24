import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


# ============================================================
# REGEX PATTERNS
# ============================================================
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
PASSWORD_UPPER_REGEX = r'[A-Z]'
PASSWORD_LOWER_REGEX = r'[a-z]'
PASSWORD_DIGIT_REGEX = r'[0-9]'
PASSWORD_SPECIAL_REGEX = r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]'


# ============================================================
# REUSABLE VALIDATORS
# ============================================================
def validate_email_format(value: str) -> str:
    """Validasi format email menggunakan regex."""
    if not re.match(EMAIL_REGEX, value):
        raise ValueError(
            'Format email tidak valid. Gunakan format yang benar, contoh: user@domain.com'
        )
    return value.lower().strip()


def validate_password_strength(value: str) -> str:
    """Validasi kekuatan password menggunakan regex."""
    if len(value) < 8:
        raise ValueError(
            'Password minimal 8 karakter'
        )
    if not re.search(PASSWORD_UPPER_REGEX, value):
        raise ValueError(
            'Password harus mengandung minimal 1 huruf besar (A-Z)'
        )
    if not re.search(PASSWORD_LOWER_REGEX, value):
        raise ValueError(
            'Password harus mengandung minimal 1 huruf kecil (a-z)'
        )
    if not re.search(PASSWORD_DIGIT_REGEX, value):
        raise ValueError(
            'Password harus mengandung minimal 1 angka (0-9)'
        )
    if not re.search(PASSWORD_SPECIAL_REGEX, value):
        raise ValueError(
            'Password harus mengandung minimal 1 karakter spesial (!@#$%^&* dll)'
        )
    return value


# ============================================================
# ITEM SCHEMAS
# ============================================================

# === BASE SCHEMA ===
class ItemBase(BaseModel):
    """Base schema — field yang dipakai untuk create & update."""
    name: str = Field(..., min_length=1, max_length=100, examples=["Laptop"])
    description: Optional[str] = Field(None, examples=["Laptop untuk cloud computing"])
    price: float = Field(..., gt=0, examples=[15000000])
    quantity: int = Field(0, ge=0, examples=[10])


# === CREATE SCHEMA (untuk POST request) ===
class ItemCreate(ItemBase):
    """Schema untuk membuat item baru. Mewarisi semua field dari ItemBase."""
    pass


# === UPDATE SCHEMA (untuk PUT request) ===
class ItemUpdate(BaseModel):
    """
    Schema untuk update item. Semua field optional 
    karena user mungkin hanya ingin update sebagian field.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)


# === RESPONSE SCHEMA (untuk output) ===
class ItemResponse(ItemBase):
    """Schema untuk response. Termasuk id dan timestamp dari database."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Agar bisa convert dari SQLAlchemy model


# === LIST RESPONSE (dengan metadata) ===
class ItemListResponse(BaseModel):
    """Schema untuk response list items dengan total count."""
    total: int
    items: list[ItemResponse]


# === STATS RESPONSE ===
class ItemStatsResponse(BaseModel):
    """Schema untuk response statistik items."""
    total_items: int = Field(..., description="Jumlah total item")
    total_quantity: int = Field(..., description="Jumlah total stok semua item")
    average_price: float = Field(..., description="Rata-rata harga item")
    min_price: float = Field(..., description="Harga item termurah")
    max_price: float = Field(..., description="Harga item termahal")
    total_value: float = Field(..., description="Total nilai inventori (price × quantity)")


# ============================================================
# AUTH SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    """Schema untuk registrasi user baru."""
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100, examples=["Aidil Saputra"])
    password: str = Field(
        ...,
        min_length=8,
        examples=["P@ssword123"],
        description="Minimal 8 karakter, harus mengandung huruf besar, huruf kecil, angka, dan karakter spesial",
    )

    @field_validator('email')
    @classmethod
    def check_email_format(cls, v: str) -> str:
        return validate_email_format(v)

    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        return validate_password_strength(v)


class UserResponse(BaseModel):
    """Schema untuk response user (tanpa password)."""
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema untuk login request."""
    email: str = Field(..., examples=["user@student.itk.ac.id"])
    password: str = Field(..., examples=["P@ssword123"])

    @field_validator('email')
    @classmethod
    def check_email_format(cls, v: str) -> str:
        return validate_email_format(v)


class TokenResponse(BaseModel):
    """Schema untuk response setelah login berhasil."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse