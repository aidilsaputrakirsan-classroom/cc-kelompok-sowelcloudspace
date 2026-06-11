# 📘 Operations Guide

## 1. Tujuan Dokumen

Dokumen ini dibuat sebagai panduan operasional untuk melakukan pengecekan kondisi sistem microservices pada project
Panduan ini mencakup:

- Cara check health service
- Cara membaca log
- Cara trace request menggunakan correlation ID
- Cara check metrics
- Common troubleshooting
- Escalation path jika terjadi masalah

## 2. Arsitektur Singkat Sistem

| Service | Fungsi |
|---|---|
| `frontend` | Menampilkan antarmuka aplikasi |
| `gateway` | Menjadi pintu masuk utama dan meneruskan request ke service terkait |
| `auth-service` | Mengelola autentikasi seperti register, login, dan verify token |
| `item-service` | Mengelola data item/barang |
| `auth-db` | Database untuk `auth-service` |
| `item-db` | Database untuk `item-service` |

## 3. Menjalankan Sistem

Untuk menjalankan seluruh service, gunakan perintah berikut:

```bash
docker compose up -d --build
```

Untuk melihat status container:

```bash
docker compose ps
```

Pastikan container utama berada dalam status `Up`. Untuk database, pastikan statusnya `healthy`.

## 4. Cara Check Health

Health check digunakan untuk memastikan service berjalan dengan baik.

### 4.1 Check Health melalui Gateway

```bash
curl.exe http://localhost/health
curl.exe http://localhost/auth/health
curl.exe http://localhost/items/health
```

### 4.2 Check Health Langsung ke Service

```bash
curl.exe http://localhost:8001/health
curl.exe http://localhost:8002/health
```

Keterangan endpoint:

| Endpoint | Service |
|---|---|
| `http://localhost/health` | Gateway |
| `http://localhost:8001/health` | Auth Service |
| `http://localhost:8002/health` | Item Service |
| `http://localhost/auth/health` | Auth Service melalui Gateway |
| `http://localhost/items/health` | Item Service melalui Gateway |

Contoh response healthy:

```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```

Contoh response unhealthy:

```json
{
  "status": "unhealthy",
  "service": "item-service",
  "dependencies": {
    "database": {
      "status": "disconnected"
    }
  }
}
```

Jika response menunjukkan `unhealthy`, cek bagian `dependencies` untuk mengetahui komponen yang bermasalah.

## 5. Cara Membaca Log

Log digunakan untuk melihat aktivitas sistem, error, request yang masuk, dan proses komunikasi antar service.

### 5.1 Melihat Log Semua Service

```bash
docker compose logs
```

### 5.2 Melihat Log Auth Service

```bash
docker compose logs auth-service --tail=50
```

### 5.3 Melihat Log Item Service

```bash
docker compose logs item-service --tail=50
```

### 5.4 Melihat Log Gateway

```bash
docker compose logs gateway --tail=50
```

### 5.5 Melihat Log Database

```bash
docker compose logs auth-db --tail=50
docker compose logs item-db --tail=50
```

### 5.6 Melihat Log secara Real-Time

```bash
docker compose logs -f auth-service item-service
```

Gunakan perintah ini ketika ingin memantau log saat melakukan request dari frontend, Swagger, atau terminal.

## 6. Cara Trace Request Menggunakan Correlation ID

Correlation ID digunakan untuk melacak satu request yang melewati beberapa service. Dengan correlation ID, tim dapat mengetahui alur request dari gateway ke service lain.

Correlation ID biasanya muncul pada response header dengan nama:

```text
x-correlation-id
```

### 6.1 Melihat Correlation ID dari Response

```bash
curl.exe -i http://localhost:8001/health
```

Cari bagian header seperti berikut:

```text
x-correlation-id: contoh-correlation-id
```

### 6.2 Mencari Correlation ID di Log

Untuk mencari semua log yang memiliki correlation ID:

```bash
docker compose logs auth-service item-service --tail=100 | Select-String "correlation_id"
```

Untuk mencari correlation ID tertentu:

```bash
docker compose logs auth-service item-service --tail=100 | Select-String "isi-correlation-id"
```

Jika correlation ID yang sama muncul pada lebih dari satu service, maka request tracing sudah berjalan dengan baik.

## 7. Cara Check Metrics

Metrics digunakan untuk melihat performa service seperti jumlah request, jumlah error, error rate, latency, dan uptime.

### 7.1 Metrics Auth Service

Langsung ke service:

```bash
curl.exe http://localhost:8001/metrics
```

Melalui gateway:

```bash
curl.exe http://localhost/auth/metrics
```

### 7.2 Metrics Item Service

Langsung ke service:

```bash
curl.exe http://localhost:8002/metrics
```

Melalui gateway:

```bash
curl.exe http://localhost/items/metrics
```

Contoh response metrics:

```json
{
  "service": "item-service",
  "uptime_seconds": 120.5,
  "total_requests": 10,
  "total_errors": 0,
  "error_rate_percent": 0.0,
  "latency": {
    "avg_ms": 3.2,
    "p95_ms": 5.8
  }
}
```

Metrics yang perlu diperhatikan:

| Metrics | Fungsi |
|---|---|
| `total_requests` | Menampilkan jumlah request yang diterima service |
| `total_errors` | Menampilkan jumlah request yang mengalami error |
| `error_rate_percent` | Menampilkan persentase error |
| `latency.avg_ms` | Menampilkan rata-rata waktu response |
| `latency.p95_ms` | Menampilkan estimasi latency p95 |
| `uptime_seconds` | Menampilkan lama service berjalan |

## 8. Common Troubleshooting

### 8.1 Masalah: 502 Bad Gateway

Gejala:

```text
502 Bad Gateway
```

Kemungkinan penyebab:

- Gateway tidak bisa terhubung ke service tujuan
- Service tujuan belum siap
- Konfigurasi routing di `nginx.conf` salah
- Port atau nama service tidak sesuai
- Gateway perlu di-restart setelah service lain hidup

Langkah pengecekan:

```bash
docker compose ps
docker compose logs gateway --tail=50
curl.exe http://localhost:8001/health
curl.exe http://localhost:8002/health
```

Jika service bisa diakses langsung melalui port `8001` atau `8002`, tetapi gagal melalui gateway, maka kemungkinan masalah berada pada konfigurasi gateway.

Contoh pengecekan ulang gateway:

```bash
docker compose restart gateway
curl.exe http://localhost/auth/health
```

### 8.2 Masalah: Database Disconnected

Gejala:

```json
{
  "database": {
    "status": "disconnected"
  }
}
```

Langkah pengecekan:

```bash
docker compose logs item-db --tail=50
docker compose exec item-db pg_isready -U postgres -d bye_virus
docker compose exec item-db psql -U postgres -d bye_virus -c "\dt"
```

Jika muncul:

```text
accepting connections
```

berarti database berjalan dan bisa menerima koneksi.

Jika service tetap membaca database `disconnected`, cek:

- Konfigurasi `DATABASE_URL`
- Kode health check pada service
- Migration atau tabel database
- Driver database yang digunakan service

Contoh `DATABASE_URL` yang benar untuk antar-container Docker:

```env
DATABASE_URL=postgresql://postgres:postgres@item-db:5432/bye_virus
```

Host harus menggunakan nama service Docker seperti `item-db`, bukan `localhost`.

### 8.3 Masalah: Role "root" Does Not Exist

Gejala pada log database:

```text
FATAL: role "root" does not exist
```

Kemungkinan penyebab:

- Healthcheck PostgreSQL menggunakan user default `root`
- Perintah `pg_isready` tidak menyebutkan user database
- Konfigurasi healthcheck di `docker-compose.yml` belum lengkap

Solusi:

Pastikan healthcheck menggunakan user PostgreSQL yang benar.

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d bye_virus"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Setelah diperbaiki, jalankan ulang service:

```bash
docker compose up -d --build item-db item-service
```

### 8.4 Masalah: Service Tidak Berjalan

Langkah pengecekan:

```bash
docker compose ps
docker compose logs nama-service --tail=80
```

Contoh:

```bash
docker compose logs item-service --tail=80
```

Jika service mati, jalankan ulang:

```bash
docker compose up -d --build nama-service
```

Contoh:

```bash
docker compose up -d --build item-service
```

### 8.5 Masalah: Log Belum Berbentuk JSON

Gejala log masih terlihat seperti:

```text
INFO: Started server process
INFO: Application startup complete
```

Kemungkinan penyebab:

- Structured logging belum aktif
- Middleware logging belum ditambahkan
- `setup_logging()` belum dipanggil di `main.py`
- Environment variable `SERVICE_NAME` dan `LOG_LEVEL` belum ditambahkan
- Request yang dicek belum melewati middleware aplikasi

Yang perlu dicek:

- File `logging_config.py`
- File `logging_middleware.py`
- Pemanggilan `setup_logging()` di `main.py`
- Penambahan `RequestLoggingMiddleware`
- Environment variable `SERVICE_NAME`
- Environment variable `LOG_LEVEL`

### 8.6 Masalah: Metrics Tidak Bisa Diakses

Gejala:

```text
404 Not Found
```

atau:

```text
502 Bad Gateway
```

Kemungkinan penyebab:

- Endpoint `/metrics` belum dibuat di service
- Route metrics belum ditambahkan di gateway
- Service belum di-rebuild
- Gateway belum membaca konfigurasi terbaru

Langkah pengecekan:

```bash
curl.exe http://localhost:8001/metrics
curl.exe http://localhost:8002/metrics
docker compose logs gateway --tail=50
```

## 9. Escalation Path

Escalation path atau alur eskalasi adalah tahapan penanganan masalah ketika kendala yang ditemukan tidak dapat diselesaikan hanya melalui pengecekan awal. Dalam proses monitoring, Lead QA & Docs bertugas melakukan pemeriksaan pertama melalui health check, log service, metrics, dan correlation ID. Jika dari hasil pengecekan ditemukan masalah yang membutuhkan perbaikan teknis lebih lanjut, maka masalah tersebut perlu diteruskan kepada role yang sesuai dengan bidang tanggung jawabnya.

| Masalah | Eskalasi ke |
|---|---|
| Error pada endpoint backend | Lead Backend |
| Error pada UI atau status page | Lead Frontend |
| Error Docker, gateway, port, deployment, dan workflow CI/CD | Lead DevOps |
| Dokumentasi monitoring atau hasil testing tidak jelas | Lead QA & Docs |

Alur eskalasi:

1. Lead QA & Docs melakukan pengecekan awal melalui health check, logs, metrics, dan correlation ID.
2. Jika masalah berasal dari backend, laporkan ke Lead Backend dengan bukti endpoint, response, dan log error.
3. Jika masalah berasal dari gateway, Docker, port, deployment, atau workflow GitHub, laporkan ke Lead DevOps atau penanggung jawab repository dengan hasil docker compose ps, log gateway, dan pesan error yang muncul.
4. Jika masalah berasal dari frontend atau status page, laporkan ke Lead Frontend.
5. Setelah masalah diperbaiki, Lead QA & Docs melakukan verifikasi ulang.

## 10. Checklist Operasional

Gunakan checklist berikut sebelum menyatakan sistem siap:

- [✓] Semua container berjalan dengan `docker compose ps`
- [✓] `auth-service` menunjukkan status `healthy`
- [✓] `item-service` menunjukkan status `healthy`
- [✓] Gateway dapat diakses melalui `http://localhost/health`
- [✓] Endpoint `/metrics` dapat diakses
- [✓] Log service dapat dibaca
- [✓] Correlation ID muncul pada response header
- [✓] Correlation ID dapat ditemukan di log
- [✓] Tidak ada error database seperti `role "root" does not exist`
- [✓] Tidak ada error `502 Bad Gateway`
