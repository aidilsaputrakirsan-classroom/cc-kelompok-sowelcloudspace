# UTS Demo Script — sowelcloudspace

## ⏱️ TOTAL: ±15 menit

---

## 1. Live Demo (±10 menit)

### ⏱️ Menit 0–1 — Setup (Lead DevOps)
- Buka terminal di root project
- Jalankan:
  - `docker compose up -d`
- Tunjukkan:
  - `docker compose ps`
  - Pastikan:
    - 3 services (db, backend, frontend) → status **Up**
    - Database → **healthy**

---

### ⏱️ Menit 1–3 — Authentication (Lead Frontend)
- Buka: http://localhost:5173/
- Register user baru
  - Tunjukkan validasi form
- Login dengan user tersebut
- Berhasil masuk ke aplikasi

✅ Tekankan:
- Endpoint protected (tidak bisa akses tanpa login)

---

### ⏱️ Menit 3–6 — CRUD Operations (Lead Frontend)
- Create 2–3 item
- Read → list muncul
- Search item
- Edit 1 item
- Delete 1 item (dengan confirm dialog)

✅ Pastikan semua:
- Create ✅
- Read ✅
- Update ✅
- Delete ✅

---

### ⏱️ Menit 6–7 — Backend Demo (Lead Backend)
- Buka: http://localhost:8000/docs
- Tunjukkan:
  - Semua endpoint terdokumentasi
  - Endpoint `/health`
- Jelaskan:
  - API dibuat dengan FastAPI (auto Swagger)

---

### ⏱️ Menit 7–8 — Data Persistence (Lead DevOps)
- Jalankan:
  - `docker compose down`
  - `docker compose up -d`
- Login kembali
- Tunjukkan:
  - Data masih ada

✅ Tekankan:
- Volume PostgreSQL berfungsi

---

### ⏱️ Menit 8–10 — Docker Explanation (Lead DevOps)
- Jelaskan `docker-compose.yml`:
  - services (db, backend, frontend)
  - healthcheck
  - depends_on

---

## 2. Code Walkthrough (±5 menit)

### ⏱️ Menit 0–2 — DevOps
- `docker-compose.yml`
  - struktur services
  - volumes & network

---

### ⏱️ Menit 2–3 — Backend
- `backend/Dockerfile`
  - base image
  - install dependencies
  - layer caching
- Jelaskan auth (JWT)

---

### ⏱️ Menit 3–4 — Frontend
- `frontend/Dockerfile`
  - multi-stage build
  - build React → serve via Nginx

---

### ⏱️ Menit 4–5 — QA & Docs
- Tunjukkan:
  - README.md
  - Struktur project
- Jelaskan:
  - Cara run project
  - Dokumentasi lengkap

---

## 3. (Setelah Demo) — Individual Viva
- Setiap anggota siap jawab:
  - bagian yang dikerjakan
  - konsep (Docker, REST API, React, JWT, dll)
