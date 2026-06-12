"""
Task Service — Handles task/todo and folder management.
Microservice yang bertanggung jawab untuk:
- CRUD tasks (Create, Read, Update, Delete)
- CRUD folders
- Task statistics
- Task completion

Validasi JWT token dilakukan secara lokal (stateless) menggunakan SECRET_KEY.
Disesuaikan dengan backend monolith Sowel Task API yang sudah ada.
"""
import os
import time
import json
import logging
import secrets
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from jose import jwt, JWTError
import httpx

from database import engine, get_db, Base
from models import Task, Folder
from schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    FolderCreate, FolderUpdate, FolderResponse
)

# Create tables
Base.metadata.create_all(bind=engine)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("task-service")

app = FastAPI(
    title="Task Service",
    description="Task management microservice — CRUD tasks & folders (Sowel Cloud)",
    version="2.0.0",
)

# In-memory metrics storage
METRICS = {
    "total_requests": 0,
    "error_requests": 0,
    "total_latency": 0.0,
    "start_time": time.time(),
}

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    path = request.url.path
    if path in ["/metrics", "/health", "/tasks/health", "/tasks/metrics"]:
        return await call_next(request)

    METRICS["total_requests"] += 1
    start_time = time.time()
    try:
        response = await call_next(request)
        latency = time.time() - start_time
        METRICS["total_latency"] += latency
        if response.status_code >= 400:
            METRICS["error_requests"] += 1
        return response
    except Exception as e:
        METRICS["error_requests"] += 1
        raise e

# CORS
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = secrets.token_urlsafe(32)
    logger.warning("SECRET_KEY is not set; using an ephemeral development key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")

async def verify_token_local(request: Request) -> str:
    """Dependency: Verifikasi JWT token secara lokal."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split("Bearer ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return str(user_id)
    except JWTError as e:
        if "expired" in str(e).lower():
            raise HTTPException(status_code=401, detail="Token expired")
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_token_optional(request: Request) -> str | None:
    """Dependency: Verifikasi JWT token secara lokal, tapi tidak throw error jika gagal (graceful degradation)."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split("Bearer ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return str(user_id) if user_id else None
    except Exception:
        return None

async def get_user_name(user_id: int, request: Request) -> str:
    """Helper untuk mengambil nama user dari auth-service (hanya dipanggil saat butuh validasi group folder)."""
    auth_header = request.headers.get("Authorization")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{AUTH_SERVICE_URL}/auth/me", headers={"Authorization": auth_header}, timeout=5.0)
            if resp.status_code == 200:
                return resp.json().get("name", "")
    except Exception:
        pass
    return ""

async def check_task_permission(task: Task, user_id: int, db: Session, request: Request, required_level: str = "read_write"):
    if task.owner_id == user_id:
        return

    if task.folder_id is not None:
        folder = db.query(Folder).filter(Folder.id == task.folder_id).first()
        if folder:
            is_folder_owner = folder.owner_id == user_id
            is_folder_member = False
            if folder.type == "group":
                user_name = await get_user_name(user_id, request)
                if user_name:
                    try:
                        members = json.loads(folder.members or "[]")
                    except Exception:
                        members = []
                    is_folder_member = any(m.lower() == user_name.lower() for m in members)

            if is_folder_owner or is_folder_member:
                if required_level == "read_write":
                    return
                if required_level == "admin" and is_folder_owner:
                    return

    raise HTTPException(status_code=403, detail="Tidak punya akses ke task ini")


# =====================
# ENDPOINTS - HEALTH
# =====================

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    health = {
        "status": "healthy",
        "service": "task-service",
        "version": "2.0.0",
    }
    try:
        db.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception as e:
        health["status"] = "unhealthy"
        health["database"] = f"error: {str(e)}"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


@app.get("/metrics")
def get_metrics():
    uptime = time.time() - METRICS["start_time"]
    total = METRICS["total_requests"]
    errors = METRICS["error_requests"]
    avg_latency = (METRICS["total_latency"] / total) * 1000 if total > 0 else 0.0
    error_rate = (errors / total) * 100.0 if total > 0 else 0.0

    return {
        "status": "healthy",
        "requests": {
            "total": total,
            "success": total - errors,
            "failed": errors
        },
        "error_rate": round(error_rate, 2),
        "avg_latency_ms": round(avg_latency, 2),
        "uptime_seconds": int(uptime)
    }


# =====================
# ENDPOINTS - FOLDERS
# =====================

@app.post("/api/folders", response_model=FolderResponse)
async def create_folder(
    data: FolderCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    uid = int(user_id)
    folder_data = data.model_dump()
    if isinstance(folder_data.get("members"), list):
        folder_data["members"] = json.dumps(folder_data["members"])
    db_folder = Folder(**folder_data, owner_id=uid)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

@app.get("/api/folders", response_model=list[FolderResponse])
async def get_folders(
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
    request: Request = None,
):
    uid = int(user_id)
    folders = db.query(Folder).filter(Folder.owner_id == uid).all()
    # Handle group folders
    user_name = await get_user_name(uid, request)
    if user_name:
        all_group_folders = db.query(Folder).filter(Folder.type == "group").all()
        for gf in all_group_folders:
            if gf.owner_id == uid: continue
            try:
                members = json.loads(gf.members or "[]")
                if any(m.lower() == user_name.lower() for m in members):
                    folders.append(gf)
            except Exception:
                pass
    return folders

@app.get("/api/folders/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
    request: Request = None,
):
    uid = int(user_id)
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(404, "Folder not found")
    
    is_owner = folder.owner_id == uid
    is_member = False
    if folder.type == "group":
        user_name = await get_user_name(uid, request)
        if user_name:
            try:
                members = json.loads(folder.members or "[]")
                is_member = any(m.lower() == user_name.lower() for m in members)
            except Exception:
                pass
    
    if not (is_owner or is_member):
        raise HTTPException(403, "Tidak memiliki akses ke folder ini")
        
    return folder

@app.put("/api/folders/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: int,
    data: FolderUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    uid = int(user_id)
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == uid).first()
    if not folder:
        raise HTTPException(404, "Folder not found atau anda bukan owner")

    update_data = data.model_dump(exclude_unset=True)
    if "members" in update_data and isinstance(update_data["members"], list):
        update_data["members"] = json.dumps(update_data["members"])
    for key, value in update_data.items():
        setattr(folder, key, value)
    db.commit()
    db.refresh(folder)
    return folder

@app.delete("/api/folders/{folder_id}")
async def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    uid = int(user_id)
    folder = db.query(Folder).filter(Folder.id == folder_id, Folder.owner_id == uid).first()
    if not folder:
        raise HTTPException(404, "Folder not found atau anda bukan owner")
    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted"}


# =====================
# ENDPOINTS - TASKS
# =====================

@app.post("/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    uid = int(user_id)
    if task.folder_id is not None:
        folder = db.query(Folder).filter(Folder.id == task.folder_id).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder tidak ditemukan")
        
        is_owner = folder.owner_id == uid
        is_member = False
        if folder.type == "group":
            user_name = await get_user_name(uid, request)
            if user_name:
                try:
                    members = json.loads(folder.members or "[]")
                    is_member = any(m.lower() == user_name.lower() for m in members)
                except Exception:
                    pass

        if not (is_owner or is_member):
            raise HTTPException(status_code=403, detail="Tidak memiliki akses ke folder ini")

    db_task = Task(**task.model_dump(), owner_id=uid)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.get("/tasks")
async def read_tasks(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    folder_id: int | None = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    uid = int(user_id)
    query = db.query(Task)
    
    if folder_id is not None:
        query = query.filter(Task.folder_id == folder_id)
        # Auth check will be applied later conceptually, 
        # but since we filter by folder we should ensure they have access to folder
        folder = db.query(Folder).filter(Folder.id == folder_id).first()
        if folder:
            is_owner = folder.owner_id == uid
            is_member = False
            if folder.type == "group":
                user_name = await get_user_name(uid, request)
                if user_name:
                    try:
                        members = json.loads(folder.members or "[]")
                        is_member = any(m.lower() == user_name.lower() for m in members)
                    except Exception:
                        pass
            if not (is_owner or is_member):
                return [] # No access
    else:
        # Fetching all tasks user has access to
        # 1. Tasks they own
        # 2. Tasks in group folders they are a member of
        user_name = await get_user_name(uid, request)
        group_folder_ids = []
        if user_name:
            all_group_folders = db.query(Folder).filter(Folder.type == "group").all()
            for gf in all_group_folders:
                try:
                    members = json.loads(gf.members or "[]")
                    if any(m.lower() == user_name.lower() for m in members):
                        group_folder_ids.append(gf.id)
                except Exception:
                    pass
        query = query.filter((Task.owner_id == uid) | (Task.folder_id.in_(group_folder_ids)))

    return query.offset(skip).limit(limit).all()


@app.get("/tasks/stats")
async def task_stats(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str | None = Depends(verify_token_optional),
):
    if user_id is None:
        # Graceful degradation fallback
        return {
            "total": 0,
            "completed": 0,
            "pending": 0,
        }

    uid = int(user_id)
    # Similar filtering logic as read_tasks
    query = db.query(Task)
    user_name = await get_user_name(uid, request)
    group_folder_ids = []
    if user_name:
        all_group_folders = db.query(Folder).filter(Folder.type == "group").all()
        for gf in all_group_folders:
            try:
                members = json.loads(gf.members or "[]")
                if any(m.lower() == user_name.lower() for m in members):
                    group_folder_ids.append(gf.id)
            except Exception:
                pass
    query = query.filter((Task.owner_id == uid) | (Task.folder_id.in_(group_folder_ids)))
    
    tasks = query.all()
    total = len(tasks)
    done = len([t for t in tasks if t.status == "done"])
    return {
        "total": total,
        "completed": done,
        "pending": total - done,
    }


@app.get("/tasks/public", response_model=list[TaskResponse])
async def get_public_tasks(
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Endpoint publik yang tidak membutuhkan otentikasi."""
    return db.query(Task).limit(limit).all()


@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def read_task(
    task_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    await check_task_permission(task, int(user_id), db, request, "read_write")
    return task


@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    await check_task_permission(task, int(user_id), db, request, "read_write")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    await check_task_permission(task, int(user_id), db, request, "admin")
    
    db.delete(task)
    db.commit()
    return {"message": "Deleted"}


@app.put("/tasks/{task_id}/complete")
async def complete_task(
    task_id: int,
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_local),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    await check_task_permission(task, int(user_id), db, request, "read_write")
    
    task.status = "done"
    db.commit()
    db.refresh(task)
    return task
