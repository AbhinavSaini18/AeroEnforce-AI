import os
from typing import Any, Dict


class CAAQMSIngestion:
    """CAAQMS ingestion interface for live AQI data."""

    def __init__(self) -> None:
        self._api_key = os.getenv("CPCB_API_KEY", "")

    def download(self, latitude: float, longitude: float) -> Dict[str, Any]:
        return {
            "source": "caaqms",
            "latitude": latitude,
            "longitude": longitude,
            "status": "not_implemented",
            "api_key_configured": bool(self._api_key),
        }

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download(latitude, longitude)
        normalized = self.normalize(payload)
        return self.cache(normalized)
