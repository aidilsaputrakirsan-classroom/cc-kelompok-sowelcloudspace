# ============================================================
# Stage: Production Image
# ============================================================

# 1. Base image — Python 3.12 slim (debian minimal, ~50MB)
FROM python:3.12-slim

# 2. Install curl (untuk HEALTHCHECK) dan postgresql-client (untuk pg_isready)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# 3. Set working directory di dalam container
WORKDIR /app

# 4. Copy HANYA requirements.txt dulu (cache optimization)
#    Layer ini hanya rebuild jika requirements.txt berubah
COPY requirements.txt .

# 5. Install Python dependencies
#    --no-cache-dir: jangan simpan pip cache (hemat space)
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy seluruh kode aplikasi
#    Layer ini rebuild setiap kali kode berubah
COPY . .

# 6.5. Copy dan set permission untuk startup script
#      Normalisasi line ending menghindari error shebang `/bin/sh^M`
COPY scripts/wait-for-db.sh /app/scripts/wait-for-db.sh
RUN sed -i 's/\r$//' /app/scripts/wait-for-db.sh && chmod +x /app/scripts/wait-for-db.sh

# 7. Buat non-root user untuk security best practice
RUN useradd -m appuser && \
    chown -R appuser:appuser /app

# 8. Dokumentasikan port yang digunakan
EXPOSE 8000

# 9. Switch ke non-root user
USER appuser

# 10. Healthcheck — cek endpoint /health setiap 30 detik
#     Docker akan menandai container sebagai healthy/unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 11. Entrypoint — jalankan wait-for-db.sh yang akan menunggu DB siap
#     sebelum meneruskan ke CMD (uvicorn)
ENTRYPOINT ["/app/scripts/wait-for-db.sh"]

# 12. Command untuk menjalankan aplikasi
#     --host 0.0.0.0: agar bisa diakses dari luar container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
