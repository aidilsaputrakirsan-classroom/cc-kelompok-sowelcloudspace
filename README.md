# 📦 Cloud App - Sowel Task

## Deskripsi Proyek
Aplikasi Sowel Task adalah To-Do List Kolaboratif berbasis cloud adalah sebuah platform produktivitas yang dirancang untuk membantu individu maupun kelompok mengatur dan menyelesaikan tugas secara lebih terstruktur. Aplikasi ini memungkinkan pengguna membuat daftar tugas harian atau proyek, menyimpannya di cloud agar dapat diakses dari berbagai perangkat, serta membagikannya kepada anggota tim atau keluarga. Dengan fitur kolaborasi real-time, setiap perubahan yang dilakukan oleh satu anggota—seperti menandai tugas selesai atau menambahkan catatan—akan langsung terlihat oleh semua anggota lain, sehingga transparansi progres kerja terjaga.

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

[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]

---

## 🚀 Getting Started

### 🔧 Prasyarat

- Python 3.10+
- Node.js 18+
- Git

### ⚙️ Backend Setup

cd backend  
pip install -r requirements.txt  
uvicorn main:app --reload --port 8000

### 🎨 Frontend Setup

cd frontend  
npm install  
npm run dev

---

## 📅 Roadmap

| Minggu | Target                 | Status |
| ------ | ---------------------- | ------ |
| 1      | Setup & Hello World    | ✅     |
| 2      | REST API + Database    | ✅     |
| 3      | React Frontend         | ✅     |
| 4      | Full-Stack Integration | ✅     |
| 5-7    | Docker & Compose       | ⬜     |
| 8      | UTS Demo               | ⬜     |
| 9-11   | CI/CD Pipeline         | ⬜     |
| 12-14  | Microservices          | ⬜     |
| 15-16  | Final & UAS            | ⬜     |

---

## 📁 Project Structure

```text
cc-kelompok-sowelcloudspace/
├── backend/
│   ├── main.py                                 # Updated (auth endpoints, CORS fix)
│   ├── auth.py                                 # BARU (JWT utilities)
│   ├── database.py
│   ├── models.py                               # Updated (+ User model)
│   ├── schemas.py                              # Updated (+ auth schemas)
│   ├── crud.py                                 # Updated (+ user CRUD)
│   ├── requirements.txt                        # Updated (+ jose, passlib, bcrypt)
│   ├── .env                                    # Updated (+ JWT & CORS config)
│   └── .env.example                            # Updated

├── frontend/                                    # React Frontend (Vite)
│   ├── public/                                  # Aset statis publik
│   ├── src/                                     # Source code utama
│   │   ├── assets/                              # Gambar & aset statis
│   │   ├── App.jsx                              # Komponen utama React
│   │   ├── App.css                              # Style komponen App
        ├── components/
            ├── Header.jsx                       # Judul & statistik
            ├── SearchBar.jsx                    # Input pencarian
            ├── ItemForm.jsx                     # Form create/edit item
            ├── ItemList.jsx                     # Container daftar items
            └── ItemCard.jsx                     # Card untuk setiap item
        ├── services/
        │   └── api.js                           # Semua fungsi fetch API
        └── main.jsx                             # Entry point (tidak diubah)
        └── index.css                            # Style global
│   ├── index.html                               # Template HTML utama
│   ├── package.json                             # Dependency & scripts Node.js
│   ├── vite.config.js                           # Konfigurasi Vite
│   └── eslint.config.js                         # Konfigurasi ESLint
│
├── docs/                                        # Dokumentasi tim
│   ├── member-[Anjas-Geofany-Diamare].md
│   ├── member-arya.md
│   ├── member-Cantika Ade Qutnindra Maharani.md
│   └── member-Meiske Handayani.md
│
├── -p/                                          # Folder tambahan (saat ini kosong)
├── .gitignore
└── README.md
```

# API Endpoints Documentation (updated)
Berikut adalah daftar endpoint yang telah diimplementasikan untuk mengelola data item:


## 🔐 Authentication

| Method   | Endpoint        | Auth Required | Penjelasan |
|-----------|----------------|---------------|------------|
| **POST**  | `/auth/register` | No  | Mendaftarkan user baru ke sistem. |
| **POST**  | `/auth/login`    | No  | Login user dan mendapatkan JWT access token. |

---

## 📦 Items

| Method   | Endpoint        | Auth Required | Penjelasan |
|-----------|----------------|---------------|------------|
| **GET**    | `/health`        | No  | Mengecek apakah server API berjalan dengan baik. |
| **GET**    | `/items`         | Yes | Mengambil seluruh daftar data item dari database. |
| **POST**   | `/items`         | Yes | Menambahkan data item baru ke dalam database. |
| **GET**    | `/items/{id}`    | Yes | Mengambil detail satu item berdasarkan ID. |
| **PUT**    | `/items/{id}`    | Yes | Memperbarui data item berdasarkan ID. |
| **DELETE** | `/items/{id}`    | Yes | Menghapus data item berdasarkan ID. |

---

## 🔑 Authentication Flow

1. Register melalui endpoint `/auth/register`
2. Login melalui endpoint `/auth/login`
3. Copy `access_token` dari response
4. Gunakan token pada header request:

```
Authorization: Bearer <access_token>
```

---

## ❌ Authentication Error Response

| Status Code | Keterangan |
|-------------|------------|
| 401 | Token tidak valid atau sudah expired |
| 401 | User tidak ditemukan |
| 403 | Akun tidak aktif |


## 1. Persiapan Database PostgreSQL

### Tahap 1: Persiapan Database dan Lingkungan

Tahap awal dilakukan untuk menghubungkan aplikasi dengan database sehingga data dapat disimpan secara persisten.

Langkah-langkah yang dilakukan:

- **Setup PostgreSQL**  
  Membuat database baru bernama `cloudapp` menggunakan **psql** atau **pgAdmin**.

- **Konfigurasi Environment**  
  Membuat file `.env` untuk menyimpan konfigurasi database, khususnya `DATABASE_URL` yang berisi informasi:
  - username database
  - password database
  - host database
  - nama database

  Selain itu dibuat juga file `.env.example` yang berfungsi sebagai template konfigurasi bagi anggota tim lain.

Contoh isi `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/cloudapp
```

- **Instalasi Dependencies**

Library yang digunakan pada backend diinstal menggunakan pip:

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

Penjelasan library:

| Library | Fungsi |
|-------|-------|
| SQLAlchemy | ORM (Object Relational Mapping) untuk berinteraksi dengan database menggunakan objek Python |
| psycopg2-binary | Driver PostgreSQL untuk Python |
| python-dotenv | Membaca konfigurasi dari file `.env` |

---

### Tahap 2: Pembangunan Arsitektur Kode

Struktur kode backend dibuat dengan konsep **Separation of Concerns**, yaitu memisahkan fungsi setiap komponen agar kode lebih terstruktur dan mudah dikelola.

Struktur utama backend:

| File | Fungsi |
|-----|------|
| **database.py** | Mengatur koneksi database dan menyediakan session database untuk setiap request API |
| **models.py** | Mendefinisikan struktur tabel database menggunakan SQLAlchemy ORM |
| **schemas.py** | Mendefinisikan struktur data request dan response menggunakan Pydantic |
| **crud.py** | Berisi fungsi untuk operasi database seperti Create, Read, Update, dan Delete |

Dengan arsitektur ini, logika aplikasi menjadi lebih modular dan mudah untuk dikembangkan di masa depan.

---

### Tahap 3: Implementasi API Endpoint dan Testing

Pada tahap ini seluruh komponen backend digabungkan agar dapat diakses melalui HTTP request.

Langkah yang dilakukan:

- **Integrasi Endpoint**

Seluruh komponen backend diintegrasikan pada file `main.py`. File ini berfungsi sebagai entry point aplikasi yang akan dijalankan oleh server.

- **Penyediaan Endpoint API**

Aplikasi menyediakan beberapa endpoint utama untuk mengelola resource `/items`, yaitu:

- Create item
- Get item
- Update item
- Delete item
- Get list item
- Statistik item

Selain itu tersedia endpoint tambahan seperti:

- `/health` → mengecek status server  
- `/team` → menampilkan informasi tim pengembang

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

---

## 3. Verifikasi Pengujian

Pengujian dilakukan menggunakan **Swagger UI** untuk memastikan setiap endpoint API berjalan sesuai dengan spesifikasi yang telah ditetapkan.

Hasil pengujian menunjukkan bahwa seluruh endpoint berhasil dijalankan dan menghasilkan response yang sesuai dengan yang diharapkan.

Dengan demikian seluruh skenario pengujian dinyatakan **berhasil (PASS)**.

---

### 3.1 Hasil Pengujian Endpoint

#### 1. DELETE /items/{item_id}

**Method**

```
DELETE
```

**URL**

```
/items/{item_id}
```

**Response Code**

```
204 No Content
```

Endpoint ini digunakan untuk **menghapus data item berdasarkan ID**.

---

#### 2. GET /health

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
  "status": "healthy",
  "version": "0.2.0"
}
```

Endpoint ini digunakan untuk **mengecek status server backend**.

---

#### 3. GET /items/{item_id}

**Method**

```
GET
```

**URL**

```
/items/{item_id}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 10,
  "id": 12,
  "created_at": "2026-03-08T20:46:17.888499+08:00",
  "updated_at": null
}
```

Endpoint ini digunakan untuk **mengambil data item berdasarkan ID**.

---

#### 4. GET /items/stats

**Method**

```
GET
```

**URL**

```
/items/stats
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "total_items": 3,
  "total_value": 15460000,
  "most_expensive": {
    "id": 12,
    "name": "Laptop",
    "price": 14000000
  },
  "cheapest": {
    "id": 9,
    "name": "Mouse Wireless",
    "price": 250000
  }
}
```

Endpoint ini digunakan untuk **menampilkan statistik data item yang tersimpan di database**.

---

#### 5. GET /items

**Method**

```
GET
```

**URL**

```
/items
```

**Response Code**

```
200 OK
```

**Response Body**

```json
[
  {
    "name": "Mouse Wireless",
    "description": "Mouse bluetooth",
    "price": 250000,
    "quantity": 20,
    "id": 11,
    "created_at": "2026-03-08T11:58:01.374431+08:00",
    "updated_at": null
  },
  {
    "name": "Keyboard Mechanical",
    "description": "Keyboard untuk coding",
    "price": 1200000,
    "quantity": 8,
    "id": "10",
    "created_at": "2026-03-03T09:04:14.647867+08:00",
    "updated_at": null
  },
  {
    "name": "Mouse Wireless",
    "description": "Mouse bluetooth",
    "price": 250000,
    "quantity": 20,
    "id": 9,
    "created_at": "2026-03-03T09:04:10.858001+08:00",
    "updated_at": null
  }
]
```

Endpoint ini digunakan untuk **menampilkan seluruh data item yang tersimpan di database**.

---

#### 6. GET /team

**Method**

```
GET
```

**URL**

```
/team
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "team": "cloud-team-sowelcloudspace",
  "members": [
    {
      "name": "Anjas Geofany Diamare",
      "nim": "10231016",
      "role": "Lead Backend"
    },
    {
      "name": "Cantika Ade Qutnindra Maharani",
      "nim": "10231024",
      "role": "Lead Frontend"
    },
    {
      "name": "Arya Wijaya Saroyo",
      "nim": "10231020",
      "role": "Lead DevOps"
    },
    {
      "name": "Meiske Handayani",
      "nim": "10231052",
      "role": "Lead QA & Docs"
    }
  ]
}
```

Endpoint ini digunakan untuk **menampilkan informasi tim pengembang aplikasi**.

---

#### 7. POST /items

**Method**

```
POST
```

**URL**

```
/items
```

**Response Code**

```
201 Created
```

**Response Body**

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 10,
  "id": 12,
  "created_at": "2026-03-08T20:46:17.888499+08:00",
  "updated_at": null
}
```

Endpoint ini digunakan untuk **menambahkan data item baru ke dalam database**.

---

#### 8. PUT /items/{item_id}

**Method**

```
PUT
```

**URL**

```
/items/{item_id}
```

**Response Code**

```
200 OK
```

**Response Body**

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 14000000,
  "quantity": 10,
  "id": 12,
  "created_at": "2026-03-08T20:46:17.888499+08:00",
  "updated_at": "2026-03-08T21:35:50.002500+08:00"
}
```

Endpoint ini digunakan untuk **memperbarui data item yang sudah ada berdasarkan ID**.

### 3.2 Rangkuman Hasil Pengujian

Seluruh endpoint telah diuji melalui Swagger UI dan berfungsi sesuai dengan spesifikasi. Backend dinyatakan stabil serta siap untuk integrasi dengan frontend dan deployment ke lingkungan cloud. 🚀

| No | Method | URL | Request Body | Response Body (Actual) | HTTP Status Code | Hasil Pengujian |
|----|-------|-----|-------------|-----------------------|-----------------|----------------|
| 1 | POST | /items | `{name, description, price, quantity}` | Data item baru + ID & Timestamp | 201 Created | ✅ Sesuai |
| 2 | GET | /items | - | List item (JSON Array) | 200 OK | ✅ Sesuai |
| 3 | GET | /items/12 | - | Detail item (Laptop) | 200 OK | ✅ Sesuai |
| 4 | PUT | /items/12 | `{price: 14000000}` | Data item ter-update & timestamp berubah | 200 OK | ✅ Sesuai |
| 5 | DELETE | /items/11 | - | Item berhasil dihapus | 204 No Content | ✅ Sesuai |
| 6 | GET | /items/stats | - | Statistik item (total item, nilai total, item termahal & termurah) | 200 OK | ✅ Sesuai |
| 7 | GET | /health | - | Status server healthy | 200 OK | ✅ Sesuai |
| 8 | GET | /team | - | Informasi tim pengembang | 200 OK | ✅ Sesuai |


# 🧪 Hasil Testing Modul 4

## 🔍 Testing Scenario: Authentication & Items Flow

| No | Skenario Testing | Hasil | Keterangan |
|----|------------------|--------|------------|
| 1 | Login page muncul | ✅ Berhasil | Halaman login tampil dengan normal saat aplikasi dibuka |
| 2 | Register user baru | ✅ Berhasil | User baru berhasil dibuat dan tersimpan di database |
| 3 | Otomatis login setelah register | ✅ Berhasil | Sistem langsung memberikan akses setelah registrasi |
| 4 | Main app + items muncul | ✅ Berhasil | Dashboard dan daftar items tampil dengan benar |
| 5 | Nama user di header | ✅ Berhasil | Nama user login tampil sesuai akun |
| 6 | CRUD items berfungsi | ✅ Berhasil | Create, Read, Update, Delete berjalan normal |
| 7 | Klik Logout | ✅ Berhasil | User berhasil logout dari sistem |
| 8 | Kembali ke login page | ✅ Berhasil | Setelah logout, diarahkan ke halaman login |
| 9 | Login kembali dengan akun tadi | ✅ Berhasil | User dapat login kembali tanpa kendala |
| 10 | Data items masih ada | ✅ Berhasil | Data tetap tersimpan di database (persistent) |

---

