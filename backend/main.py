import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from jose import jwt, JWTError

from config import (
    APP_TITLE,
    APP_VERSION,
    DEBUG,
    SECRET_KEY,
    ALGORITHM,
    ALLOWED_ORIGINS,
    DOCS_ENABLED,
    ENV,
)
from database import engine, Base, get_db
import crud
from schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    UserCreate, LoginRequest,
    FolderCreate, FolderUpdate, FolderResponse,
)
from auth import create_token

logger = logging.getLogger("sowel-api")

Base.metadata.create_all(bind=engine)

# ==================== APP INIT ====================
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    debug=DEBUG,
    docs_url="/docs" if DOCS_ENABLED else None,
    redoc_url="/redoc" if DOCS_ENABLED else None,
)

logger.info("Starting %s v%s [env=%s, debug=%s]", APP_TITLE, APP_VERSION, ENV, DEBUG)

# ==================== CORS ====================
if not ALLOWED_ORIGINS:
    logger.warning("CORS: ALLOWED_ORIGINS is empty. All cross-origin requests from frontend will be BLOCKED by browsers.")
elif "*" in ALLOWED_ORIGINS:
    logger.warning(
        "CORS WARNING: ALLOWED_ORIGINS contains '*' while allow_credentials=True is enabled. "
        "Browsers will block requests with credentials! "
        "Please specify your exact frontend URL (e.g., https://your-frontend.up.railway.app) in Railway environment variables."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== AUTH ====================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== ROOT & HEALTH ====================
@app.get("/")
def root():
    return {"message": "Sowel Task API running"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint — cek status semua komponen."""
    health = {
        "status": "healthy",
        "service": "backend",
        "version": "1.0.0",
    }

    # Cek database connection
    try:
        db.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception as e:
        health["status"] = "unhealthy"
        health["database"] = f"error: {str(e)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


@app.get("/team")
def team():
    return {
        "team": "cloud-team-sowelcloudspace",
        "members": [
            {
                "name": "Anjas Geofany Diamare",
                "nim": "10231016",
                "role": "Lead Backend",
            },
            {
                "name": "Cantika Ade Qutnindra Maharani",
                "nim": "10231024",
                "role": "Lead Frontend",
            },
            {
                "name": "Arya Wijaya Saroyo",
                "nim": "10231020",
                "role": "Lead DevOps",
            },
            {
                "name": "Meiske Handayani",
                "nim": "10231052",
                "role": "Lead QA & Docs",
            },
        ],
    }


# ==================== AUTH ENDPOINT ====================

@app.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.create_user(db, user)
    if not db_user:
        raise HTTPException(400, "Email already registered")
    return {
        "id": db_user.id,
        "email": db_user.email,
        "name": db_user.name,
    }


@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login menggunakan OAuth2 password flow.
    - username: isi dengan name/username user (bukan email)
    - password: isi dengan password
    Swagger UI Authorize button akan otomatis menggunakan form ini.
    """
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(401, "Username atau password salah")

    token = create_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


@app.get("/auth/me")
def get_me(db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    """Ambil profil user yang sedang login berdasarkan token."""
    user = crud.get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


# ==================== USER VERIFY ====================

@app.get("/users/verify/{username}")
def verify_username(username: str, db: Session = Depends(get_db)):
    """
    Verifikasi apakah username terdaftar di database (case-insensitive).
    Endpoint ini bersifat publik agar frontend bisa memvalidasi member folder
    sebelum menambahkannya.
    """
    user = crud.get_user_by_name(db, username)
    if not user:
        raise HTTPException(404, "Username tidak ditemukan")
    return {
        "exists": True,
        "user": {
            "id": user.id,
            "name": user.name,
        },
    }


# ==================== TASK (PROTECTED) ====================

def check_task_permission(task, user_id: int, db: Session, required_level: str = "read_write"):
    # 1. User is the task owner
    if task.owner_id == user_id:
        return

    # 2. Check folder-based access
    if task.folder_id is not None:
        from models import Folder, User
        import json
        folder = db.query(Folder).filter(Folder.id == task.folder_id).first()
        if folder:
            is_folder_owner = folder.owner_id == user_id
            
            is_folder_member = False
            if folder.type == "group":
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    try:
                        members = json.loads(folder.members or "[]")
                    except Exception:
                        members = []
                    is_folder_member = any(m.lower() == user.name.lower() for m in members)

            if is_folder_owner or is_folder_member:
                if required_level == "read_write":
                    return
                # Hanya pemilik task atau pemilik folder yang boleh menghapus
                if required_level == "admin" and is_folder_owner:
                    return

    raise HTTPException(status_code=403, detail="Tidak punya akses ke task ini")


# CREATE
@app.post("/tasks", response_model=TaskResponse)
def create(task: TaskCreate, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    if task.folder_id is not None:
        from models import Folder, User
        import json
        folder = db.query(Folder).filter(Folder.id == task.folder_id).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder tidak ditemukan")
        
        is_owner = folder.owner_id == int(user_id)
        is_member = False
        if folder.type == "group":
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                try:
                    members = json.loads(folder.members or "[]")
                except Exception:
                    members = []
                is_member = any(m.lower() == user.name.lower() for m in members)

        if not (is_owner or is_member):
            raise HTTPException(status_code=403, detail="Tidak memiliki akses ke folder ini")

    return crud.create_task(db, task, int(user_id))


# READ ALL
@app.get("/tasks")
def read_all(
    skip: int = 0,
    limit: int = 100,
    folder_id: int | None = None,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user),
):
    return crud.get_tasks(db, int(user_id), skip=skip, limit=limit, folder_id=folder_id)


# STATS
@app.get("/tasks/stats")
def stats(db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    tasks = crud.get_tasks(db, int(user_id))
    total = len(tasks)
    done = len([t for t in tasks if t.status == "done"])
    return {
        "total": total,
        "completed": done,
        "pending": total - done,
    }


# READ ONE
@app.get("/tasks/{task_id}", response_model=TaskResponse)
def read_one(task_id: int, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    check_task_permission(task, int(user_id), db, "read_write")
    return task


# UPDATE
@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    existing = crud.get_task(db, task_id)
    if not existing:
        raise HTTPException(404, "Task not found")
    check_task_permission(existing, int(user_id), db, "read_write")
    task = crud.update_task(db, task_id, data)
    return task


# DELETE
@app.delete("/tasks/{task_id}")
def delete(task_id: int, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    existing = crud.get_task(db, task_id)
    if not existing:
        raise HTTPException(404, "Task not found")
    check_task_permission(existing, int(user_id), db, "admin")
    crud.delete_task(db, task_id)
    return {"message": "Deleted"}


# COMPLETE TASK
@app.put("/tasks/{task_id}/complete")
def complete(task_id: int, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    existing = crud.get_task(db, task_id)
    if not existing:
        raise HTTPException(404, "Task not found")
    check_task_permission(existing, int(user_id), db, "read_write")
    task = crud.update_task(db, task_id, TaskUpdate(status="done"))
    return task


# ==================== FOLDER (PROTECTED) ====================

@app.post("/api/folders", response_model=FolderResponse)
def create_folder(
    data: FolderCreate,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user),
):
    """Buat folder baru. imageData (base64) disimpan langsung ke database."""
    result = crud.create_folder(db, data, int(user_id))
    return result


@app.get("/api/folders", response_model=list[FolderResponse])
def get_folders(
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user),
):
    """Ambil semua folder milik user yang sedang login."""
    return crud.get_folders_by_owner(db, int(user_id))


@app.get("/api/folders/{folder_id}", response_model=FolderResponse)
def get_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user),
):
    """Ambil detail satu folder."""
    folder = crud.get_folder(db, folder_id)
    if not folder:
        raise HTTPException(404, "Folder not found")
    return folder


@app.put("/api/folders/{folder_id}", response_model=FolderResponse)
def update_folder(
    folder_id: int,
    data: FolderUpdate,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user),
):
    """Update folder — termasuk imageData jika ada perubahan foto."""
    folder = crud.update_folder(db, folder_id, data, int(user_id))
    if not folder:
        raise HTTPException(404, "Folder not found")
    return folder


@app.delete("/api/folders/{folder_id}")
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id=Depends(get_current_user),
):
    """Hapus folder. Hanya owner yang boleh hapus."""
    if not crud.delete_folder(db, folder_id, int(user_id)):
        raise HTTPException(404, "Folder not found")
    return {"message": "Folder deleted"}

