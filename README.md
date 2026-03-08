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
| 3      | React Frontend         | ⬜     |
| 4      | Full-Stack Integration | ⬜     |
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
│   ├── main.py                                  # FastAPI Backend
│   ├── database.py                              # Entry point aplikasi backend
│   ├── models.py                                # Definisi tabel database
│   ├── schemas.py                               # Validasi data input/output
│   ├── crud.py                                  # Logika operasional database 
│   ├── requirements.txt                         # Updated
│   └── .env.example                             # New

├── frontend/                                    # React Frontend (Vite)
│   ├── public/                                  # Aset statis publik
│   ├── src/                                     # Source code utama
│   │   ├── assets/                              # Gambar & aset statis
│   │   ├── App.jsx                              # Komponen utama React
│   │   ├── App.css                              # Style komponen App
│   │   ├── main.jsx                             # Entry point React
│   │   └── index.css                            # Style global
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

# API Endpoints Documentation
Berikut adalah daftar endpoint yang telah diimplementasikan untuk mengelola data item:

|   Method   |    Endpoint   |                     Penjelasan                       |
| -----------| ------------- | -----------------------------------------------------|
| **GET**    | `/health`     | Mengecek apakah server API berjalan dengan baik.     |
| **GET**    | `/items`      | Mengambil seluruh daftar data item dari database.    |
| **POST**   | `/items`      | Menambahkan data item baru ke dalam database.        |
| **GET**    | `/items/{id}` | Mengambil detail informasi satu item berdasarkan ID. |
| **PUT**    | `/items/{id}` | Memperbarui data item yang sudah ada berdasarkan ID. |
| **DELETE** | `/items/{id}` | Menghapus data item dari database berdasarkan ID.    |


# Instruksi Penggunaan 
**TAHAP 1 : Persiapan Database & Lingkungan**
Langkah awal untuk menghubungkan aplikasi dengan data persisten:
- Setup PostgreSQL: Membuat database bernama cloudapp melalui psql atau pgAdmin.
- Konfigurasi Environment: Membuat file .env untuk menyimpan DATABASE_URL (berisi user, password, dan host database) dan file .env.example sebagai template untuk tim.
- Instalasi Dependencies: Menginstal library utama yaitu sqlalchemy (untuk database), psycopg2-binary (driver database), dan python-dotenv (untuk membaca file .env).

**TAHAP 2 : Pembangunan Arsitektur Kode**
Memisahkan kode berdasarkan fungsinya (Separation of Concerns) agar mudah dikelola:
- database.py: Mengatur koneksi (engine) dan menyediakan session database untuk setiap request API.
- models.py: Mendefinisikan struktur tabel database (seperti tabel items) menggunakan SQLAlchemy ORM agar data bisa diolah sebagai objek Python.
- schemas.py: Menggunakan Pydantic untuk memvalidasi data yang masuk dari user (Request) dan data yang dikirim balik ke user (Response).
- crud.py: Berisi fungsi logika utama untuk memanipulasi data di database, seperti menambah, mengambil, mengubah, dan menghapus data.

**TAHAP 3 : Implementasi API Endpoints & Testing**
Tahap akhir untuk menyediakan akses bagi frontend:
- Endpoint Integration: Menyatukan semua komponen di main.py sehingga server dapat menerima request HTTP dan menjalankan perintah database yang sesuai.
- API Endpoints: Tersedia 5 endpoint utama untuk operasi CRUD pada resource /items, serta endpoint /health untuk cek status server.
- Testing via Swagger UI: Melakukan verifikasi fungsionalitas API melalui dokumentasi interaktif di http://localhost:8000/docs.