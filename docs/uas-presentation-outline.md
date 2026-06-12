# UAS Presentation Outline

## Slide 1: Title

* Nama proyek: Sowel Task
* Nama tim: Kelompok Sowel Cloud Space
* Anggota:

  * Anjas Geofany Diamare
  * Cantika Ade Qutnindra Maharani
  * Arya Wijaya Saroyo
  * Meiske Handayani

## Slide 2: Problem & Solution

* Masalah yang diselesaikan: Manajemen tugas dan kolaborasi tim yang belum terintegrasi serta sulit dipantau secara real-time.
* Target pengguna: Mahasiswa, tim proyek, organisasi kecil, dan pengguna individu.
* Solusi: Aplikasi Collaborative To-Do List berbasis cloud yang memungkinkan pengguna mengelola tugas, memantau progres, dan mengakses data dari berbagai perangkat.

## Slide 3: Architecture Journey

* Week 1-4: Monolith (React + FastAPI + PostgreSQL)
* Week 5-7: Containerized (Docker & Docker Compose)
* Week 9-11: CI/CD (GitHub Actions)
* Week 12-14: Cloud Deployment (Railway)
* Week 15-16: Security Hardening & Final Documentation

## Slide 4: Tech Stack & Infrastructure

* Frontend: React + Vite
* Backend: FastAPI + SQLAlchemy
* Database: PostgreSQL
* Containerization: Docker & Docker Compose
* Cloud Platform: Railway
* CI/CD: GitHub Actions
* Diagram arsitektur final
* Jumlah services, endpoints, dan container
* CI/CD pipeline flow
* Monitoring dan health check endpoint

## Slide 5: Live Demo

* Flow:
  Open App → Register → Login → Create Task → View Tasks → Update Task → Complete Task → Delete Task → View Statistics → Open Swagger Docs → Show CI/CD Badge
* Backup: Video demo jika terjadi kendala internet

## Slide 6: Challenges & Lessons Learned

* Challenge 1: Integrasi Frontend dan Backend → Solution: REST API menggunakan FastAPI
* Challenge 2: Deployment ke Cloud → Solution: Railway Deployment dan Environment Variables Management
* Challenge 3: Keamanan API → Solution: JWT Authentication, Password Hashing, dan Pydantic Validation
* Challenge 4: Kolaborasi Tim → Solution: Git Flow, Branching Strategy, dan Pull Request Review
* Biggest Learning: Docker, CI/CD, Cloud Deployment, serta pentingnya Testing dan Dokumentasi

## Slide 7: Team Contributions

* Anjas Geofany Diamare — Lead Backend — FastAPI, Database Integration, JWT Authentication, CRUD API
* Cantika Ade Qutnindra Maharani — Lead Frontend — React UI, API Integration, User Interface
* Arya Wijaya Saroyo — Lead DevOps — Docker, Docker Compose, Railway Deployment, GitHub Actions
* Meiske Handayani — Lead QA & Docs — Testing, Reliability Testing, README, Deployment Guide, Documentation

## Demo Script (Urutan Langkah)

1. Buka aplikasi Sowel Task (Production URL)
2. Register user baru
3. Login menggunakan akun yang dibuat
4. Membuat task baru
5. Menampilkan daftar task
6. Mengubah task
7. Menandai task sebagai selesai
8. Menampilkan statistik task
9. Menghapus task
10. Membuka Swagger API Documentation (/docs)
11. Menampilkan GitHub Actions dengan status pipeline berhasil
12. Menampilkan README dan dokumentasi proyek
