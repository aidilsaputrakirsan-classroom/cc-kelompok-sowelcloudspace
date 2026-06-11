"""Task model for Task Service — disesuaikan dengan model di backend monolith."""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="pending")
    priority = Column(String, default="medium")
    deadline = Column(DateTime, nullable=True)
    assigned_to = Column(String, nullable=True)
    owner_id = Column(Integer, nullable=True)
    folder_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, default="personal")          # "personal" | "group"
    description = Column(Text, default="")
    members = Column(Text, default="[]")               # JSON array string, e.g. '["Cantika","Anjas"]'
    color = Column(String, default="sunset")
    image_data = Column(Text, default="")              # base64 data-URL string dari foto folder
    owner_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
