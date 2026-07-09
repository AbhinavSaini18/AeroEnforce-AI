#!/usr/bin/env python3
import sys
from pathlib import Path
from typing import Any, Dict

import pandas as pd

from environment_engine.ingestion.caaqms import CAAQMSIngestion

ROOT = Path(__file__).resolve().parent
RAW_DIR = ROOT / "data" / "raw"
ERA5_DIR = RAW_DIR / "era5"
FIRMS_DIR = RAW_DIR / "firms"
AQI_DIR = RAW_DIR / "historical_aqi"
GEO_DIR = RAW_DIR / "geospatial"

for directory in [ERA5_DIR, FIRMS_DIR, AQI_DIR, GEO_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


def write_csv_and_parquet(csv_path: Path, frame: pd.DataFrame) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(csv_path, index=False)
    parquet_path = csv_path.with_suffix(".parquet")
    try:
        frame.to_parquet(parquet_path, index=False)
    except ImportError:
        print(f"Parquet support unavailable; wrote CSV only to {csv_path}")


def download_era5() -> Path:
    frame = pd.DataFrame(
        [
            {"date": "2024-01-01", "latitude": 12.5, "longitude": 77.5, "temperature_2m": 22.0, "precipitation": 0.0},
            {"date": "2024-01-02", "latitude": 12.5, "longitude": 77.5, "temperature_2m": 21.3, "precipitation": 0.4},
        ]
    )
    output_path = ERA5_DIR / "era5_sample.csv"
    write_csv_and_parquet(output_path, frame)
    print(f"Prepared ERA5 sample data at {output_path}")
    return output_path


def download_firms() -> Path:
    frame = pd.DataFrame(
        [
            {"acq_date": "2024-01-01", "latitude": 12.5, "longitude": 77.5, "brightness": 321.4},
            {"acq_date": "2024-01-02", "latitude": 12.6, "longitude": 77.6, "brightness": 329.1},
        ]
    )
    output_path = FIRMS_DIR / "firms_sample.csv"
    write_csv_and_parquet(output_path, frame)
    print(f"Prepared FIRMS sample data at {output_path}")
    return output_path


def prepare_historical_aqi() -> Path:
    frame = pd.DataFrame(
        [
            {"date": "2024-01-01", "station_id": "A1", "aqi": 95},
            {"date": "2024-01-02", "station_id": "A1", "aqi": 103},
        ]
    )
    output_path = AQI_DIR / "historical_aqi_sample.csv"
    write_csv_and_parquet(output_path, frame)
    print(f"Prepared historical AQI data at {output_path}")
    return output_path


def fetch_caaqms_metrics() -> Dict[str, Any]:
    ingestion = CAAQMSIngestion()
    payload = ingestion.download(0.0, 0.0)
    normalized = ingestion.normalize(payload)

    if normalized.get("status") != "ok":
        return {
            "caaqms_source": "CPCB AQI India",
            "caaqms_aqi": None,
            "caaqms_aqi_category": None,
            "caaqms_pm2_5": None,
            "caaqms_pm10": None,
            "caaqms_so2": None,
            "caaqms_co": None,
            "caaqms_no2": None,
            "caaqms_o3": None,
        }

    pollutants = normalized.get("pollutants", {})
    return {
        "caaqms_source": "CPCB AQI India",
        "caaqms_aqi": normalized.get("aqi"),
        "caaqms_aqi_category": normalized.get("aqi_category"),
        "caaqms_pm2_5": pollutants.get("pm25") if "pm25" in pollutants else pollutants.get("pm2_5"),
        "caaqms_pm10": pollutants.get("pm10"),
        "caaqms_so2": pollutants.get("so2"),
        "caaqms_co": pollutants.get("co"),
        "caaqms_no2": pollutants.get("no2"),
        "caaqms_o3": pollutants.get("o3"),
    }


def prepare_geospatial() -> Path:
    caaqms_metrics = fetch_caaqms_metrics()
    frame = pd.DataFrame(
        [
            {"id": 1, "name": "region-a", "latitude": 12.5, "longitude": 77.5, "population": 120000, **caaqms_metrics},
            {"id": 2, "name": "region-b", "latitude": 13.0, "longitude": 78.0, "population": 95000, **caaqms_metrics},
        ]
    )
    output_path = GEO_DIR / "geospatial_sample.csv"
    write_csv_and_parquet(output_path, frame)
    print(f"Prepared geospatial data at {output_path}")
    return output_path


def main() -> int:
    download_era5()
    download_firms()
    prepare_historical_aqi()
    prepare_geospatial()
    print("Historical data preparation completed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
