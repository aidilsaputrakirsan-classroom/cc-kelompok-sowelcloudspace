# Operations Guide - Sowel Cloudspace

Panduan ini berisi langkah operasional untuk menjalankan, mengecek, dan menangani masalah pada deployment microservices Sowel Cloudspace.

## Service Topology

| Service | Container | Internal Port | Public Access |
| ------- | --------- | ------------- | ------------- |
| Gateway | `sowel-gateway` | 80 | `http://localhost` atau production URL |
| Frontend | `sowel-frontend` | 80 | Lewat gateway |
| Auth Service | `sowel-auth-service` | 8001 | Lewat `/auth/*` |
| Task Service | `sowel-task-service` | 8002 | Lewat `/tasks/*` dan `/api/folders/*` |
| PostgreSQL | `sowel-db` | 5432 | Lokal dev: `localhost:5433` |

## Environment Setup

1. Copy root `.env.example` menjadi `.env`.
2. Ganti semua `CHANGE_ME` dengan nilai sebenarnya.
3. Gunakan `SECRET_KEY` yang sama untuk `auth-service` dan `task-service`.
4. Jangan commit `.env`.

Generate secret yang kuat:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Runbook Lokal

Start mode default:

```bash
docker compose up --build -d
```

Start mode development dengan hot reload dan gateway di port 8080:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

Start mode production:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Stop semua service:

```bash
docker compose down
```

## Health Checks

```bash
curl http://localhost/health
curl http://localhost/auth/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

Expected: status HTTP `200` dan payload berisi `"status":"healthy"`.

## Logs

```bash
docker compose logs -f gateway
docker compose logs -f auth-service
docker compose logs -f task-service
docker compose logs -f db
```

Untuk melihat status container:

```bash
docker compose ps
```

## Rate Limiting

Gateway memakai tiga zone:

| Zone | Rate | Burst | Target |
| ---- | ---- | ----- | ------ |
| `auth_limit` | 5 req/s | 10 login, 5 register | `/auth/login`, `/auth/register` |
| `api_limit` | 20 req/s | 20-30 | `/tasks`, `/api/folders`, `/users/verify` |
| `general_limit` | 30 req/s | 20-50 | `/auth/*` lain dan frontend |

Test cepat:

```bash
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST http://localhost/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=demo&password=wrong"
done
```

Expected: beberapa request awal `401`, lalu `429` jika limit terlampaui.

## Troubleshooting

| Gejala | Cek | Solusi |
| ------ | --- | ------ |
| Gateway `502` | `docker compose logs gateway` | Pastikan `auth-service`, `task-service`, dan `frontend` running |
| Service gagal start | `docker compose logs <service>` | Cek `.env`, terutama `DATABASE_URL`, `POSTGRES_PASSWORD`, dan `SECRET_KEY` |
| JWT invalid | Env service | Pastikan `SECRET_KEY` auth dan task sama |
| CORS error | Browser console dan env `CORS_ORIGINS` | Tambahkan origin frontend yang benar |
| Database unhealthy | `docker compose logs db` | Cek password, volume, dan init script |
| Request terlalu banyak | HTTP `429` | Tunggu beberapa detik atau turunkan traffic test |
