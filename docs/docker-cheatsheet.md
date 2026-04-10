# Docker Cheatsheet

| Command | Description | Example (Proyek Ini) |
|---------|-------------|-----------------------|
| `docker build` | Membuat image dari Dockerfile | `docker build -t myapp:latest .` |
| `docker run` | Menjalankan container dari image | `docker run -d -p 3000:3000 myapp:latest` |
| `docker ps` | Melihat daftar container yang sedang berjalan | `docker ps` |
| `docker logs` | Melihat log dari container | `docker logs <backend>` |
| `docker exec` | Menjalankan perintah di dalam container yang aktif | `docker exec -it <backend> /bin/bash` |
| `docker stop` | Menghentikan container yang sedang berjalan | `docker stop <backend>` |
| `docker rm` | Menghapus container yang sudah dihentikan | `docker rm <backend>` |
| `docker push` | Mengunggah image ke registry | `docker push myregistry/myapp:latest` |
| `docker pull` | Mengunduh image dari registry | `docker pull myregistry/myapp:latest` |

---
