import os
from typing import Any, Dict


class ERA5Ingestion:
    """ERA5 ingestion interface for historical weather data."""

    def __init__(self) -> None:
        self._api_url = os.getenv("ERA5_API_URL", "")

    def download(self, latitude: float, longitude: float, start_date: str, end_date: str) -> Dict[str, Any]:
        return {
            "source": "era5",
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "status": "not_implemented",
            "api_url_configured": bool(self._api_url),
        }

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download(latitude, longitude, "2024-01-01", "2024-01-02")
        normalized = self.normalize(payload)
        return self.cache(normalized)
