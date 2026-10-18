from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.telemetry import router as telemetry_router

app = FastAPI(
    title="Satellite Telemetry",
    description="REST API for managing satellite telemetry data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific URLs in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetry_router, tags=["Telemetry"])

@app.get("/", tags=["Health"])
def check_health():
    return {"status": "ok"}