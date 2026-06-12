"""
Auth Service — Handles authentication and user management.
Microservice yang bertanggung jawab untuk:
- User registration
- User login (JWT token generation via OAuth2 password flow)
- Token verification (dipanggil oleh service lain)
- User profile (get current user)

Disesuaikan dengan backend monolith Sowel Task API yang sudah ada.
"""
import os
import logging
import secrets
from datetime import datetime, timedelta, timezone
import time
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from passlib.context import CryptContext
from jose import jwt, JWTError

from database import engine, get_db, Base
from models import User
from schemas import (
    UserCreate, UserResponse, LoginRequest,
    TokenResponse, TokenVerifyResponse
)

# Create tables
Base.metadata.create_all(bind=engine)

from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics

# Setup structured logging
setup_logging()
logger = logging.getLogger("auth-service")

app = FastAPI(
    title="Auth Service",
    description="Authentication microservice — register, login, verify tokens (Sowel Cloud)",
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
    if path in ["/metrics", "/health", "/auth/health", "/auth/metrics"]:
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

# Logging middleware (setelah CORS)
app.add_middleware(RequestLoggingMiddleware)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config — harus sama dengan yang dipakai di monolith
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = secrets.token_urlsafe(32)
    logger.warning("SECRET_KEY is not set; using an ephemeral development key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# OAuth2 scheme (untuk Swagger UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_access_token(data: dict) -> str:
    """Membuat JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode dan validasi JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency untuk mendapatkan user_id dari token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# =====================
# ENDPOINTS
# =====================

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint — cek status auth-service dan database."""
    health = {
        "status": "healthy",
        "service": "auth-service",
        "version": "2.0.0",
    }
    try:
        db.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception as e:
        health["status"] = "unhealthy"
        health["database"] = f"error: {str(e)}"

    status_code = 200 if health["status"] == "healthy" else 503
    from fastapi.responses import JSONResponse
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


@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register user baru."""
    # Check duplicate email
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check duplicate name
    existing_name = db.query(User).filter(User.name == user_data.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=pwd_context.hash(user_data.password[:72]),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login menggunakan OAuth2 password flow.
    - username: isi dengan name/username user (bukan email)
    - password: isi dengan password
    Swagger UI Authorize button akan otomatis menggunakan form ini.
    """
    # Autentikasi berdasarkan name (username), sama seperti monolith
    user = db.query(User).filter(User.name == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password[:72], user.hashed_password):
        raise HTTPException(status_code=401, detail="Username atau password salah")

    token = create_access_token({
        "sub": str(user.id),
    })
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
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


@app.get("/auth/verify", response_model=TokenVerifyResponse)
def verify_token(authorization: str = Header(...)):
    """
    Verifikasi JWT token — dipanggil oleh service lain (task-service).
    Service lain mengirim header: Authorization: Bearer <token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split("Bearer ")[1]
    payload = decode_token(token)

    return TokenVerifyResponse(
        user_id=int(payload["sub"]),
    )


@app.get("/users/verify/{username}")
def verify_username(username: str, db: Session = Depends(get_db)):
    """Cek apakah username terdaftar untuk fitur member folder."""
    user = db.query(User).filter(User.name == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "exists": True,
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


@app.get("/metrics")
def get_metrics():
    """Return application metrics."""
    return {
        "service": "auth-service",
        **metrics.get_metrics(),
    }
