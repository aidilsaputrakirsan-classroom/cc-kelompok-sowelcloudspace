from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ================= TASK =================

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ================= AUTH =================

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