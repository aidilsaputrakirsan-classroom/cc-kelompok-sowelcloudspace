

## Arsitektur Deployment

Aplikasi Sowel Task menggunakan arsitektur **Microservice** dengan komponen sebagai berikut:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────>│   Gateway    │────>│ Auth Service  │
│  (React)    │     │   (Nginx)    │────>│ Task Service  │
└─────────────┘     └──────────────┘     └──────────────┘
                                               │
                                          ┌────┴────┐
                                          │   DB    │
                                          │(Postgres)│
                                          └─────────┘
```

| Komponen | Teknologi | Port | Keterangan |
|----------|-----------|------|------------|
| Frontend | React + Vite + Nginx | 80 | SPA yang di-serve oleh Nginx |
| Gateway | Nginx (reverse proxy) | 80 | Routing request ke microservices |
| Auth Service | FastAPI (Python) | 8001 | Autentikasi & manajemen user |
| Task Service | FastAPI (Python) | 8002 | CRUD task management |
| Database | PostgreSQL 16 Alpine | 5432 | Penyimpanan data persisten |

### Routing Gateway (Nginx)

| Path | Service Target | Keterangan |
|------|---------------|------------|
| `/auth/*` | auth-service:8001 | Endpoint autentikasi |
| `/tasks/*` | task-service:8002 | Endpoint task management |
| `/health` | auth-service:8001 | Health check |
| `/team` | Gateway (static response) | Info tim |
| `/*` | frontend:80 | React SPA (catch-all) |

---

## Prasyarat

Sebelum melakukan deployment, pastikan hal-hal berikut sudah tersedia:

| Kebutuhan | Versi Minimum | Keterangan |
|-----------|---------------|------------|
| Git | - | Version control |
| Docker | 20.x+ | Container runtime |
| Docker Compose | v2+ | Orchestrasi multi-container |
| Node.js | 18+ | Build frontend |
| Python | 3.10+ | Backend development |
| Akun GitHub | - | Source code & CI/CD |
| Akun Railway | - | Cloud deployment |

---

## Railway Setup

### Langkah 1: Login ke Railway

1. Buka [railway.app](https://railway.app)
2. Klik **Login** → pilih **Login with GitHub**
3. Authorize Railway untuk mengakses repository GitHub

### Langkah 2: Buat Project Baru

1. Klik **New Project** di dashboard Railway
2. Pilih **Deploy from GitHub Repo**
3. Pilih repository `cc-kelompok-sowelcloudspace`

### Langkah 3: Tambah PostgreSQL Database Service

1. Di dalam project, klik **New** → **Database** → **Add PostgreSQL**
2. Railway akan otomatis membuat database instance
3. Salin value `DATABASE_URL` yang disediakan Railway (format: `${{Postgres.DATABASE_URL}}`)
4. Database URL ini akan digunakan sebagai environment variable untuk backend services

### Langkah 4: Deploy Backend

1. Klik **New** → **GitHub Repo** → pilih repository
2. Set **Root Directory**: `/backend`
3. Railway akan otomatis mendeteksi `Dockerfile` dan memulai build
4. Tambahkan environment variables yang diperlukan (lihat [Environment Variables](#environment-variables))
5. Backend akan otomatis mendapatkan port dinamis melalui env var `PORT`

> **Catatan:** Backend Dockerfile menggunakan `${PORT:-8000}` sehingga kompatibel dengan Railway yang menyediakan PORT secara dinamis.

### Langkah 5: Deploy Frontend

1. Klik **New** → **GitHub Repo** → pilih repository
2. Set **Root Directory**: `/frontend`
3. Railway akan otomatis mendeteksi `Dockerfile` (multi-stage build dengan Nginx)
4. Pastikan `VITE_API_URL` mengarah ke URL backend Railway

---

## Environment Variables

### Backend (Railway)

Environment variables yang perlu dikonfigurasi pada service backend di Railway:

| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | URL database PostgreSQL dari Railway (auto-referencing) |
| `SECRET_KEY` | `(random hex 64 chars)` | Secret key untuk JWT token signing. **Wajib unik dan panjang** |
| `ALGORITHM` | `HS256` | Algoritma JWT yang digunakan |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Durasi token berlaku (dalam menit) |
| `CORS_ORIGINS` / `ALLOWED_ORIGINS` | `https://frontend-url.railway.app` | URL frontend di Railway (pisahkan dengan koma untuk multiple origins) |
| `ENV` / `ENVIRONMENT` | `production` | Mode environment aplikasi |
| `DEBUG` | `false` | Matikan debug di production |
| `DOCS_ENABLED` | `false` | Matikan Swagger docs di production (opsional) |
| `LOG_LEVEL` | `WARNING` | Level logging untuk production |

> **Tips:** Generate SECRET_KEY dengan command:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### Frontend (Railway)

| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `VITE_API_URL` | `https://backend-url.railway.app` | URL backend API yang akan diakses frontend |

> **Penting:** `VITE_API_URL` di-embed saat build time karena Vite mengganti env vars saat proses build. Jika URL berubah, frontend perlu di-rebuild.

File `.env.production` saat ini:
```env
VITE_API_URL=https://backend-production-b026.up.railway.app
```

### GitHub Secrets

Secrets yang perlu dikonfigurasi di GitHub repository (Settings → Secrets and variables → Actions):

| Secret | Keterangan |
|--------|------------|
| `RAILWAY_TOKEN` | Token dari [railway.app/account/tokens](https://railway.app/account/tokens) untuk auto-deploy via CI/CD |

---

## CI/CD Pipeline (GitHub Actions)

Pipeline CI/CD dikonfigurasi di `.github/workflows/ci.yml` dan berjalan otomatis saat:
- **Push** ke branch `main`
- **Pull Request** ke branch `main`

### Pipeline Jobs

```
┌─────────────────────┐     ┌─────────────────────┐
│  🐍 Test Backend    │     │  ⚛️ Test Frontend    │
│  (Python/FastAPI)   │     │  (React/Vitest)     │
│                     │     │                     │
│  • Checkout code    │     │  • Checkout code    │
│  • Setup Python 3.12│     │  • Setup Node.js 20 │
│  • Cache pip        │     │  • npm ci           │
│  • Install deps     │     │  • Run tests        │
│  • pytest (cov≥50%) │     │  • Build frontend   │
└────────┬────────────┘     └────────┬────────────┘
         │                           │
         └───────────┬───────────────┘
                     ▼
         ┌─────────────────────┐
         │  🐳 Build Docker    │
         │                     │
         │  • Build backend    │
         │  • Build frontend   │
         │  • Verify images    │
         └─────────────────────┘
```

| Job | Keterangan | Dependency |
|-----|-----------|------------|
| `test-backend` | Menjalankan pytest dengan coverage minimum 50% | - |
| `test-frontend` | Menjalankan vitest dan build production bundle | - |
| `build-docker` | Build Docker images untuk backend dan frontend | Hanya jalan jika **kedua test PASS** |

### Alur CI/CD

1. Developer melakukan push atau membuat PR ke branch `main`
2. GitHub Actions otomatis menjalankan pipeline
3. **Test Backend** dan **Test Frontend** berjalan secara paralel
4. Jika kedua test berhasil, **Build Docker** dijalankan
5. Jika semua job berhasil, deployment bisa dilanjutkan ke Railway

---

## Docker Configuration

### File Docker dalam Project

| File | Lokasi | Keterangan |
|------|--------|------------|
| `docker-compose.yml` | Root project | Orchestrasi semua service |
| `backend/Dockerfile` | Backend | Multi-purpose (lokal + Railway) |
| `frontend/Dockerfile` | Frontend | Multi-stage build (Node → Nginx) |
| `services/auth-service/Dockerfile` | Auth Service | Microservice auth |
| `services/task-service/Dockerfile` | Task Service | Microservice task |
| `services/gateway/nginx.conf` | Gateway | Konfigurasi reverse proxy |
| `services/db/init-databases.sh` | Database | Inisialisasi database `auth_db` dan `task_db` |

### Backend Dockerfile (Ringkasan)

```dockerfile
FROM python:3.12-slim
# Install curl & postgresql-client
# Copy & install requirements
# Copy source code
# Setup non-root user (appuser)
# Healthcheck → /health endpoint
# Entrypoint → wait-for-db.sh (tunggu PostgreSQL siap)
# CMD → uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Fitur utama:
- **Non-root user** untuk keamanan
- **wait-for-db.sh** untuk startup sequencing
- **Dynamic port** (`${PORT:-8000}`) kompatibel dengan Railway
- **Healthcheck** otomatis via `/health` endpoint

### Frontend Dockerfile (Ringkasan)

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
# npm ci → npm run build → output /app/dist/

# Stage 2: Production
FROM nginx:alpine
# Copy build output ke Nginx html dir
# Custom nginx.conf untuk SPA routing
# Expose port 80
```

Fitur utama:
- **Multi-stage build** untuk image size yang kecil
- **Nginx** sebagai static file server
- **SPA routing** (`try_files $uri $uri/ /index.html`)
- **Security headers** (X-Frame-Options, X-Content-Type-Options, dll.)
- **Gzip compression** untuk performa

---

## Deployment Lokal (Docker Compose)

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd cc-kelompok-sowelcloudspace

# Start semua services
docker compose up -d

# Atau start dengan rebuild
docker compose up --build -d
```

### Makefile Shortcuts

| Command | Keterangan |
|---------|------------|
| `make up` | Start semua services di background |
| `make build` | Start dengan rebuild images |
| `make down` | Stop & remove containers |
| `make clean` | Stop, remove containers, **hapus volumes** (⚠️ data hilang!) |
| `make restart` | Restart semua services |
| `make logs` | Lihat logs semua services (realtime) |
| `make logs-backend` | Lihat logs backend saja |
| `make ps` | Lihat status semua services |
| `make shell-backend` | Masuk ke shell container backend |
| `make shell-db` | Masuk ke PostgreSQL CLI |

### Services & Ports (Lokal)

| Service | Container Name | Port Lokal | URL Akses |
|---------|---------------|------------|-----------|
| Database (PostgreSQL) | `sowel-db` | 5433 | `localhost:5433` |
| Auth Service | `sowel-auth-service` | 8001 | `http://localhost:8001` |
| Task Service | `sowel-task-service` | 8002 | `http://localhost:8002` |
| Frontend | `sowel-frontend` | - | via Gateway |
| Gateway (Nginx) | `sowel-gateway` | 80 | `http://localhost` |

### Urutan Startup (Dependencies)

```
1. db (PostgreSQL)            ← Start pertama, healthcheck: pg_isready
   ↓
2. auth-service               ← Start setelah db healthy
   ↓
3. task-service               ← Start setelah db & auth-service healthy
   ↓
4. frontend                   ← Start setelah auth-service & task-service
   ↓
5. gateway                    ← Start terakhir, menghubungkan semua service
```

### Verifikasi Lokal

Setelah semua service berjalan, akses:

| URL | Expected Response |
|-----|-------------------|
| `http://localhost` | React frontend (halaman utama) |
| `http://localhost/health` | `{"status": "healthy"}` |
| `http://localhost/team` | Info tim (JSON) |
| `http://localhost/auth/register` | Endpoint registrasi (POST) |
| `http://localhost:8001/docs` | Swagger UI Auth Service |
| `http://localhost:8002/docs` | Swagger UI Task Service |

---

## Verifikasi Deployment

Setelah deployment ke Railway berhasil, lakukan verifikasi berikut:

### 1. Health Check

```bash
curl https://<backend-url>.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "backend",
  "version": "1.0.0",
  "database": "connected"
}
```

### 2. Test Registrasi User

```bash
curl -X POST https://<backend-url>.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "password": "password123"}'
```

### 3. Test Login

```bash
curl -X POST https://<backend-url>.railway.app/auth/login \
  -d "username=Test User&password=password123"
```

### 4. Test Frontend

Akses URL frontend Railway melalui browser dan pastikan:
- Halaman login muncul
- Bisa register user baru
- Bisa login dan melihat dashboard task
- CRUD task berfungsi normal

---

## Troubleshooting

### 1. 502 Bad Gateway pada Railway

**Penyebab:** Backend tidak listen pada port yang diberikan Railway.

**Solusi:**
- Pastikan backend menggunakan `PORT` environment variable: `uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`
- Jangan hardcode port — Railway memberikan port secara dinamis
- Periksa log Railway untuk melihat port yang diberikan

### 2. Database Connection Error

**Penyebab:** `DATABASE_URL` tidak benar atau database belum siap.

**Solusi:**
- Pastikan `DATABASE_URL` menggunakan referensi Railway: `${{Postgres.DATABASE_URL}}`
- Periksa apakah PostgreSQL service sudah berjalan di Railway dashboard
- Lokal: Pastikan container `sowel-db` sudah healthy (`docker compose ps`)

### 3. CORS Error di Browser

**Penyebab:** Frontend URL tidak terdaftar di `ALLOWED_ORIGINS` / `CORS_ORIGINS`.

**Solusi:**
- Tambahkan URL frontend Railway ke environment variable `ALLOWED_ORIGINS`
- Format: pisahkan multiple origins dengan koma
- Contoh: `https://frontend-production-xxxx.up.railway.app,http://localhost:5173`
- Restart backend service setelah mengubah env var

### 4. Frontend Tidak Bisa Konek ke Backend

**Penyebab:** `VITE_API_URL` salah atau tidak di-set saat build.

**Solusi:**
- Pastikan `VITE_API_URL` di-set sebagai build argument di Railway
- `VITE_API_URL` harus mengarah ke URL backend Railway yang valid
- Jika URL backend berubah, **frontend harus di-rebuild** karena Vite meng-embed env var saat build time
- Cek file `.env.production`: `VITE_API_URL=https://backend-production-b026.up.railway.app`

### 5. CI/CD Pipeline Gagal

**Penyebab umum:**

| Error | Solusi |
|-------|--------|
| `pytest failed` | Cek apakah test lokal berhasil (`pytest --cov=. --cov-report=term-missing`) |
| `npm test failed` | Cek test frontend lokal (`cd frontend && npm test`) |
| `Docker build failed` | Cek Dockerfile dan pastikan dependencies lengkap di `requirements.txt` / `package.json` |
| Coverage < 50% | Tambahkan test baru hingga coverage memenuhi threshold |

### 6. Container Tidak Bisa Start (Lokal)

**Solusi:**
```bash
# Lihat logs untuk detail error
docker compose logs -f <service-name>

# Rebuild semua images
docker compose up --build -d

# Reset total (⚠️ data hilang)
docker compose down -v
docker compose up --build -d
```

### 7. `wait-for-db.sh` Error: `/bin/sh^M`

**Penyebab:** File menggunakan line ending Windows (CRLF) alih-alih Unix (LF).

**Solusi:** Sudah ditangani otomatis di Dockerfile backend:
```dockerfile
RUN sed -i 's/\r$//' /app/scripts/wait-for-db.sh && chmod +x /app/scripts/wait-for-db.sh
```

Jika masih error, konversi manual:
```bash
# Linux/macOS
sed -i 's/\r$//' backend/scripts/wait-for-db.sh

# Windows (Git Bash)
dos2unix backend/scripts/wait-for-db.sh
```

### 8. JWT Token Invalid / Expired

**Solusi:**
- Pastikan `SECRET_KEY` sama antara saat token dibuat dan diverifikasi
- Default expiry: 60 menit (`ACCESS_TOKEN_EXPIRE_MINUTES=60`)
- Lakukan login ulang untuk mendapatkan token baru
- Di production, gunakan `SECRET_KEY` yang kuat (minimal 32 karakter)

---

## Final DevOps Notes - Modul 15

### Docker Compose Environment

Deployment final memakai root `.env.example` sebagai template konfigurasi. Copy file tersebut menjadi `.env`, lalu isi semua nilai `CHANGE_ME` sebelum menjalankan Compose.

```bash
cp .env.example .env
docker compose up --build -d
```

Variabel wajib:

| Variable | Keterangan |
|----------|------------|
| `POSTGRES_PASSWORD` | Password PostgreSQL, wajib kuat |
| `AUTH_DATABASE_URL` | URL database Auth Service |
| `TASK_DATABASE_URL` | URL database Task Service |
| `SECRET_KEY` | Secret JWT yang sama untuk Auth dan Task |
| `CORS_ORIGINS` | Origin frontend yang diizinkan |
| `VITE_API_URL` | URL gateway untuk frontend |

Untuk production, Compose memakai guard `${VAR:?message}` pada secret penting. Artinya service akan gagal start jika env wajib belum diisi, sehingga tidak diam-diam memakai password default lemah.

### Gateway Rate Limiting

Gateway Nginx sudah menerapkan rate limiting:

| Route | Limit | Keterangan |
|-------|-------|------------|
| `/auth/login` | 5 req/s, burst 10 | Proteksi brute force login |
| `/auth/register` | 5 req/s, burst 5 | Proteksi abuse registrasi |
| `/tasks` | 20 req/s, burst 30 | Proteksi API task |
| `/api/folders` | 20 req/s, burst 30 | Proteksi API folder |
| `/users/verify` | 20 req/s, burst 20 | Proteksi verifikasi user |
| `/` | 30 req/s, burst 50 | Proteksi frontend dan route umum |

Test cepat:

```bash
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST http://localhost/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=demo&password=wrong"
done
```

Expected: setelah beberapa request, gateway mengembalikan HTTP `429`.

### Operations Documents

Dokumen operasional tambahan:

- `docs/operations-guide.md`
- `docs/final-checklist.md`



