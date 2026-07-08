import os
from typing import Any, Dict


class OpenMeteoIngestion:
    """Open-Meteo ingestion interface for live weather data."""

    def __init__(self) -> None:
        self._base_url = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")

    def download(self, latitude: float, longitude: float) -> Dict[str, Any]:
        return {
            "source": "open-meteo",
            "latitude": latitude,
            "longitude": longitude,
            "status": "not_implemented",
            "base_url": self._base_url,
        }

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download(latitude, longitude)
        normalized = self.normalize(payload)
        return self.cache(normalized)
