import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
CACHE_DIR = DATA_DIR / "cache"

for directory in [RAW_DIR, PROCESSED_DIR, CACHE_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


class Settings:
    google_cloud_project: str = os.getenv("GOOGLE_CLOUD_PROJECT", "nth-highlander-456010-a5")
    nasa_firms_api_key: str = os.getenv("NASA_FIRMS_API_KEY", "985cd981cc7b20af78d93b79d49a1c74")
    open_meteo_base_url: str = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")
    cpcb_api_key: str = os.getenv("CPCB_API_KEY", "")
    era5_api_url: str = os.getenv("ERA5_API_URL", "")


settings = Settings()
