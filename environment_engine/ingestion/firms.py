import os
from typing import Any, Dict


class FIRMSIngestion:
    """NASA FIRMS ingestion interface for MODIS and VIIRS fire data."""

    def __init__(self) -> None:
        self._api_key = os.getenv("NASA_FIRMS_API_KEY", "demo-key")

    def download(self, latitude: float, longitude: float, days: int = 1) -> Dict[str, Any]:
        return {
            "source": "nasa-firms",
            "latitude": latitude,
            "longitude": longitude,
            "days": days,
            "status": "not_implemented",
            "api_key_configured": bool(self._api_key and self._api_key != "demo-key"),
        }

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download(latitude, longitude, days=1)
        normalized = self.normalize(payload)
        return self.cache(normalized)
