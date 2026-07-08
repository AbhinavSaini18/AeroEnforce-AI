#!/usr/bin/env python3
import os
import sys
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
CACHE_DIR = DATA_DIR / "cache"
PROCESSED_DIR = DATA_DIR / "processed"

for directory in [RAW_DIR, CACHE_DIR, PROCESSED_DIR, RAW_DIR / "historical_aqi", RAW_DIR / "geospatial"]:
    directory.mkdir(parents=True, exist_ok=True)


def print_result(step: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}: {step}")


def verify_earth_engine() -> bool:
    try:
        import ee  # noqa: F401
    except Exception as exc:
        print_result("Google Earth Engine import", False)
        print(f"  details: {exc}")
        return False

    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("EARTHENGINE_CREDENTIALS")
    credential_file = Path.home() / ".config" / "earthengine" / "credentials"
    ok = bool(credentials_path) or credential_file.exists()
    print_result("Google Earth Engine authentication", ok)
    if not ok:
        print("  hint: run 'earthengine authenticate' or set GOOGLE_APPLICATION_CREDENTIALS")
    return ok


def verify_firms_api_key() -> bool:
    api_key = os.getenv("NASA_FIRMS_API_KEY", "").strip()
    ok = bool(api_key) and api_key != "demo-key"
    print_result("NASA FIRMS API key", ok)
    if not ok:
        print("  hint: export NASA_FIRMS_API_KEY=<your-key>")
    return ok


def verify_cds_api() -> bool:
    try:
        import cdsapi  # noqa: F401
    except Exception as exc:
        print_result("CDS API client", False)
        print(f"  details: {exc}")
        return False

    api_key = os.getenv("CDS_API_KEY", "").strip() or os.getenv("CDSAPI_KEY", "").strip()
    cred_file = Path.home() / ".cdsapirc"
    ok = bool(api_key) or cred_file.exists()
    print_result("CDS API configuration", ok)
    if not ok:
        print("  hint: create ~/.cdsapirc or export CDS_API_KEY")
    return ok


def download_sample_sentinel() -> bool:
    sample_path = RAW_DIR / "sentinel_sample.csv"
    frame = pd.DataFrame(
        [
            {"date": "2024-01-01", "latitude": 12.5, "longitude": 77.5, "no2": 22.1, "co": 0.15},
            {"date": "2024-01-02", "latitude": 12.5, "longitude": 77.5, "no2": 21.8, "co": 0.14},
        ]
    )
    frame.to_csv(sample_path, index=False)
    ok = sample_path.exists() and sample_path.stat().st_size > 0
    print_result("Sample Sentinel-5P dataset", ok)
    return ok


def download_sample_era5() -> bool:
    sample_path = RAW_DIR / "era5_sample.csv"
    frame = pd.DataFrame(
        [
            {"date": "2024-01-01", "latitude": 12.5, "longitude": 77.5, "temperature_2m": 22.3, "precipitation": 0.0},
            {"date": "2024-01-02", "latitude": 12.5, "longitude": 77.5, "temperature_2m": 21.1, "precipitation": 1.5},
        ]
    )
    frame.to_csv(sample_path, index=False)
    ok = sample_path.exists() and sample_path.stat().st_size > 0
    print_result("Sample ERA5 dataset", ok)
    return ok


def download_sample_firms() -> bool:
    sample_path = RAW_DIR / "firms_sample.csv"
    frame = pd.DataFrame(
        [
            {"acq_date": "2024-01-01", "latitude": 12.5, "longitude": 77.5, "brightness": 330.2},
            {"acq_date": "2024-01-02", "latitude": 12.6, "longitude": 77.6, "brightness": 318.7},
        ]
    )
    frame.to_csv(sample_path, index=False)
    ok = sample_path.exists() and sample_path.stat().st_size > 0
    print_result("Sample FIRMS dataset", ok)
    return ok


def verify_open_meteo() -> bool:
    try:
        response = requests.get(
            "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current_weather=true",
            timeout=10,
        )
        ok = response.ok
    except Exception as exc:
        print_result("Open-Meteo connectivity", False)
        print(f"  details: {exc}")
        return False

    print_result("Open-Meteo connectivity", ok)
    return ok


def verify_historical_aqi_folder() -> bool:
    ok = (RAW_DIR / "historical_aqi").is_dir()
    print_result("Historical AQI folder exists", ok)
    return ok


def main() -> int:
    steps = [
        verify_earth_engine,
        verify_firms_api_key,
        verify_cds_api,
        download_sample_sentinel,
        download_sample_era5,
        download_sample_firms,
        verify_open_meteo,
        verify_historical_aqi_folder,
    ]

    results = [step() for step in steps]
    all_ok = all(results)
    if all_ok:
        print("All download initialization checks completed successfully.")
    else:
        print("One or more download initialization checks failed.")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
