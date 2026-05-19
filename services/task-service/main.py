"""
Task Service — Handles task/todo management.
Microservice yang bertanggung jawab untuk:
- CRUD tasks (Create, Read, Update, Delete)
- Task statistics
- Task completion

Memvalidasi JWT token via auth-service sebelum memproses request.
Disesuaikan dengan backend monolith Sowel Task API yang sudah ada.
"""
import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx

from database import engine, get_db, Base
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse

# Create tables
Base.metadata.create_all(bind=engine)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("task-service")

app = FastAPI(
    title="Task Service",
    description="Task management microservice — CRUD tasks (Sowel Cloud)",
    version="2.0.0",
)

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

# Auth service URL untuk verifikasi token
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")


async def verify_token_via_auth(request: Request) -> str:
    """
    Dependency: Verifikasi JWT token dengan memanggil auth-service /auth/verify.
    Return user_id jika token valid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/auth/verify",
                headers={"Authorization": auth_header},
                timeout=5.0,
            )
        if response.status_code != 200:
            detail = response.json().get("detail", "Invalid token")
            raise HTTPException(status_code=401, detail=detail)

        data = response.json()
        return str(data["user_id"])

    except httpx.RequestError as e:
        logger.error("Cannot reach auth-service: %s", str(e))
        raise HTTPException(
            status_code=503,
            detail="Auth service unavailable"
        )


# =====================
# ENDPOINTS
# =====================

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint — cek status task-service dan database."""
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


# CREATE
@app.post("/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Membuat task baru."""
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


# READ ALL
@app.get("/tasks")
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Ambil semua tasks dengan pagination."""
    return db.query(Task).offset(skip).limit(limit).all()


# STATS
@app.get("/tasks/stats")
async def task_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Statistik task: total, completed, pending."""
    tasks = db.query(Task).all()
    total = len(tasks)
    done = len([t for t in tasks if t.status == "done"])
    return {
        "total": total,
        "completed": done,
        "pending": total - done,
    }


# READ ONE
@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Ambil task berdasarkan ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


# UPDATE
@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Update task berdasarkan ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


# DELETE
@app.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Hapus task berdasarkan ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Deleted"}


# COMPLETE TASK
@app.put("/tasks/{task_id}/complete")
async def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_token_via_auth),
):
    """Tandai task sebagai selesai (status=done)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    task.status = "done"
    db.commit()
    db.refresh(task)
    return task
