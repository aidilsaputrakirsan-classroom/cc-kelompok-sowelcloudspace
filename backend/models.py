from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
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
    visible_to = Column(Text, default="[]")               # JSON array string, e.g. '["Anjas","Cantika"]' — empty = semua member folder
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    folder_id = Column(Integer, ForeignKey("folders.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class Folder(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, default="personal")          # "personal" | "group"
    description = Column(Text, default="")
    members = Column(Text, default="[]")               # JSON array string, e.g. '["Cantika","Anjas"]'
    color = Column(String, default="sunset")
    image_data = Column(Text, default="")               # base64 data-URL string dari foto folder
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())