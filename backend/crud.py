from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Task, User, Folder
from passlib.context import CryptContext
import json

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==================== USER CRUD ====================

def create_user(db: Session, data):
    """Membuat user baru. Return None jika email atau name sudah terdaftar."""
    existing_email = db.query(User).filter(User.email == data.email).first()
    if existing_email:
        return None
    existing_name = db.query(User).filter(User.name == data.name).first()
    if existing_name:
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


def authenticate_user(db: Session, username: str, password: str):
    """Autentikasi user berdasarkan name (username). Return user jika valid, None jika tidak."""
    user = db.query(User).filter(User.name == username).first()
    if not user:
        return None
    if not pwd_context.verify(password[:72], user.hashed_password):
        return None
    return user


def get_user_by_id(db: Session, user_id: int):
    """Ambil user berdasarkan ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_name(db: Session, username: str):
    """Cari user berdasarkan name (username) secara case-insensitive."""
    return db.query(User).filter(func.lower(User.name) == username.lower()).first()


# ==================== TASK CRUD ====================


def create_task(db: Session, data, owner_id: int):
    """Buat task baru milik user tertentu."""
    task = Task(**data.model_dump(), owner_id=owner_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_tasks(db: Session, owner_id: int, skip: int = 0, limit: int = 100, folder_id: int | None = None):
    """Ambil semua task milik user tertentu. Opsional filter berdasarkan folder_id."""
    query = db.query(Task).filter(Task.owner_id == owner_id)
    if folder_id is not None:
        query = query.filter(Task.folder_id == folder_id)
    return query.offset(skip).limit(limit).all()

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


# ==================== FOLDER CRUD ====================


def _parse_members(raw: str) -> list[str]:
    """Parse JSON string members ke list. Fallback ke list kosong jika invalid."""
    try:
        parsed = json.loads(raw or "[]")
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def _folder_to_dict(folder: Folder) -> dict:
    """Konversi Folder model ke dict dengan members sebagai list (bukan JSON string)."""
    return {
        "id": folder.id,
        "name": folder.name,
        "type": folder.type,
        "description": folder.description or "",
        "members": _parse_members(folder.members),
        "color": folder.color or "sunset",
        "image_data": folder.image_data or "",
        "owner_id": folder.owner_id,
        "created_at": folder.created_at,
        "updated_at": folder.updated_at,
    }


def create_folder(db: Session, data, owner_id: int):
    """Buat folder baru milik user tertentu."""
    folder = Folder(
        name=data.name,
        type=data.type,
        description=data.description or "",
        members=json.dumps(data.members if data.members else []),
        color=data.color or "sunset",
        image_data=data.image_data or "",
        owner_id=owner_id,
    )
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return _folder_to_dict(folder)


def get_folders_by_owner(db: Session, owner_id: int):
    """Ambil semua folder milik user DAN folder dimana user terdaftar sebagai member."""
    # 1) Folder yang dimiliki (owner)
    owned_folders = db.query(Folder).filter(Folder.owner_id == owner_id).all()

    # 2) Folder group dimana user adalah member (berdasarkan nama)
    user = db.query(User).filter(User.id == owner_id).first()
    member_folders = []
    if user:
        group_folders = db.query(Folder).filter(
            Folder.type == "group",
            Folder.owner_id != owner_id,
        ).all()
        for f in group_folders:
            members = _parse_members(f.members)
            # Case-insensitive matching agar tidak rentan typo huruf besar/kecil
            if any(m.lower() == user.name.lower() for m in members):
                member_folders.append(f)

    # 3) Gabungkan dan deduplikasi berdasarkan id
    seen_ids = set()
    combined = []
    for f in owned_folders + member_folders:
        if f.id not in seen_ids:
            seen_ids.add(f.id)
            combined.append(f)

    return [_folder_to_dict(f) for f in combined]


def get_folder(db: Session, folder_id: int):
    """Ambil satu folder berdasarkan ID."""
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        return None
    return _folder_to_dict(folder)


def update_folder(db: Session, folder_id: int, data, owner_id: int):
    """Update folder. Hanya owner yang boleh update."""
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == owner_id).first()
    if not folder:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # Serialize members ke JSON string jika ada
    if "members" in update_data and update_data["members"] is not None:
        update_data["members"] = json.dumps(update_data["members"])

    # Rename image_data → image_data (field name sama di model dan schema)
    for key, value in update_data.items():
        setattr(folder, key, value)

    db.commit()
    db.refresh(folder)
    return _folder_to_dict(folder)


def delete_folder(db: Session, folder_id: int, owner_id: int):
    """Hapus folder. Hanya owner yang boleh hapus."""
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == owner_id).first()
    if not folder:
        return False
    db.delete(folder)
    db.commit()
    return True