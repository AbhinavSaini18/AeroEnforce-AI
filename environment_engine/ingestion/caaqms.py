import os
import re
from typing import Any, Dict
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json


class CAAQMSIngestion:
    """CAAQMS ingestion interface for live AQI data."""

    def __init__(self) -> None:
        self._api_key = os.getenv("CPCB_API_KEY", "")
        self._aqicn_token = os.getenv("AQICN_TOKEN", "f43e2e9a795497265d2b2d9a4662309245c4ba5e")
        self._base_url = os.getenv("CPCB_AQI_URL", "https://app.cpcbccr.com/AQI_India/")
        self._aqicn_base_url = os.getenv("AQICN_BASE_URL", "https://api.waqi.info/feed/here/")

    def download(self, latitude: float, longitude: float) -> Dict[str, Any]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        if self._aqicn_token:
            aqicn_url = f"{self._aqicn_base_url}?token={self._aqicn_token}"
            try:
                request = Request(aqicn_url, headers=headers)
                with urlopen(request, timeout=20) as response:
                    body = response.read().decode("utf-8", errors="ignore")
                payload = json.loads(body)
                if payload.get("status") == "ok":
                    return {
                        "source": "caaqms",
                        "latitude": latitude,
                        "longitude": longitude,
                        "status": "ok",
                        "endpoint": aqicn_url,
                        "api_key_configured": bool(self._aqicn_token),
                        "aqicn_payload": payload,
                    }
            except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError):
                pass

        try:
            request = Request(self._base_url, headers=headers)
            with urlopen(request, timeout=20) as response:
                html = response.read().decode("utf-8", errors="ignore")
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            return {
                "source": "caaqms",
                "latitude": latitude,
                "longitude": longitude,
                "status": "error",
                "error": str(exc),
                "endpoint": self._base_url,
                "api_key_configured": bool(self._api_key or self._aqicn_token),
            }

        return {
            "source": "caaqms",
            "latitude": latitude,
            "longitude": longitude,
            "status": "ok",
            "endpoint": self._base_url,
            "api_key_configured": bool(self._api_key or self._aqicn_token),
            "raw_html": html,
        }

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if payload.get("status") != "ok":
            return payload

        normalized = dict(payload)
        if "raw_html" in normalized:
            html = normalized.pop("raw_html")
        else:
            html = ""

        aqicn_payload = payload.get("aqicn_payload") or {}
        if aqicn_payload:
            data = aqicn_payload.get("data", {})
            iaqi = data.get("iaqi", {}) or {}
            aqi_value = data.get("aqi")
            if aqi_value is None:
                aqi_value = iaqi.get("pm25", {}).get("v") if isinstance(iaqi.get("pm25"), dict) else None
            if aqi_value is None:
                aqi_value = data.get("aqi")
            normalized["aqi"] = int(aqi_value) if aqi_value is not None else None
            normalized["aqi_category"] = None
            normalized["pollutants"] = {}
            for pollutant_name in ["pm25", "pm10", "so2", "co", "no2", "o3"]:
                pollutant = iaqi.get(pollutant_name)
                if isinstance(pollutant, dict):
                    value = pollutant.get("v")
                    if value is not None:
                        normalized["pollutants"][pollutant_name] = float(value)
            normalized["source"] = "aqicn"
            return normalized

        aqi_match = re.search(r"(?i)AQI\s+SCORE\s*&\s*CORE\s*METRICS\s*(\d{1,3})", html)
        if not aqi_match:
            aqi_match = re.search(r"(?i)current\s+real-time\s+AQI\s*\(US\)\s+level[^\d]*(\d{1,3})", html)

        category_match = re.search(r"(?i)AQI\s+SCORE\s*&\s*CORE\s*METRICS\s*\d{1,3}\s*([A-Za-z ]+?)\s*\(", html)
        if aqi_match:
            normalized["aqi"] = int(aqi_match.group(1))
            normalized["aqi_category"] = None
            if category_match:
                category_value = category_match.group(1).strip()
                normalized["aqi_category"] = category_value.title() if category_value else None
            elif re.search(r"(?i)\b(good|moderate|poor|unhealthy|severe|hazardous)\b", html):
                fallback = re.search(r"(?i)\b(good|moderate|poor|unhealthy|severe|hazardous)\b", html)
                normalized["aqi_category"] = fallback.group(1).title() if fallback else None
        else:
            normalized["aqi"] = None
            normalized["aqi_category"] = None

        pollutants = {}
        pollutant_patterns = {
            "pm2_5": r"(?i)PM2\.5\s*([0-9.]+)",
            "pm10": r"(?i)PM10\s*([0-9.]+)",
            "so2": r"(?i)SO2\s*([0-9.]+)",
            "co": r"(?i)CO\s*([0-9.]+)",
            "no2": r"(?i)NO2\s*([0-9.]+)",
            "o3": r"(?i)O3\s*([0-9.]+)",
        }
        for name, pattern in pollutant_patterns.items():
            match = re.search(pattern, html)
            if match:
                pollutants[name] = float(match.group(1))

        normalized["pollutants"] = pollutants
        return normalized

    def cache(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload

    def query(self, latitude: float, longitude: float) -> Dict[str, Any]:
        payload = self.download(latitude, longitude)
        normalized = self.normalize(payload)
        return self.cache(normalized)
