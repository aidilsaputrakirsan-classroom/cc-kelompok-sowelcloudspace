from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

# ================= TASK =================

class TaskBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    priority: str = "medium"
    deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None
    folder_id: Optional[int] = None
    visible_to: List[str] = Field(default_factory=list)  # kosong = semua member folder bisa lihat

    @field_validator("title")
    @classmethod
    def validate_title(cls, v):
        if len(v.strip()) < 1:
            raise ValueError("Judul tidak boleh kosong")
        return v.strip()

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None
    folder_id: Optional[int] = None
    visible_to: Optional[List[str]] = None

class TaskResponse(TaskBase):
    id: int
    status: str
    owner_id: Optional[int] = None
    folder_id: Optional[int] = None
    visible_to: List[str] = Field(default_factory=list)
    created_at: datetime

    model_config = {"from_attributes": True}


# ================= AUTH =================

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

class LoginRequest(BaseModel):
    email: str
    password: str


# ================= FOLDER =================

class FolderCreate(BaseModel):
    name: str
    type: str = "personal"
    description: str = ""
    members: list[str] = []
    color: str = "sunset"
    image_data: str = ""           # base64 data-URL string

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 1:
            raise ValueError("Nama folder tidak boleh kosong")
        if len(v) > 100:
            raise ValueError("Nama folder maksimal 100 karakter")
        return v.strip()

class FolderUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    members: Optional[list[str]] = None
    color: Optional[str] = None
    image_data: Optional[str] = None

class FolderResponse(BaseModel):
    id: int
    name: str
    type: str
    description: str
    members: list[str]
    color: str
    image_data: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True