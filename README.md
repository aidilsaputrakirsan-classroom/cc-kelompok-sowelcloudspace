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
| 2      | REST API + Database    | ⬜     |
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
├── backend/                                     # FastAPI Backend
│   ├── main.py                                  # Entry point aplikasi backend
│   └── requirements.txt                         # Daftar dependency Python
│
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
