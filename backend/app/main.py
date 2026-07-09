from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pandas as pd

app = FastAPI(title="AeroEnforce AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "aeroenforce-api"}


@app.get("/api/geospatial")
def geospatial() -> list[dict]:
    csv_path = Path(__file__).resolve().parents[2] / "data" / "raw" / "geospatial" / "geospatial_sample.csv"
    if not csv_path.exists():
        return []

    frame = pd.read_csv(csv_path)
    return frame.to_dict(orient="records")
