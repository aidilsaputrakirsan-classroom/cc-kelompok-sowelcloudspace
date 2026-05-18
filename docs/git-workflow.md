# 📌 Git Workflow Guide

Dokumen ini menjelaskan standar workflow Git yang digunakan oleh tim untuk menjaga konsistensi, kolaborasi yang efektif, dan kualitas kode.

---

## 🌿 Branch Naming Convention

Gunakan format penamaan branch berikut:

* `feature/<nama-fitur>` → untuk pengembangan fitur baru
  Contoh: `feature/login-endpoint`

* `fix/<nama-perbaikan>` → untuk perbaikan bug
  Contoh: `fix/api-error`

* `docs/<nama-dokumen>` → untuk dokumentasi
  Contoh: `docs/git-workflow-guide`

* `chore/<kebutuhan-lain>` → untuk konfigurasi atau tugas kecil
  Contoh: `chore/update-dependencies`

**Ketentuan:**

* Gunakan huruf kecil
* Gunakan tanda `-` sebagai pemisah kata
* Nama harus jelas dan deskriptif

---

## 📝 Commit Convention

Gunakan format commit message berikut:

```
<type>: <deskripsi singkat>
```

### Jenis commit:

* `feat:` → fitur baru
* `fix:` → perbaikan bug
* `docs:` → perubahan dokumentasi
* `chore:` → perubahan kecil/config
* `refactor:` → perubahan kode tanpa mengubah fungsi
* `test:` → penambahan atau perubahan testing

### Contoh:

* `feat: add login endpoint`
* `fix: resolve database connection error`
* `docs: add git workflow guide`

**Ketentuan:**

* Gunakan bahasa Inggris
* Deskripsi singkat, jelas, dan spesifik
* Tidak menggunakan huruf kapital di awal deskripsi

---

## 🔄 Pull Request (PR) Process

Ikuti langkah berikut saat membuat Pull Request:

1. Buat branch baru dari `main`
2. Lakukan perubahan sesuai tugas
3. Commit perubahan dengan format yang sesuai
4. Push branch ke repository
5. Buat Pull Request di GitHub
6. Isi:

   * **Title**: sesuai commit message
   * **Description**: jelaskan perubahan yang dilakukan
7. Assign:

   * **Assignees**: diri sendiri
   * **Reviewers**: minimal 1 anggota tim
8. Tunggu proses review
9. Lakukan perbaikan jika ada feedback
10. Merge PR setelah disetujui

---

## 👀 Code Review Guidelines

Reviewer bertanggung jawab memastikan kualitas kode sebelum di-merge.

Hal yang perlu diperiksa:

* Kode berjalan tanpa error
* Logika program sudah benar
* Tidak ada duplikasi kode yang tidak perlu
* Struktur kode rapi dan mudah dibaca
* Sesuai dengan standar yang telah ditentukan

**Ketentuan:**

* Wajib minimal 1 approval sebelum merge
* Berikan feedback yang jelas dan konstruktif
* Gunakan komentar yang spesifik pada bagian kode

---

## 👥 CODEOWNERS

Repository menggunakan file `CODEOWNERS` untuk menentukan reviewer otomatis.

Contoh pembagian:

* Backend → Lead Backend
* Frontend → Lead Frontend
* DevOps → Lead DevOps
* Dokumentasi & QA → Lead QA & Docs

**Manfaat:**

* Memastikan setiap perubahan direview oleh orang yang tepat
* Mempercepat proses review
* Menjaga kualitas sesuai tanggung jawab masing-masing

---

## ✅ Penutup

Dengan mengikuti workflow ini, diharapkan:

* Kolaborasi tim menjadi lebih terstruktur
* Risiko konflik dan kesalahan dapat diminimalisir
* Kualitas kode dan dokumentasi tetap terjaga
