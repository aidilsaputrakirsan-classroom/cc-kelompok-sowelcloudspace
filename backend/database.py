from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import DATABASE_URL as _DATABASE_URL

# Ensure SQLAlchemy uses psycopg v3 driver instead of psycopg2
_db_url = _DATABASE_URL
if _db_url and _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(_db_url)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()