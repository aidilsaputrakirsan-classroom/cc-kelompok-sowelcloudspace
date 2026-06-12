# Operations Guide - Sowel Cloudspace

Panduan ini berisi langkah operasional untuk menjalankan, mengecek, dan menangani masalah pada deployment microservices Sowel Cloudspace.

## 1. Tujuan Dokumen

Dokumen ini mencakup:

- Cara menjalankan service lokal, development, dan production.
- Cara check health service.
- Cara membaca log.
- Cara check metrics jika endpoint tersedia.
- Cara menguji rate limiting gateway.
- Common troubleshooting.
- Escalation path jika terjadi masalah.

## 2. Service Topology

| Service | Container | Internal Port | Public Access |
| ------- | --------- | ------------- | ------------- |
| Gateway | `sowel-gateway` | 80 | `http://localhost` atau production URL |
| Frontend | `sowel-frontend` | 80 | Lewat gateway |
| Auth Service | `sowel-auth-service` | 8001 | Lewat `/auth/*` |
| Task Service | `sowel-task-service` | 8002 | Lewat `/tasks/*` dan `/api/folders/*` |
| PostgreSQL | `sowel-db` | 5432 | Lokal dev: `localhost:5433` |

## 3. Environment Setup

1. Copy root `.env.example` menjadi `.env`.
2. Ganti semua `CHANGE_ME` dengan nilai sebenarnya.
3. Gunakan `SECRET_KEY` yang sama untuk `auth-service` dan `task-service`.
4. Jangan commit `.env`.

Generate secret yang kuat:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## 4. Menjalankan Sistem

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

Melihat status container:

```bash
docker compose ps
```

Stop semua service:

```bash
docker compose down
```

## 5. Health Checks

```bash
curl http://localhost/health
curl http://localhost/auth/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

Expected: status HTTP `200` dan payload berisi `"status":"healthy"`.

## 6. Logs

Melihat log semua service:

```bash
docker compose logs
```

Melihat log service tertentu:

```bash
docker compose logs -f gateway
docker compose logs -f auth-service
docker compose logs -f task-service
docker compose logs -f db
```

## 7. Metrics

Jika endpoint metrics tersedia pada service, cek dengan:

```bash
curl http://localhost:8001/metrics
curl http://localhost:8002/metrics
curl http://localhost/auth/metrics
curl http://localhost/tasks/metrics
```

Jika response `404`, berarti endpoint metrics belum tersedia pada service tersebut atau route belum ditambahkan di gateway.

## 8. Rate Limiting

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

## 9. Common Troubleshooting

| Gejala | Cek | Solusi |
| ------ | --- | ------ |
| Gateway `502` | `docker compose logs gateway` | Pastikan `auth-service`, `task-service`, dan `frontend` running |
| Service gagal start | `docker compose logs <service>` | Cek `.env`, terutama `DATABASE_URL`, `POSTGRES_PASSWORD`, dan `SECRET_KEY` |
| JWT invalid | Env service | Pastikan `SECRET_KEY` auth dan task sama |
| CORS error | Browser console dan env `CORS_ORIGINS` | Tambahkan origin frontend yang benar |
| Database unhealthy | `docker compose logs db` | Cek password, volume, dan init script |
| Request terlalu banyak | HTTP `429` | Tunggu beberapa detik atau turunkan traffic test |

## 10. Escalation Path

| Masalah | Eskalasi ke |
| ------- | ----------- |
| Error pada endpoint backend | Lead Backend |
| Error pada UI atau status page | Lead Frontend |
| Error Docker, gateway, port, deployment, dan workflow CI/CD | Lead DevOps |
| Dokumentasi monitoring atau hasil testing tidak jelas | Lead QA & Docs |

Alur eskalasi:

1. Lead QA & Docs melakukan pengecekan awal melalui health check, logs, metrics, dan bukti request.
2. Jika masalah berasal dari backend, laporkan ke Lead Backend dengan endpoint, response, dan log error.
3. Jika masalah berasal dari gateway, Docker, port, deployment, atau workflow GitHub, laporkan ke Lead DevOps dengan hasil `docker compose ps`, log gateway, dan pesan error.
4. Jika masalah berasal dari frontend atau status page, laporkan ke Lead Frontend.
5. Setelah masalah diperbaiki, Lead QA & Docs melakukan verifikasi ulang.

## 11. Checklist Operasional

- [ ] Semua container berjalan dengan `docker compose ps`.
- [ ] `auth-service` menunjukkan status healthy.
- [ ] `task-service` menunjukkan status healthy.
- [ ] Gateway dapat diakses melalui `http://localhost/health`.
- [ ] Frontend dapat diakses melalui gateway.
- [ ] Rate limiting login menghasilkan HTTP `429` saat request berlebihan.
- [ ] Log service dapat dibaca.
- [ ] Tidak ada error database.
- [ ] Tidak ada error `502 Bad Gateway`.
