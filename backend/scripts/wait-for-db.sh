#!/bin/sh
# ============================================================
# wait-for-db.sh
# Startup script yang menunggu PostgreSQL siap sebelum
# menjalankan uvicorn. Mencegah error saat DB belum siap.
# ============================================================

set -e

# --- Konfigurasi ---
# Parse DATABASE_URL untuk mendapatkan host dan port
# Format: postgresql://user:password@host:port/dbname
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MAX_RETRIES="${DB_MAX_RETRIES:-30}"
RETRY_INTERVAL="${DB_RETRY_INTERVAL:-2}"

# Jika DATABASE_URL tersedia, parse host dan port otomatis
if [ -n "$DATABASE_URL" ]; then
    # Ekstrak host dari DATABASE_URL
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    # Ekstrak port dari DATABASE_URL
    DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
fi

echo "=========================================="
echo "  wait-for-db.sh"
echo "=========================================="
echo "  Host    : $DB_HOST"
echo "  Port    : $DB_PORT"
echo "  Retries : $MAX_RETRIES"
echo "  Interval: ${RETRY_INTERVAL}s"
echo "=========================================="

# --- Tunggu PostgreSQL siap ---
retry_count=0

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2>/dev/null; do
    retry_count=$((retry_count + 1))

    if [ "$retry_count" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: PostgreSQL tidak siap setelah ${MAX_RETRIES} percobaan ($(( MAX_RETRIES * RETRY_INTERVAL ))s)."
        echo "       Pastikan database berjalan di $DB_HOST:$DB_PORT"
        exit 1
    fi

    echo "Menunggu PostgreSQL siap... (percobaan $retry_count/$MAX_RETRIES)"
    sleep "$RETRY_INTERVAL"
done

echo ""
echo "PostgreSQL siap di $DB_HOST:$DB_PORT!"
echo "Menjalankan aplikasi..."
echo ""

# --- Jalankan perintah yang diberikan (uvicorn) ---
exec "$@"
