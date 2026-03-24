from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models import Item, User
from schemas import ItemCreate, ItemUpdate, UserCreate
from auth import hash_password, verify_password


def create_item(db: Session, item_data: ItemCreate) -> Item:
    """Buat item baru di database."""
    db_item = Item(**item_data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_items(db: Session, skip: int = 0, limit: int = 20, search: str = None):
    """
    Ambil daftar items dengan pagination & search.
    - skip: jumlah data yang di-skip (untuk pagination)
    - limit: jumlah data per halaman
    - search: cari berdasarkan nama atau deskripsi
    """
    query = db.query(Item)
    
    if search:
        query = query.filter(
            or_(
                Item.name.ilike(f"%{search}%"),
                Item.description.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}


def get_item(db: Session, item_id: int) -> Item | None:
    """Ambil satu item berdasarkan ID."""
    return db.query(Item).filter(Item.id == item_id).first()


def update_item(db: Session, item_id: int, item_data: ItemUpdate) -> Item | None:
    """
    Update item berdasarkan ID.
    Hanya update field yang dikirim (bukan None).
    """
    db_item = db.query(Item).filter(Item.id == item_id).first()
    
    if not db_item:
        return None
    
    # Hanya update field yang dikirim (exclude_unset=True)
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int) -> bool:
    """Hapus item berdasarkan ID. Return True jika berhasil."""
    db_item = db.query(Item).filter(Item.id == item_id).first()
    
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True


def get_item_stats(db: Session) -> dict:
    """Hitung statistik item: total, quantity, harga rata-rata/min/max, total value."""
    total_items = db.query(func.count(Item.id)).scalar() or 0

    if total_items == 0:
        return {
            "total_items": 0,
            "total_quantity": 0,
            "average_price": 0.0,
            "min_price": 0.0,
            "max_price": 0.0,
            "total_value": 0.0,
        }

    stats = db.query(
        func.sum(Item.quantity).label("total_quantity"),
        func.avg(Item.price).label("average_price"),
        func.min(Item.price).label("min_price"),
        func.max(Item.price).label("max_price"),
        func.sum(Item.price * Item.quantity).label("total_value"),
    ).first()

    return {
        "total_items": total_items,
        "total_quantity": int(stats.total_quantity or 0),
        "average_price": round(float(stats.average_price or 0), 2),
        "min_price": float(stats.min_price or 0),
        "max_price": float(stats.max_price or 0),
        "total_value": float(stats.total_value or 0),
    }


# ==================== USER CRUD ====================

def create_user(db: Session, user_data: UserCreate) -> User:
    """Buat user baru dengan password yang di-hash."""
    # Cek apakah email sudah terdaftar
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None  # Email sudah dipakai

    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Autentikasi user: cek email & password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user