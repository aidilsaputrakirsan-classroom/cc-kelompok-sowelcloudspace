# 🚀 Release Notes — Milestone 2

Dokumen ini berisi catatan rilis untuk Milestone 2. Pada milestone ini, aplikasi telah berhasil di-deploy ke environment production menggunakan Railway dan seluruh fitur utama telah berhasil diuji pada environment development maupun production.

---

## 1. Fitur yang Sudah Ada

Berikut adalah fitur yang telah tersedia pada aplikasi:

| No | Modul             | Fitur                      | Keterangan                                                            |
| -- | ----------------- | -------------------------- | --------------------------------------------------------------------- |
| 1  | Autentikasi       | Register User              | Membuat akun pengguna baru                                            |
| 2  | Autentikasi       | Login User                 | Masuk ke aplikasi menggunakan akun yang terdaftar                     |
| 3  | Task Management   | Create Task                | Menambahkan tugas baru                                                |
| 4  | Task Management   | Read Tasks                 | Menampilkan daftar tugas                                              |
| 5  | Task Management   | Update Task                | Mengubah informasi tugas                                              |
| 6  | Task Management   | Delete Task                | Menghapus tugas                                                       |
| 7  | Task Management   | Search Task                | Mencari tugas berdasarkan kata kunci                                  |
| 8  | Calendar          | Calendar View              | Menampilkan deadline tugas dalam tampilan kalender                    |
| 9  | Progress Tracking | Task Progress              | Menampilkan progres tugas berdasarkan status pengerjaan               |
| 10 | Progress Tracking | Due Date Monitoring        | Menampilkan tugas yang akan datang, terlambat, atau telah selesai     |
| 11 | Analytics         | Task Percentage Statistics | Menampilkan persentase tugas selesai, terlambat, dan masih dikerjakan |
| 12 | Reminder          | Reminder Folder            | Menyimpan dan mengelola pengingat tugas                               |
| 13 | Collaboration     | Shared Folder              | Berbagi tugas dan dokumen dengan pengguna lain                        |
| 14 | Workspace         | Personal Space             | Ruang kerja pribadi untuk mengelola tugas pengguna                    |
| 15 | Monitoring        | Health Check               | Memeriksa status backend melalui endpoint `/health`                   |

---

## 2. URL Production

| Service | URL |
|---------|-----|
| Frontend | https://frontend-production-93f7a.up.railway.app/              |
| Backend API | https://backend-production-b026.up.railway.app/             |
| API Docs (Swagger) | https://backend-production-b026.up.railway.app/docs  |

---

## 3. Tech Stack

| Komponen         | Teknologi           |
| ---------------- | ------------------- |
| Frontend         | React + Vite        |
| Backend          | FastAPI             |
| Database         | PostgreSQL / SQLite |
| Containerization | Docker              |
| CI/CD            | GitHub Actions      |
| Deployment       | Railway             |
| Testing Backend  | pytest              |
| Testing Frontend | Vitest              |

---

## 4. CI/CD Summary

Pada Milestone 2, pipeline CI/CD digunakan untuk membantu proses build, testing, dan deployment aplikasi secara otomatis.

Pipeline mencakup:

1. Menjalankan pengujian backend menggunakan pytest.
2. Menjalankan pengujian frontend menggunakan Vitest.
3. Build aplikasi dan Docker image.
4. Deploy aplikasi ke Railway.
5. Melakukan validasi deployment melalui smoke test dan production testing.

---

## 5. Known Issues

Saat release Milestone 2 dibuat, tidak ditemukan kendala kritis yang memengaruhi penggunaan aplikasi.

| No | Issue                         | Dampak                              |
| -- | ----------------------------- | ----------------------------------- |
| 1  | Tidak ada known issues kritis | Seluruh fitur utama berjalan normal |

---

## 6. Production Testing Summary

Hasil production testing menunjukkan bahwa seluruh fitur utama berhasil berjalan pada environment production.

Fitur yang berhasil diuji:

* Backend Health Check
* Register User
* Login User
* Create Item
* Read Items
* Update Item
* Delete Item
* Search Item

Seluruh pengujian memperoleh status **Pass (100%)** baik pada environment development maupun production sehingga deployment Milestone 2 dinyatakan berhasil.
