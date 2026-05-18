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