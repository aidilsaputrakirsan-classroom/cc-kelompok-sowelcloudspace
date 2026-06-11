"""
Migration: Tambah kolom visible_to ke tabel tasks
Jalankan sekali saja saat upgrade dari versi sebelumnya.

Cara pakai:
  cd backend
  python scripts/migrate_add_visible_to.py
"""

import sys
import os

# Tambah parent dir ke path agar bisa import modules backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from sqlalchemy import text, inspect


def run():
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("tasks")]

    if "visible_to" in columns:
        print("[SKIP] Kolom 'visible_to' sudah ada di tabel 'tasks'. Tidak perlu migrasi.")
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN visible_to TEXT DEFAULT '[]'"))
        # Set nilai default untuk row yang sudah ada
        conn.execute(text("UPDATE tasks SET visible_to = '[]' WHERE visible_to IS NULL"))

    print("[OK] Kolom 'visible_to' berhasil ditambahkan ke tabel 'tasks'.")


if __name__ == "__main__":
    run()
