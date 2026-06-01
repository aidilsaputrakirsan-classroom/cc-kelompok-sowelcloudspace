#  🚀 Production Test
Dokumen ini berisi hasil dan panduan pengujian production setelah aplikasi berhasil dideploy ke Railway.

Production testing dilakukan untuk memastikan aplikasi yang sudah berjalan di cloud dapat digunakan dengan baik, baik dari sisi frontend, backend, maupun koneksi ke database.



## 1. Smoke Test Checklist

| No | Pengujian                | Langkah Pengujian                                | Hasil yang Diharapkan                        | Status |
| -- | ------------------------ | ------------------------------------------------ | -------------------------------------------- | ------ |
| 1  | Buka Frontend Production | Akses URL frontend production melalui browser    | Halaman frontend berhasil tampil tanpa error | ✅      |
| 2  | Register User Baru       | Buat akun baru melalui halaman register          | Akun berhasil dibuat                         | ✅      |
| 3  | Login User               | Login menggunakan akun yang sudah dibuat         | User berhasil masuk ke aplikasi              | ✅      |
| 4  | Create Item              | Tambahkan item/data baru                         | Item berhasil dibuat dan tersimpan           | ✅      |
| 5  | Read Item                | Lihat daftar item/data                           | Item yang dibuat muncul di daftar            | ✅      |
| 6  | Update Item              | Edit item/data yang sudah dibuat                 | Perubahan berhasil tersimpan                 | ✅      |
| 7  | Delete Item              | Hapus item/data yang sudah dibuat                | Item berhasil dihapus dari daftar            | ✅      |
| 8  | Search Item              | Cari item menggunakan kata kunci tertentu        | Item yang sesuai berhasil ditampilkan        | ✅      |
| 9  | Health Check Backend     | Akses endpoint `/health` pada backend production | Backend mengembalikan status healthy         | ✅      |

---

## 2. Perbandingan Development vs Production

| Test              | Development / Localhost | Production / Railway | Status    |
| ----------------- | ----------------------- | -------------------- | --------- |
| Backend `/health` | ✅                       | ✅                 | ✅ Pass |
| Register User     | ✅                       | ✅                 | ✅ Pass |
| Login             | ✅                       | ✅                 | ✅ Pass |
| Create Item       | ✅                       | ✅                 | ✅ Pass |
| Read Items        | ✅                       | ✅                 | ✅ Pass |
| Update Item       | ✅                       | ✅                 | ✅ Pass |
| Delete Item       | ✅                       | ✅                 | ✅ Pass |
| Search            | ✅                       | ✅                 | ✅ Pass |

---

## Catatan

* Berdasarkan hasil smoke test dan perbandingan antara environment development (localhost) dan production (Railway), seluruh fitur aplikasi berhasil berjalan sesuai dengan yang diharapkan. Pengujian mencakup akses frontend, registrasi pengguna, login, operasi CRUD (Create, Read, Update, Delete), pencarian data, serta pemeriksaan kesehatan backend melalui endpoint `/health`.
* Tidak ditemukan perbedaan perilaku antara environment development dan production. Seluruh endpoint backend dapat diakses dengan baik, integrasi frontend dan backend berjalan normal, serta data dapat diproses dan ditampilkan tanpa kendala. Dengan demikian, proses deployment ke Railway dapat dinyatakan berhasil dan aplikasi siap digunakan pada environment production.


