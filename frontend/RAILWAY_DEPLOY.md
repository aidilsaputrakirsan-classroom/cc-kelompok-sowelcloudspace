# Railway Frontend Deploy Notes

## VITE_API_URL

`VITE_API_URL` adalah build-time variable untuk frontend Vite. Nilainya harus berupa URL backend HTTPS lengkap, misalnya:

```env
VITE_API_URL=https://backend-production-b026.up.railway.app
```

Gunakan salah satu pendekatan berikut:

1. Definisikan `VITE_API_URL` sebagai variable pada service frontend di Railway.
2. Atau simpan nilai yang sama di `frontend/.env.production`.

Untuk production Railway, utamakan HTTPS penuh. URL `http://...` non-localhost akan memicu validasi frontend agar tidak terjadi Mixed Content saat frontend dibuka lewat domain Railway HTTPS.

## Kenapa harus build-time

Frontend Vite membaca `import.meta.env.VITE_API_URL` saat `npm run build`. Nilai ini di-embed ke file JavaScript statis hasil build, jadi perubahan variable butuh build/deploy baru agar bundle memakai nilai terbaru.

## Langkah set variable di Railway

1. Buka service frontend di Railway.
2. Masuk ke tab `Variables`.
3. Tambahkan atau ubah `VITE_API_URL` dengan URL backend HTTPS lengkap.
4. Simpan perubahan.

Jika backend punya public domain Railway sendiri, lebih aman gunakan URL HTTPS public backend yang aktif saat ini.

## Langkah redeploy agar variable ter-embed

1. Pastikan `VITE_API_URL` sudah benar di service frontend Railway.
2. Trigger deploy baru pada service frontend.
3. Tunggu sampai fase build selesai.
4. Buka frontend hasil deploy dan pastikan request browser mengarah ke URL backend HTTPS yang baru.

Cara trigger deploy:

1. Push commit baru ke branch yang terhubung dengan frontend service.
2. Atau gunakan aksi `Redeploy` pada deployment frontend terakhir di Railway.

Kalau value variable baru belum terlihat di browser, hard refresh atau buka tab incognito untuk menghindari bundle lama dari cache.
