import os
from typing import Any, Dict


class SentinelIngestion:
    """Sentinel-5P ingestion interface for NO2, CO, SO2, and HCHO."""

    def __init__(self) -> None:
        self._project = os.getenv("GOOGLE_CLOUD_PROJECT", "demo-project")

    def download(self, latitude: float, longitude: float, start_date: str, end_date: str) -> Dict[str, Any]:
        return {
            "source": "sentinel-5p",
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "status": "not_implemented",
        }

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download(latitude, longitude, "2024-01-01", "2024-01-02")
        normalized = self.normalize(payload)
        return self.cache(normalized)
