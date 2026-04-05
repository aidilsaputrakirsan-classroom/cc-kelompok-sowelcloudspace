# Perbandingan Ukuran Docker Image Python 3.12

## Hasil Pengujian

Perintah yang digunakan:

```bash
docker images
```

Hasil yang diperoleh:

| Image               | Disk Usage | Content Size |
|---------------------|------------|--------------|
| python:3.12         | 1.62GB     | 428MB        |
| python:3.12-slim    | 179MB      | 45.4MB       |
| python:3.12-alpine  | 75MB       | 18.7MB       |

## Analisis

- `python:3.12` memiliki ukuran paling besar karena berbasis Debian full dan menyertakan banyak package bawaan.
- `python:3.12-slim` lebih ringan karena menggunakan versi minimal dari Debian.
- `python:3.12-alpine` adalah yang paling kecil karena berbasis Alpine Linux yang sangat minimalis.

## Kesimpulan

Jika mempertimbangkan ukuran image dan efisiensi resource, `python:3.12-alpine` adalah yang paling ringan.  
Namun pemilihan image tetap harus mempertimbangkan kebutuhan aplikasi dan kompatibilitas library yang digunakan.