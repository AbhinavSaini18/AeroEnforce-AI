import os
from pathlib import Path
from typing import Any, Dict

import pandas as pd


class HistoricalAQIIngestion:
    """Historical AQI ingestion interface for CSV -> Parquet -> DuckDB pipeline."""

    def __init__(self) -> None:
        self._raw_dir = Path(os.getenv("HISTORICAL_AQI_RAW_DIR", "data/raw/historical_aqi"))
        self._processed_dir = Path(os.getenv("HISTORICAL_AQI_PROCESSED_DIR", "data/processed/historical_aqi"))
        self._processed_dir.mkdir(parents=True, exist_ok=True)

    def download(self, source: str = "csv") -> Dict[str, Any]:
        return {"source": source, "status": "not_implemented", "raw_dir": str(self._raw_dir)}

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if payload.get("source") == "csv":
            try:
                csv_files = sorted(self._raw_dir.glob("*.csv"))
                if csv_files:
                    frame = pd.read_csv(csv_files[0], low_memory=False)
                    parquet_path = self._processed_dir / f"{csv_files[0].stem}.parquet"
                    frame.to_parquet(parquet_path, index=False)
            except Exception:
                return payload
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download("csv")
        normalized = self.normalize(payload)
        return self.cache(normalized)
