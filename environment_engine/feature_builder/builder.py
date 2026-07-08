from datetime import datetime, timedelta
from typing import Any, Dict

from environment_engine.schemas import FeatureBundle
from environment_engine.ingestion.sentinel import SentinelIngestion
from environment_engine.ingestion.firms import FIRMSIngestion
from environment_engine.ingestion.era5 import ERA5Ingestion
from environment_engine.ingestion.open_meteo import OpenMeteoIngestion
from environment_engine.ingestion.caaqms import CAAQMSIngestion
from environment_engine.ingestion.historical_aqi import HistoricalAQIIngestion
from environment_engine.ingestion.geospatial import GeospatialIngestion


class FeatureBuilder:
    def __init__(self) -> None:
        self._sentinel = SentinelIngestion()
        self._firms = FIRMSIngestion()
        self._era5 = ERA5Ingestion()
        self._open_meteo = OpenMeteoIngestion()
        self._caaqms = CAAQMSIngestion()
        self._historical_aqi = HistoricalAQIIngestion()
        self._geospatial = GeospatialIngestion()

    def build(self, latitude: float, longitude: float) -> Dict[str, Any]:
        now = datetime.utcnow()
        bundle = FeatureBundle(
            location={"latitude": latitude, "longitude": longitude, "city": "Delhi"},
            timestamp=now.isoformat() + "Z",
        )

        try:
            bundle.satellite = self._sentinel.query(latitude, longitude)
        except Exception:
            bundle.satellite = {}

        try:
            bundle.weather = self._open_meteo.query(latitude, longitude)
        except Exception:
            bundle.weather = {}

        try:
            bundle.fires = self._firms.query(latitude, longitude)
        except Exception:
            bundle.fires = {}

        try:
            bundle.aqi = self._caaqms.query(latitude, longitude)
        except Exception:
            bundle.aqi = {}

        try:
            bundle.historical = self._historical_aqi.query(latitude, longitude)
        except Exception:
            bundle.historical = {}

        try:
            bundle.geospatial = self._geospatial.query(latitude, longitude)
        except Exception:
            bundle.geospatial = {}

        try:
            bundle.temporal = self._build_temporal_context(now)
        except Exception:
            bundle.temporal = {}

        return bundle.to_dict()

    def _build_temporal_context(self, now: datetime) -> Dict[str, Any]:
        return {
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "month": now.month,
            "season": "monsoon" if now.month in {6, 7, 8, 9} else "dry",
        }
