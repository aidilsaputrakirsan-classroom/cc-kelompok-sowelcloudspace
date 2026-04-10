# Docker Architecture

## Overview

Aplikasi terdiri dari 3 container:

* Frontend (React)
* Backend (FastAPI)
* Database (PostgreSQL)

Ketiga container terhubung dalam satu Docker network untuk memungkinkan komunikasi antar layanan.

---

## Container Details

### Frontend (React)

* Menyediakan tampilan user interface
* Berkomunikasi dengan backend melalui HTTP API

### Backend (FastAPI)

* Menangani request API
* Mengelola logika bisnis
* Terhubung ke database

### Database (PostgreSQL)

* Menyimpan data aplikasi secara persisten

---

## Ports

* Frontend: `3000`
* Backend: `8000`
* Database: `5432`

---

## Network

* Menggunakan Docker network (contoh: `app-network`)
* Semua container terhubung dalam network yang sama:

  * frontend ↔ backend
  * backend ↔ database

---

## Volumes

* `postgres_data` → menyimpan data database agar tidak hilang

---

## Environment Variables

### Backend

* `DATABASE_URL=postgresql://user:password@db:5432/app_db`
* `SECRET_KEY=your_secret_key`

### Database

* `POSTGRES_USER=user`
* `POSTGRES_PASSWORD=password`
* `POSTGRES_DB=app_db`

---

## Architecture Diagram

```mermaid
graph TD
    User --> Frontend[Frontend React Container]
    Frontend --> Backend[Backend FastAPI Container]
    Backend --> Database[(PostgreSQL Container)]
    Backend --> Network[(Docker Network)]
    Frontend --> Network
    Database --> Network
```

# Docker Architecture

## Overview

Dokumentasi ini menjelaskan arsitektur aplikasi berbasis Docker yang terdiri dari kondisi saat ini (current state) dan rencana pengembangan (future state).

---

## Current Architecture (Single Container)

Saat ini aplikasi hanya menggunakan 1 container:

* Backend (FastAPI)

Container backend menjalankan API utama dan menangani seluruh logika aplikasi. Container ini sudah terhubung ke Docker network.

### Ports

* Backend: `8000`

### Network

* Menggunakan Docker network (contoh: `app-network`)
* Backend terhubung ke network tersebut

### Volumes

* Belum menggunakan volume

### Environment Variables

* `DATABASE_URL=postgresql://user:password@localhost:5432/dbname`
* `SECRET_KEY=your_secret_key`

### Diagram

```mermaid
graph TD
    User --> Backend[Backend FastAPI Container]
    Backend --> Network[(Docker Network)]
```

---

## Proposed Architecture (3-Container)

Untuk pengembangan ke depan, sistem dirancang menggunakan 3 container:

* Frontend (React)
* Backend (FastAPI)
* Database (PostgreSQL)

Ketiga container akan saling terhubung dalam satu Docker network.

---

### Container Details

#### Frontend (React)

* Menyediakan tampilan user (UI)
* Mengirim request ke backend melalui HTTP API

#### Backend (FastAPI)

* Menangani API dan logika bisnis
* Menghubungkan frontend dengan database

#### Database (PostgreSQL)

* Menyimpan data aplikasi secara persisten

---

### Ports

* Frontend: `3000`
* Backend: `8000`
* Database: `5432`

---

### Network

* Menggunakan Docker network (contoh: `app-network`)
* Semua container terhubung:

  * frontend ↔ backend
  * backend ↔ database

---

### Volumes

* `postgres_data` → menyimpan data database agar tidak hilang

---

### Environment Variables

#### Backend

* `DATABASE_URL=postgresql://user:password@db:5432/app_db`
* `SECRET_KEY=your_secret_key`

#### Database

* `POSTGRES_USER=user`
* `POSTGRES_PASSWORD=password`
* `POSTGRES_DB=app_db`

---

## Architecture Diagram (3-Container)

```mermaid
graph TD
    User((User))

    Frontend[Frontend React Container]
    Backend[Backend FastAPI Container]
    Database[(PostgreSQL Container)]
    Network[(Docker Network)]

    User --> Frontend
    Frontend --> Backend
    Backend --> Database

    Frontend --> Network
    Backend --> Network
    Database --> Network
```
