import unittest
from unittest.mock import patch

from environment_engine.ingestion.caaqms import CAAQMSIngestion


class DummyResponse:
    def __init__(self, body: str) -> None:
        self._body = body.encode("utf-8")

    def __enter__(self) -> "DummyResponse":
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        return False

    def read(self) -> bytes:
        return self._body


class CAAQMSIngestionTests(unittest.TestCase):
    @patch("environment_engine.ingestion.caaqms.urlopen")
    def test_download_parses_aqi_page(self, mock_urlopen) -> None:
        html = """
        <html>
          <body>
            AQI SCORE & CORE METRICS47GOOD(US-AQI standard)
            PM2.55.0µg/m³
            PM106.0µg/m³
          </body>
        </html>
        """
        mock_urlopen.return_value = DummyResponse(html)

        ingestion = CAAQMSIngestion()
        payload = ingestion.download(22.0, 79.0)
        normalized = ingestion.normalize(payload)

        self.assertEqual(normalized["source"], "caaqms")
        self.assertEqual(normalized["status"], "ok")
        self.assertEqual(normalized["aqi"], 47)
        self.assertEqual(normalized["aqi_category"], "Good")
        self.assertEqual(normalized["pollutants"]["pm2_5"], 5.0)
        self.assertEqual(normalized["pollutants"]["pm10"], 6.0)


if __name__ == "__main__":
    unittest.main()
