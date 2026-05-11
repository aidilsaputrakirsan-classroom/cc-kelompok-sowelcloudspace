# 📦 Cloud App - Sowel Task
![CI](https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-sowelcloudspace/actions/workflows/ci.yml/badge.svg)



## Deskripsi Proyek
Aplikasi Sowel Task adalah To-Do List Kolaboratif berbasis cloud adalah sebuah platform produktivitas yang dirancang untuk membantu individu maupun kelompok mengatur dan menyelesaikan tugas secara lebih terstruktur. Aplikasi ini memungkinkan pengguna membuat daftar tugas harian atau proyek, menyimpannya di cloud agar dapat diakses dari berbagai perangkat, serta membagikannya kepada anggota tim atau keluarga. Dengan fitur kolaborasi real-time, setiap perubahan yang dilakukan oleh satu anggota seperti menandai tugas selesai atau menambahkan catatan akan langsung terlihat oleh semua anggota lain, sehingga transparansi progres kerja terjaga.

Target utama aplikasi ini adalah tim kerja kecil, mahasiswa yang mengerjakan tugas kelompok, atau keluarga yang ingin mengatur kegiatan bersama. Masalah utama yang diselesaikan adalah koordinasi yang sering terhambat karena catatan tugas tersebar di perangkat berbeda, kurangnya sinkronisasi antar anggota, serta kesulitan memantau siapa yang sudah menyelesaikan tugas. Dengan adanya fitur pengingat deadline, label prioritas, dan dashboard progres, aplikasi ini membantu pengguna tetap fokus pada hal penting, mengurangi risiko lupa, serta meningkatkan efisiensi kerja kelompok.
Secara keseluruhan, aplikasi ini menjadi solusi ringan namun efektif untuk kebutuhan kolaborasi sehari-hari, menawarkan kemudahan akses lintas perangkat, keamanan data melalui cloud, dan pengalaman kerja yang lebih terorganisir tanpa kompleksitas sistem manajemen proyek besar.

## 👥 Tim

| Nama                           | NIM      | Peran          |
| ------------------------------ | -------- | -------------- |
| Anjas Geofany Diamare          | 10231016 | Lead Backend   |
| Cantika Ade Qutnindra Maharani | 10231024 | Lead Frontend  |
| Arya Wijaya Saroyo             | 10231020 | Lead DevOps    |
| Meiske Handayani               | 10231052 | Lead QA & Docs |

---

## 🛠️ Tech Stack

| Teknologi        | Fungsi           |
| ---------------- | ---------------- |
| FastAPI          | Backend REST API |
| React            | Frontend SPA     |
| PostgreSQL       | Database         |
| Docker           | Containerization |
| GitHub Actions   | CI/CD            |
| Railway / Render | Cloud Deployment |

---

## 🏗️ Architecture

User (Browser)
     ↓
[ React Frontend (Docker Container) ]
     ↓ HTTP
[ FastAPI Backend (Docker Container) ]
     ↓
[ PostgreSQL Database (Docker Container + Volume) ]

---

## 🚀 Getting Started

### 🔧 Prasyarat

- Python 3.10+
- Node.js 18+
- Git

### ⚙️ Backend Setup (Without Docker)

cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

### 🎨 Frontend Setup (Without Docker)

cd frontend
npm install
npm run dev

### 🐳 Run with Docker

docker-compose up --build

---

## 📅 Roadmap

| Minggu | Target                 | Status |
| ------ | ---------------------- | ------ |
| 1      | Setup & Hello World    | ✅     |
| 2      | REST API + Database    | ✅     |
| 3      | React Frontend         | ✅     |
| 4      | Full-Stack Integration | ✅     |
| 5-7    | Docker & Compose       | ✅     |
| 8      | UTS Demo               | ⬜     |
| 9-11   | CI/CD Pipeline         | ⬜     |
| 12-14  | Microservices          | ⬜     |
| 15-16  | Final & UAS            | ⬜     |

---

## 📁 Project Structure

```text
cc-kelompok-sowelcloudspace/
├── docker-compose.yml                           # BARU (orchestrasi multi-container: backend, frontend, db, dll)

├── backend/                                     # FastAPI Backend
│   ├── scripts/
│   │   └── wait-for-db.sh                       # Startup script — ping PostgreSQL sebelum start uvicorn
│   ├── main.py                                  # Entry point aplikasi (auth endpoints, CORS, task CRUD)
│   ├── auth.py                                  # JWT utilities (create token)
│   ├── database.py                              # Koneksi database & session management
│   ├── models.py                                # SQLAlchemy models (Task, User)
│   ├── schemas.py                               # Pydantic schemas (TaskCreate, TaskUpdate, TaskResponse, UserCreate)
│   ├── crud.py                                  # CRUD operations (user + task)
│   ├── requirements.txt                         # Python dependencies (fastapi, jose, passlib, bcrypt, dll)
│   ├── Dockerfile                               # Docker image config (multi-step, healthcheck, wait-for-db)
│   ├── .dockerignore                            # File yang dikecualikan dari Docker build
│   ├── .env                                     # Environment variables (DATABASE_URL, JWT, CORS)
│   ├── .env.docker                              # BARU (env khusus untuk container Docker)
│   └── .env.example                             # Template konfigurasi environment
│
├── frontend/                                    # React Frontend (Vite + Nginx)
│   ├── public/                                  # Aset statis publik
│   │   └── vite.svg
│   ├── src/                                     # Source code utama
│   │   ├── assets/                              # Gambar & aset statis
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── Header.jsx                       # Header & statistik task
│   │   │   ├── LoginPage.jsx                    # Halaman login & register
│   │   │   ├── SearchBar.jsx                    # Input pencarian task
│   │   │   ├── SortDropdown.jsx                 # Dropdown sorting task
│   │   │   ├── TaskCard.jsx                     # Card untuk setiap task
│   │   │   ├── TaskForm.jsx                     # Form create/edit task
│   │   │   ├── TaskList.jsx                     # Container daftar tasks
│   │   │   └── ItemList.jsx                     # Container daftar items (legacy)
│   ├── services/
│   │   └── api.js                               # Semua fungsi fetch API
│   ├── App.jsx                                  # Komponen utama React
│   ├── App.css                                  # Style komponen App
│   ├── main.jsx                                 # Entry point React
│   ├── index.css                                # Style global
│   ├── index.html                               # Template HTML utama
│   ├── package.json                             # Dependency & scripts Node.js
│   ├── vite.config.js                           # Konfigurasi Vite
│   ├── eslint.config.js                         # Konfigurasi ESLint
│   ├── Dockerfile                               # BARU (build + serve pakai Nginx)
│   ├── nginx.conf                               # BARU (config reverse proxy / static serve)
│   └── .dockerignore                            # BARU
│
├── docs/                                        # Dokumentasi tim
│   ├── docs/
│   │   └── image-comparison.md
│   ├── images/                                  # Screenshot endpoint & hasil testing
│   ├── member-[Anjas-Geofany-Diamare].md
│   ├── member-arya.md
│   ├── member-Cantika Ade Qutnindra Maharani.md
│   ├── member-Meiske Handayani.md
│   ├── api-test-results.md
│   ├── docker-cheatsheet.md
│   └── ui-test-result.md
│
├── setup.sh                                     # Script setup awal proyek
├── .gitignore
└── README.md
```

# API Endpoints Documentation

Berikut adalah daftar endpoint yang telah diimplementasikan pada aplikasi Sowel Task:

## 🔐 Authentication

| Method   | Endpoint        | Auth Required | Penjelasan |
|-----------|----------------|---------------|------------|
| **POST**  | `/auth/register` | No  | Mendaftarkan user baru ke sistem. |
| **POST**  | `/auth/login`    | No  | Login user (OAuth2 password flow) dan mendapatkan JWT access token. |

---

## ✅ Tasks

| Method   | Endpoint                | Auth Required | Penjelasan |
|-----------|------------------------|---------------|------------|
| **GET**    | `/`                    | No  | Root endpoint — mengecek apakah API berjalan. |
| **GET**    | `/health`              | No  | Health check — status server. |
| **POST**   | `/tasks`              | Yes | Membuat task baru. |
| **GET**    | `/tasks`               | Yes | Mengambil seluruh daftar task. |
| **GET**    | `/tasks/{task_id}`     | Yes | Mengambil detail satu task berdasarkan ID. |
| **PUT**    | `/tasks/{task_id}`     | Yes | Memperbarui data task berdasarkan ID. |
| **DELETE** | `/tasks/{task_id}`     | Yes | Menghapus task berdasarkan ID. |
| **PUT**    | `/tasks/{task_id}/complete` | Yes | Menandai task sebagai selesai (status → done). |
| **GET**    | `/tasks/stats`         | Yes | Menampilkan statistik task (total, completed, pending). |

---

## 🔑 Authentication Flow

1. Register melalui endpoint `/auth/register`
2. Login melalui endpoint `/auth/login`
3. Copy `access_token` dari response
4. Gunakan token pada header request:

```
Authorization: Bearer <access_token>
```

Atau gunakan tombol **Authorize** di Swagger UI (`/docs`) untuk otomatis menambahkan token.

---

## ❌ Authentication Error Response

| Status Code | Keterangan |
|-------------|------------|
| 401 | Token tidak valid atau sudah expired |
| 401 | Email atau password salah |
| 400 | Email sudah terdaftar |

---

## 1. Persiapan Database PostgreSQL

### Tahap 1: Persiapan Database dan Lingkungan

Tahap awal dilakukan untuk menghubungkan aplikasi dengan database sehingga data dapat disimpan secara persisten.

Langkah-langkah yang dilakukan:

- **Setup PostgreSQL**  
  Membuat database baru bernama `sowel_task` menggunakan **psql** atau **pgAdmin**.

- **Konfigurasi Environment**  
  Membuat file `.env` untuk menyimpan konfigurasi database, khususnya `DATABASE_URL` yang berisi informasi:
  - username database
  - password database
  - host database
  - nama database

  Selain itu dibuat juga file `.env.example` yang berfungsi sebagai template konfigurasi bagi anggota tim lain.

Contoh isi `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/sowel_task

# JWT
SECRET_KEY=your-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

- **Instalasi Dependencies**

Library yang digunakan pada backend diinstal menggunakan pip:

```bash
pip install -r requirements.txt
```

Penjelasan library:

| Library | Fungsi |
|-------|-------|
| FastAPI | Web framework untuk REST API |
| Uvicorn | ASGI server untuk menjalankan FastAPI |
| SQLAlchemy | ORM (Object Relational Mapping) untuk berinteraksi dengan database |
| psycopg2-binary | Driver PostgreSQL untuk Python |
| python-dotenv | Membaca konfigurasi dari file `.env` |
| python-jose | Library untuk membuat dan memverifikasi JWT token |
| passlib + bcrypt | Hashing dan verifikasi password |
| pydantic[email] | Validasi data request/response |

---

### Tahap 2: Pembangunan Arsitektur Kode

Struktur kode backend dibuat dengan konsep **Separation of Concerns**, yaitu memisahkan fungsi setiap komponen agar kode lebih terstruktur dan mudah dikelola.

Struktur utama backend:

| File | Fungsi |
|-----|------|
| **database.py** | Mengatur koneksi database dan menyediakan session database untuk setiap request API |
| **models.py** | Mendefinisikan struktur tabel database (Task & User) menggunakan SQLAlchemy ORM |
| **schemas.py** | Mendefinisikan struktur data request dan response (Task & Auth) menggunakan Pydantic |
| **crud.py** | Berisi fungsi untuk operasi database (CRUD task + user authentication) |
| **auth.py** | Utility untuk membuat JWT access token |
| **scripts/wait-for-db.sh** | Startup script yang menunggu PostgreSQL siap sebelum menjalankan uvicorn |

Dengan arsitektur ini, logika aplikasi menjadi lebih modular dan mudah untuk dikembangkan di masa depan.

---

### Tahap 3: Implementasi API Endpoint dan Testing

Pada tahap ini seluruh komponen backend digabungkan agar dapat diakses melalui HTTP request.

Langkah yang dilakukan:

- **Integrasi Endpoint**

Seluruh komponen backend diintegrasikan pada file `main.py`. File ini berfungsi sebagai entry point aplikasi yang akan dijalankan oleh server.

- **Penyediaan Endpoint API**

Aplikasi menyediakan beberapa endpoint utama untuk mengelola resource `/tasks`, yaitu:

- Create task
- Get all tasks
- Get task by ID
- Update task
- Delete task
- Complete task (mark as done)
- Statistik task

Selain itu tersedia endpoint tambahan seperti:

- `/` → root endpoint (API running check)
- `/health` → mengecek status server
- `/auth/register` → registrasi user baru
- `/auth/login` → login dan mendapatkan JWT token

- **Testing melalui Swagger UI**

FastAPI secara otomatis menyediakan dokumentasi API interaktif menggunakan **Swagger UI** sehingga endpoint dapat diuji langsung melalui browser.

---

## 2. Eksekusi Endpoint dan Testing

### 2.1 Menjalankan Server

Server backend dijalankan menggunakan perintah berikut:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Penjelasan:

- **cd backend**  
  Perintah `cd` (change directory) digunakan untuk berpindah ke folder `backend` tempat kode server berada.

- **uvicorn main:app**  
  Menjalankan server aplikasi Python menggunakan **Uvicorn**, dengan file `main.py` dan objek aplikasi `app`.

- **--reload**  
  Server akan otomatis melakukan restart jika terdapat perubahan pada kode.

- **--port 8000**  
  Menentukan port server yang digunakan.

Server dapat diakses pada alamat berikut:

```
http://localhost:8000
```

---

### 2.2 Dokumentasi API melalui Swagger UI

FastAPI secara otomatis menyediakan dokumentasi interaktif berbasis **Swagger UI** yang memungkinkan pengguna untuk melihat dan menguji endpoint API secara langsung.

Dokumentasi tersebut dapat diakses melalui browser pada alamat berikut:

```
http://localhost:8000/docs
```

Melalui halaman ini pengguna dapat:

- melihat daftar endpoint
- melihat parameter request
- melihat response API
- melakukan pengujian endpoint secara langsung
- menggunakan tombol **Authorize** untuk menambahkan JWT token

---

## 3. Verifikasi Pengujian

Pengujian dilakukan menggunakan **Swagger UI** untuk memastikan setiap endpoint API berjalan sesuai dengan spesifikasi yang telah ditetapkan.

Hasil pengujian menunjukkan bahwa seluruh endpoint berhasil dijalankan dan menghasilkan response yang sesuai dengan yang diharapkan.

Dengan demikian seluruh skenario pengujian dinyatakan **berhasil (PASS)**.

---

### 3.1 Hasil Pengujian Endpoint

#### 1. GET /health

**Method**

```
GET
```

**URL**

```
/health
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "status": "healthy"
}
```

Endpoint ini digunakan untuk **mengecek status server backend**.

---

#### 2. POST /auth/register

**Method**

```
POST
```

**URL**

```
/auth/register
```

**Request Body**

```json
{
  "email": "user@example.com",
  "name": "Test User",
  "password": "password123"
}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Test User"
}
```

Endpoint ini digunakan untuk **mendaftarkan user baru ke dalam sistem**.

---

#### 3. POST /auth/login

**Method**

```
POST
```

**URL**

```
/auth/login
```

**Request Body** (OAuth2 form)

```
username: user@example.com
password: password123
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Endpoint ini digunakan untuk **login user dan mendapatkan JWT access token**.

---

#### 4. POST /tasks

**Method**

```
POST
```

**URL**

```
/tasks
```

**Request Body**

```json
{
  "title": "Belajar Cloud Computing",
  "description": "Menyelesaikan modul Docker",
  "priority": "high",
  "deadline": "2026-04-15T23:59:00",
  "assigned_to": "Anjas"
}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "title": "Belajar Cloud Computing",
  "description": "Menyelesaikan modul Docker",
  "priority": "high",
  "deadline": "2026-04-15T23:59:00",
  "assigned_to": "Anjas",
  "id": 1,
  "status": "pending",
  "created_at": "2026-04-10T15:00:00+08:00"
}
```

Endpoint ini digunakan untuk **membuat task baru**.

---

#### 5. GET /tasks

**Method**

```
GET
```

**URL**

```
/tasks
```

**Response Code**

```
200 OK
```

**Response Body**

```json
[
  {
    "title": "Belajar Cloud Computing",
    "description": "Menyelesaikan modul Docker",
    "priority": "high",
    "deadline": "2026-04-15T23:59:00",
    "assigned_to": "Anjas",
    "id": 1,
    "status": "pending",
    "created_at": "2026-04-10T15:00:00+08:00"
  }
]
```

Endpoint ini digunakan untuk **menampilkan seluruh data task yang tersimpan di database**.

---

#### 6. GET /tasks/{task_id}

**Method**

```
GET
```

**URL**

```
/tasks/{task_id}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "title": "Belajar Cloud Computing",
  "description": "Menyelesaikan modul Docker",
  "priority": "high",
  "deadline": "2026-04-15T23:59:00",
  "assigned_to": "Anjas",
  "id": 1,
  "status": "pending",
  "created_at": "2026-04-10T15:00:00+08:00"
}
```

Endpoint ini digunakan untuk **mengambil detail task berdasarkan ID**.

---

#### 7. PUT /tasks/{task_id}

**Method**

```
PUT
```

**URL**

```
/tasks/{task_id}
```

**Request Body**

```json
{
  "title": "Belajar Cloud Computing (Updated)",
  "priority": "medium"
}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "title": "Belajar Cloud Computing (Updated)",
  "description": "Menyelesaikan modul Docker",
  "priority": "medium",
  "deadline": "2026-04-15T23:59:00",
  "assigned_to": "Anjas",
  "id": 1,
  "status": "pending",
  "created_at": "2026-04-10T15:00:00+08:00"
}
```

Endpoint ini digunakan untuk **memperbarui data task berdasarkan ID**.

---

#### 8. PUT /tasks/{task_id}/complete

**Method**

```
PUT
```

**URL**

```
/tasks/{task_id}/complete
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "title": "Belajar Cloud Computing (Updated)",
  "description": "Menyelesaikan modul Docker",
  "priority": "medium",
  "deadline": "2026-04-15T23:59:00",
  "assigned_to": "Anjas",
  "id": 1,
  "status": "done",
  "created_at": "2026-04-10T15:00:00+08:00"
}
```

Endpoint ini digunakan untuk **menandai task sebagai selesai (status menjadi "done")**.

---

#### 9. GET /tasks/stats

**Method**

```
GET
```

**URL**

```
/tasks/stats
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "total": 5,
  "completed": 2,
  "pending": 3
}
```

Endpoint ini digunakan untuk **menampilkan statistik task (total, completed, pending)**.

---

#### 10. DELETE /tasks/{task_id}

**Method**

```
DELETE
```

**URL**

```
/tasks/{task_id}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "message": "Deleted"
}
```

Endpoint ini digunakan untuk **menghapus task berdasarkan ID**.

---

### 3.2 Rangkuman Hasil Pengujian

Seluruh endpoint telah diuji melalui Swagger UI dan berfungsi sesuai dengan spesifikasi. Backend dinyatakan stabil serta siap untuk integrasi dengan frontend dan deployment ke lingkungan cloud. 🚀

| No | Method | URL | Auth | Request Body | Response Body (Actual) | HTTP Status Code | Hasil |
|----|--------|-----|------|-------------|------------------------|-----------------|-------|
| 1 | GET | `/health` | No | - | Status healthy | 200 OK | ✅ |
| 2 | POST | `/auth/register` | No | `{email, name, password}` | User data (id, email, name) | 200 OK | ✅ |
| 3 | POST | `/auth/login` | No | `{username, password}` (form) | JWT access token | 200 OK | ✅ |
| 4 | POST | `/tasks` | Yes | `{title, description, priority, deadline, assigned_to}` | Task baru + ID & timestamp | 200 OK | ✅ |
| 5 | GET | `/tasks` | Yes | - | List task (JSON Array) | 200 OK | ✅ |
| 6 | GET | `/tasks/{id}` | Yes | - | Detail task | 200 OK | ✅ |
| 7 | PUT | `/tasks/{id}` | Yes | `{field: value}` | Task ter-update | 200 OK | ✅ |
| 8 | PUT | `/tasks/{id}/complete` | Yes | - | Task dengan status "done" | 200 OK | ✅ |
| 9 | GET | `/tasks/stats` | Yes | - | Statistik (total, completed, pending) | 200 OK | ✅ |
| 10 | DELETE | `/tasks/{id}` | Yes | - | `{"message": "Deleted"}` | 200 OK | ✅ |


# 🧪 Hasil Testing Modul 4

## 🔍 Testing Scenario: Authentication & Tasks Flow

| No | Skenario Testing | Hasil | Keterangan |
|----|------------------|--------|------------|
| 1 | Login page muncul | ✅ Berhasil | Halaman login tampil dengan normal saat aplikasi dibuka |
| 2 | Register user baru | ✅ Berhasil | User baru berhasil dibuat dan tersimpan di database |
| 3 | Otomatis login setelah register | ✅ Berhasil | Sistem langsung memberikan akses setelah registrasi |
| 4 | Main app + tasks muncul | ✅ Berhasil | Dashboard dan daftar tasks tampil dengan benar |
| 5 | Nama user di header | ✅ Berhasil | Nama user login tampil sesuai akun |
| 6 | CRUD tasks berfungsi | ✅ Berhasil | Create, Read, Update, Delete berjalan normal |
| 7 | Klik Logout | ✅ Berhasil | User berhasil logout dari sistem |
| 8 | Kembali ke login page | ✅ Berhasil | Setelah logout, diarahkan ke halaman login |
| 9 | Login kembali dengan akun tadi | ✅ Berhasil | User dapat login kembali tanpa kendala |
| 10 | Data tasks masih ada | ✅ Berhasil | Data tetap tersimpan di database (persistent) |

---
