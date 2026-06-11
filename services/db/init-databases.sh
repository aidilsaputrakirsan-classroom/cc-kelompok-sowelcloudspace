#!/bin/sh
# ============================================================
# Init script — Membuat database untuk masing-masing microservice
# Script ini dijalankan otomatis saat container PostgreSQL pertama kali start
# ============================================================

set -e

echo "Creating additional databases for microservices..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Database untuk auth-service
    SELECT 'CREATE DATABASE auth_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec

    -- Database untuk task-service
    SELECT 'CREATE DATABASE task_db'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'task_db')\gexec
EOSQL

echo "Databases auth_db and task_db created successfully!"
