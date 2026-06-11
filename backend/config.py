"""
config.py — Konfigurasi berbasis environment untuk Sowel Task API.

Semua config dibaca dari environment variables dengan default values,
sehingga app tidak crash jika env var missing.

Environment:
  - ENV=development  → DEBUG aktif, CORS permissive, log level DEBUG
  - ENV=production   → DEBUG mati, CORS strict, log level WARNING
"""

import os
import logging
from dotenv import load_dotenv

# Load .env file (tidak error jika file tidak ada)
load_dotenv()


# ==================== ENVIRONMENT ====================
# "development" atau "production"
ENV: str = os.getenv("ENV", "development")
IS_PRODUCTION: bool = ENV.lower() == "production"

# ==================== DEBUG ====================
# Di production, DEBUG selalu False kecuali di-override secara eksplisit
DEBUG: bool = os.getenv("DEBUG", str(not IS_PRODUCTION)).lower() in ("true", "1", "yes")

# ==================== APP INFO ====================
APP_TITLE: str = os.getenv("APP_TITLE", "Sowel Task API")
APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")

# ==================== DATABASE ====================
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin@localhost:5432/sowel_task",
)

# ==================== JWT / AUTH ====================
SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey123")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ==================== CORS ====================
# Default CORS origins berbeda untuk dev vs prod
_DEFAULT_CORS_ORIGINS_DEV = "http://localhost:5173,http://localhost:3000"
_DEFAULT_CORS_ORIGINS_PROD = ""  # Harus di-set di env var untuk production

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    _DEFAULT_CORS_ORIGINS_PROD if IS_PRODUCTION else _DEFAULT_CORS_ORIGINS_DEV,
)
ALLOWED_ORIGINS: list[str] = [
    origin.strip() for origin in _raw_origins.split(",") if origin.strip()
]

# ==================== LOGGING ====================
# Dev: DEBUG, Prod: WARNING (bisa di-override via LOG_LEVEL env var)
_DEFAULT_LOG_LEVEL = "WARNING" if IS_PRODUCTION else "DEBUG"
LOG_LEVEL: str = os.getenv("LOG_LEVEL", _DEFAULT_LOG_LEVEL).upper()

# Mapping string → logging constant
_LOG_LEVEL_MAP = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}
LOG_LEVEL_INT: int = _LOG_LEVEL_MAP.get(LOG_LEVEL, logging.INFO)

# ==================== DOCS (Swagger / ReDoc) ====================
# Di production, docs endpoint bisa dimatikan untuk security
DOCS_ENABLED: bool = os.getenv("DOCS_ENABLED", str(not IS_PRODUCTION)).lower() in (
    "true",
    "1",
    "yes",
)

# ==================== LOGGING SETUP ====================
logging.basicConfig(
    level=LOG_LEVEL_INT,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sowel-api")

# Validasi CORS untuk Production
if IS_PRODUCTION:
    if not ALLOWED_ORIGINS:
        logger.warning("=" * 60)
        logger.warning("CORS WARNING: ALLOWED_ORIGINS is empty in production mode!")
        logger.warning("All cross-origin requests from frontend to API will be BLOCKED by browsers.")
        logger.warning("Please configure the ALLOWED_ORIGINS environment variable in Railway.")
        logger.warning("=" * 60)
    elif "*" in ALLOWED_ORIGINS:
        logger.warning("=" * 60)
        logger.warning("CORS WARNING: ALLOWED_ORIGINS contains '*' (wildcard) in production!")
        logger.warning("This is incompatible with allow_credentials=True and will block requests.")
        logger.warning("Please specify the exact frontend URL (e.g., ALLOWED_ORIGINS=https://your-frontend.up.railway.app).")
        logger.warning("=" * 60)

# Tampilkan ringkasan config saat startup (hanya di dev)
if not IS_PRODUCTION:
    logger.debug("=" * 50)
    logger.debug("CONFIG LOADED")
    logger.debug("  ENV            : %s", ENV)
    logger.debug("  DEBUG          : %s", DEBUG)
    logger.debug("  LOG_LEVEL      : %s", LOG_LEVEL)
    logger.debug("  CORS origins   : %s", ALLOWED_ORIGINS)
    logger.debug("  DOCS_ENABLED   : %s", DOCS_ENABLED)
    logger.debug("  DATABASE_URL   : %s...%s", DATABASE_URL[:25], DATABASE_URL[-10:])
    logger.debug("=" * 50)

