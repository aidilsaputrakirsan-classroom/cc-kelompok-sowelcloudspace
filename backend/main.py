import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from jose import jwt, JWTError
from dotenv import load_dotenv

from database import engine, Base, get_db
import crud
from schemas import TaskCreate, TaskUpdate, TaskResponse, UserCreate, LoginRequest
from auth import create_token

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sowel Task API")

# ==================== CONFIG ====================
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# ==================== CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(","),
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
    - username: isi dengan email
    - password: isi dengan password
    Swagger UI Authorize button akan otomatis menggunakan form ini.
    """
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(401, "Email atau password salah")

    token = create_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


# ==================== TASK (PROTECTED) ====================

# CREATE
@app.post("/tasks", response_model=TaskResponse)
def create(task: TaskCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.create_task(db, task)


# READ ALL
@app.get("/tasks")
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return crud.get_tasks(db, skip=skip, limit=limit)


# STATS
@app.get("/tasks/stats")
def stats(db: Session = Depends(get_db), user=Depends(get_current_user)):
    tasks = crud.get_tasks(db)
    total = len(tasks)
    done = len([t for t in tasks if t.status == "done"])
    return {
        "total": total,
        "completed": done,
        "pending": total - done,
    }


# READ ONE
@app.get("/tasks/{task_id}", response_model=TaskResponse)
def read_one(task_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task


# UPDATE
@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    task = crud.update_task(db, task_id, data)
    if not task:
        raise HTTPException(404, "Task not found")
    return task


# DELETE
@app.delete("/tasks/{task_id}")
def delete(task_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not crud.delete_task(db, task_id):
        raise HTTPException(404, "Task not found")
    return {"message": "Deleted"}


# COMPLETE TASK
@app.put("/tasks/{task_id}/complete")
def complete(task_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    task = crud.update_task(db, task_id, TaskUpdate(status="done"))
    return task

