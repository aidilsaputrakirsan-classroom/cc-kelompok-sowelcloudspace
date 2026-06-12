# Final DevOps Checklist - Modul 15

Checklist ini fokus pada tanggung jawab Lead DevOps untuk persiapan UAS.

## Repository & Secrets

- [ ] Root `.env.example` tersedia dan lengkap.
- [ ] File `.env` tidak ter-commit.
- [ ] `.gitignore` mencakup `.env` dan `.env.*`.
- [ ] Tidak ada password database hardcoded di Docker Compose.
- [ ] `SECRET_KEY` dibaca dari environment variable.
- [ ] Production tidak memakai default secret/password lemah.

## Docker & Gateway

- [ ] `docker compose up --build -d` berhasil.
- [ ] `docker compose ps` menunjukkan semua service running/healthy.
- [ ] Gateway menjadi satu-satunya public entrypoint production.
- [ ] Auth Service tidak perlu diekspos langsung di production.
- [ ] Task Service tidak perlu diekspos langsung di production.
- [ ] PostgreSQL tidak diekspos langsung di production.

## Rate Limiting

- [ ] `/auth/login` memakai `auth_limit`.
- [ ] `/auth/register` memakai `auth_limit`.
- [ ] `/tasks` memakai `api_limit`.
- [ ] `/api/folders` memakai `api_limit`.
- [ ] Request berlebihan menghasilkan HTTP `429`.
- [ ] Response `429` berbentuk JSON.

## Health & Verification

- [ ] `GET /health` via gateway berhasil.
- [ ] `GET /auth/health` via gateway berhasil.
- [ ] `GET http://localhost:8001/health` berhasil di local dev.
- [ ] `GET http://localhost:8002/health` berhasil di local dev.
- [ ] Frontend dapat diakses via gateway.
- [ ] Register dan login dapat dilakukan via gateway.
- [ ] CRUD task dapat dilakukan via gateway setelah login.

## Production Readiness

- [ ] Production `POSTGRES_PASSWORD` di-set dari secret manager/platform env.
- [ ] Production `SECRET_KEY` minimal 32 karakter random.
- [ ] Production `CORS_ORIGINS` hanya memuat domain yang dikenal.
- [ ] `LOG_LEVEL` production diset ke `WARNING` atau `INFO`.
- [ ] Production URL dapat diakses sebelum demo.
- [ ] Backup demo tersedia jika internet bermasalah.
