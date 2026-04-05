from sqlalchemy.orm import Session
from models import Task, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==================== USER CRUD ====================

def create_user(db: Session, data):
    """Membuat user baru. Return None jika email sudah terdaftar."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        return None
    user = User(
        email=data.email,
        name=data.name,
        hashed_password=pwd_context.hash(data.password[:72]),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    """Autentikasi user. Return user jika valid, None jika tidak."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not pwd_context.verify(password[:72], user.hashed_password):
        return None
    return user


# ==================== TASK CRUD ====================


def create_task(db: Session, data):
    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_tasks(db: Session):
    return db.query(Task).all()

def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

def update_task(db: Session, task_id: int, data):
    task = get_task(db, task_id)
    if not task:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    task = get_task(db, task_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True