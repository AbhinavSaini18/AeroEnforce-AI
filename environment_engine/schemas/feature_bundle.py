from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass
class FeatureBundle:
    location: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = ""
    satellite: Dict[str, Any] = field(default_factory=dict)
    weather: Dict[str, Any] = field(default_factory=dict)
    fires: Dict[str, Any] = field(default_factory=dict)
    aqi: Dict[str, Any] = field(default_factory=dict)
    historical: Dict[str, Any] = field(default_factory=dict)
    geospatial: Dict[str, Any] = field(default_factory=dict)
    temporal: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "location": self.location,
            "timestamp": self.timestamp,
            "satellite": self.satellite,
            "weather": self.weather,
            "fires": self.fires,
            "aqi": self.aqi,
            "historical": self.historical,
            "geospatial": self.geospatial,
            "temporal": self.temporal,
        }
