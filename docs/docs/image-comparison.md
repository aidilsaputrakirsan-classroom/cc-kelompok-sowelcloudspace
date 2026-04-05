# Perbandingan Ukuran Docker Image python:3.12 vs python:3.12-slim vs python:3.12-alpine

## Hasil Pengujian

Perintah yang digunakan:

```bash
docker images
```
Perintah tersebut digunakan untuk menampilkan daftar Docker image yang tersedia di komputer lokal beserta informasi detailnya. Informasi yang ditampilkan biasanya meliputi nama repository, tag (versi), image ID, waktu pembuatan, serta ukuran atau disk usage dari masing-masing image. Dalam konteks tugas ini, perintah docker images digunakan untuk melihat dan membandingkan ukuran image python:3.12, python:3.12-slim, dan python:3.12-alpine yang telah diunduh sebelumnya, sehingga hasilnya dapat dicatat dan dianalisis pada dokumentasi.


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