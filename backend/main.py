from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Cloud App API",
    description="API untuk mata kuliah Komputasi Awan",
    version="0.1.0"
)

# CORS - agar frontend bisa akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development saja
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Cloud App API!",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/teams")
def team_info():
    return {
        "team": "cloud-team-XX",
        "members": [
            # TODO: Isi dengan data tim Anda
            {"name": "Anjas Geofany Diamare", "nim": "10231016", "role": "Lead Backend"},
            {"name": "Cantika Ade Qutnindra Maharani", "nim": "10231024", "role": "Lead Frontend"},
            {"name": "Arya Wijaya Saroyo", "nim": "10231020", "role": "Lead DevOps"},
            {"name": "Meiske Handayani", "nim": "10231052", "role": "Lead QA & Docs"},
        ]
    }