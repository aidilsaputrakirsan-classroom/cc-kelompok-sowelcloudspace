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


def _parse_visible_to(raw) -> list[str]:
    """Parse visible_to dari Task model (bisa string JSON atau list)."""
    if isinstance(raw, list):
        return raw
    try:
        parsed = json.loads(raw or "[]")
        return parsed if isinstance(parsed, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def _task_to_dict(task: Task) -> dict:
    """Konversi Task model ke dict dengan visible_to sebagai list."""
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "deadline": task.deadline,
        "assigned_to": task.assigned_to,
        "visible_to": _parse_visible_to(task.visible_to),
        "owner_id": task.owner_id,
        "folder_id": task.folder_id,
        "created_at": task.created_at,
    }


def create_task(db: Session, data, owner_id: int):
    """Buat task baru milik user tertentu."""
    task_data = data.model_dump()
    # Serialize visible_to list ke JSON string untuk disimpan di DB
    if "visible_to" in task_data and task_data["visible_to"] is not None:
        task_data["visible_to"] = json.dumps(task_data["visible_to"])
    else:
        task_data["visible_to"] = "[]"
    task = Task(**task_data, owner_id=owner_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_to_dict(task)

def get_tasks(db: Session, owner_id: int, skip: int = 0, limit: int = 100, folder_id: int | None = None):
    """Ambil semua task milik user atau task yang ada di folder yang bisa diakses user.
    Task dengan visible_to yang diisi hanya muncul untuk user yang ada di list tsb + owner task."""
    from sqlalchemy import or_
    folders = get_folders_by_owner(db, owner_id)
    accessible_folder_ids = [f["id"] for f in folders]

    query = db.query(Task).filter(
        or_(
            Task.owner_id == owner_id,
            Task.folder_id.in_(accessible_folder_ids) if accessible_folder_ids else False
        )
    )
    if folder_id is not None:
        if folder_id in accessible_folder_ids:
            query = query.filter(Task.folder_id == folder_id)
        else:
            return []

    all_tasks = query.offset(skip).limit(limit).all()

    # Filter berdasarkan visible_to: jika visible_to tidak kosong,
    # hanya owner task dan user yang ada di list yang bisa lihat
    user = db.query(User).filter(User.id == owner_id).first()
    username = user.name if user else ""

    filtered = []
    for task in all_tasks:
        visible_list = _parse_visible_to(task.visible_to)
        if not visible_list:
            # visible_to kosong = semua member folder bisa lihat
            filtered.append(task)
        elif task.owner_id == owner_id:
            # Owner task selalu bisa lihat
            filtered.append(task)
        elif any(v.lower() == username.lower() for v in visible_list):
            # User ada di visible_to list
            filtered.append(task)
        # else: user tidak ada di visible_to, skip task ini

    return [_task_to_dict(t) for t in filtered]

def get_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    return _task_to_dict(task)

def update_task(db: Session, task_id: int, data):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    update_data = data.model_dump(exclude_unset=True)
    # Serialize visible_to list ke JSON string
    if "visible_to" in update_data and update_data["visible_to"] is not None:
        update_data["visible_to"] = json.dumps(update_data["visible_to"])
    for key, value in update_data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return _task_to_dict(task)

def delete_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
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