"""Pydantic schemas for Task Service — disesuaikan dengan backend monolith."""
from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import datetime
import json
import ast


# ================= TASK =================

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None
    folder_id: Optional[int] = None


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


class TaskResponse(TaskBase):
    id: int
    status: str
    owner_id: Optional[int] = None
    folder_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


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

    @field_validator('members', mode='before')
    @classmethod
    def parse_members(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

    class Config:
        from_attributes = True

    @field_validator('members', mode='before')
    def parse_members(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, dict):
                    return []
                return parsed if isinstance(parsed, list) else []
            except Exception:
                try:
                    parsed = ast.literal_eval(v)
                    return parsed if isinstance(parsed, list) else []
                except Exception:
                    return []
        return v if isinstance(v, list) else []
