#!/bin/bash

echo "======================================="
echo " Cloud App Backend Setup Script"
echo "======================================="

# cek python
echo "Checking Python installation..."

if ! command -v python3 &> /dev/null
then
    echo "Python3 tidak ditemukan. Silakan install Python terlebih dahulu."
    exit
fi

echo "Python ditemukan"

# buat virtual environment
echo ""
echo "Membuat virtual environment..."

python3 -m venv venv

echo "Virtual environment berhasil dibuat"

# aktifkan virtual environment
echo ""
echo "Mengaktifkan virtual environment..."

source venv/bin/activate

echo "Virtual environment aktif"

# install dependency
echo ""
echo "Menginstall dependencies backend..."

pip install --upgrade pip
pip install -r backend/requirements.txt

echo ""
echo "Dependencies berhasil diinstall"

# cek file env
echo ""
echo "Memeriksa file environment..."

if [ ! -f backend/.env ]; then
    echo "File .env belum ada"
    echo "Silakan copy dari .env.example"
    echo ""
    echo "Contoh:"
    echo "cp backend/.env.example backend/.env"
fi

echo ""
echo "======================================="
echo "Setup selesai!"
echo "======================================="

echo ""
echo "Untuk menjalankan backend server:"
echo ""

echo "cd backend"
echo "uvicorn main:app --reload"

echo ""
echo "Swagger API dapat diakses di:"
echo "http://localhost:8000/docs"
echo ""