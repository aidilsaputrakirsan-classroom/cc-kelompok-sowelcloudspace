# Testing Guide

Dokumentasi ini berisi panduan untuk menjalankan testing pada project, membaca CI log, melakukan debugging ketika test gagal, serta cara menambahkan test baru pada backend maupun frontend.

---

# Prerequisites

Sebelum menjalankan test, pastikan beberapa kebutuhan berikut sudah tersedia:

- Node.js sudah terinstall
- Package manager (`npm` atau `yarn`)
- Dependencies project sudah di-install
- File `.env` sudah dikonfigurasi dengan benar
- Database/service pendukung sudah berjalan (jika diperlukan)

Install dependencies:

```bash
npm install
```

---

# Run Test Secara Lokal

## Backend Testing

Masuk ke folder backend:

```bash
cd backend
```

Jalankan seluruh test backend:

```bash
npm test
```


Jika ingin menjalankan satu file test tertentu:

```bash
npm test auth.test.js
```

### Hasil Test Berhasil

Contoh hasil test yang berhasil:

```bash
PASS  tests/auth.test.js
PASS  tests/user.test.js

Test Suites: 2 passed
Tests:       10 passed
```

### Hasil Test Gagal

Jika terdapat error:

```bash
FAIL tests/auth.test.js
```

Periksa detail error pada terminal untuk mengetahui penyebab kegagalan.

---

## Frontend Testing

Masuk ke folder frontend:

```bash
cd frontend
```

Jalankan test frontend:

```bash
npm test
```

Menjalankan test dalam mode coverage:

```bash
npm run test -- --coverage
```

Menjalankan satu file test tertentu:

```bash
npm test Login.test.js
```

---

# Membaca CI Log

CI (Continuous Integration) digunakan untuk menjalankan testing otomatis setiap terdapat perubahan kode.

## Cara Membuka CI Log

1. Buka repository project di GitHub
2. Pilih tab **Actions**
3. Pilih workflow terbaru
4. Klik job yang gagal atau berhasil
5. Buka detail log untuk melihat proses testing

---

## Status CI

| Status | Arti |
|---|---|
| ✅ Success | Semua test berhasil |
| ❌ Failed | Ada test yang gagal |
| 🟡 Running | Test sedang berjalan |
| ⚪ Cancelled | Workflow dibatalkan |

---

## Cara Membaca Error pada CI

Perhatikan bagian log yang berwarna merah atau bertanda:

```bash
ERROR
FAIL
Unhandled Exception
```

Biasanya error menunjukkan:

- file yang bermasalah
- nomor baris error
- penyebab test gagal

Contoh:

```bash
Expected status code 200
Received 500
```

Artinya API mengalami error internal saat test dijalankan.

---

# Debugging Test Failure

Jika test gagal, lakukan beberapa langkah berikut:

---

## 1. Pastikan Dependency Sudah Terinstall

```bash
npm install
```

---

## 2. Pastikan Environment Sudah Benar

Periksa file:

```bash
.env
```

Pastikan:

- database URL benar
- API key tersedia
- port tidak bentrok

---

## 3. Jalankan Test Secara Spesifik

Untuk mempermudah debugging, jalankan hanya test yang gagal:

```bash
npm test auth.test.js
```

---

## 4. Periksa Stack Trace Error

Baca detail error pada terminal:

```bash
TypeError: Cannot read properties of undefined
```

Biasanya error ini menunjukkan data yang dipanggil belum tersedia.

---

## 5. Gunakan Console Log Sementara

Tambahkan debugging sederhana:

```javascript
console.log(response);
```

Gunakan hanya saat debugging dan hapus kembali setelah selesai.

---

## 6. Periksa Koneksi Database atau API

Pastikan:

- database aktif
- backend berjalan
- endpoint API dapat diakses

---

# Menambahkan Test Baru

## Backend Test

Simpan file test pada folder:

```bash
backend/tests/
```

Contoh penamaan file:

```bash
auth.test.js
user.test.js
```

Contoh test backend:

```javascript
describe("Login API", () => {
  test("should login successfully", async () => {
    // testing logic
  });
});
```

---

## Frontend Test

Simpan file test pada folder:

```bash
frontend/src/tests/
```

Contoh test frontend:

```javascript
test("renders login button", () => {
  // testing logic
});
```

Contoh menggunakan React Testing Library:

```javascript
import { render, screen } from "@testing-library/react";
import Login from "./Login";

test("renders login form", () => {
  render(<Login />);
  
  const button = screen.getByText("Login");
  
  expect(button).toBeInTheDocument();
});
```

---

# Best Practices

- Gunakan nama test yang jelas dan deskriptif
- Pastikan setiap fitur memiliki minimal satu test
- Pisahkan unit test dan integration test
- Hindari hardcoded data sensitif
- Jalankan seluruh test sebelum melakukan push
- Jangan commit code dengan test yang gagal
- Gunakan coverage untuk memastikan kualitas testing

---

# Testing Checklist

Sebelum melakukan merge pull request, pastikan:

- [ ] Semua test backend berhasil
- [ ] Semua test frontend berhasil
- [ ] Tidak ada error pada CI/CD
- [ ] Edge cases sudah diuji
- [ ] Coverage testing sudah diperiksa
- [ ] Tidak ada console error atau warning
- [ ] Dokumentasi testing sudah diperbarui

---

# Notes

Jika menemukan bug atau test failure yang belum diketahui penyebabnya, segera dokumentasikan issue tersebut dan laporkan kepada tim developer terkait untuk dilakukan perbaikan.