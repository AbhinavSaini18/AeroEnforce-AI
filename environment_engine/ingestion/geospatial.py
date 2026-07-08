import os
from pathlib import Path
from typing import Any, Dict


class GeospatialIngestion:
    """Geospatial ingestion interface for CSV, GeoJSON, and Shapefile layers."""

    def __init__(self) -> None:
        self._base_dir = Path(os.getenv("GEOSPATIAL_DATA_DIR", "data/raw/geospatial"))
        self._base_dir.mkdir(parents=True, exist_ok=True)

    def download(self) -> Dict[str, Any]:
        return {"source": "geospatial", "status": "not_implemented", "base_dir": str(self._base_dir)}

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download()
        normalized = self.normalize(payload)
        return self.cache(normalized)
