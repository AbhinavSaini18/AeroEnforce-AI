import json
from pathlib import Path
from typing import Any, Dict

from environment_engine.config import CACHE_DIR


class CacheManager:
    """Simple on-disk cache for normalized payloads."""

    def __init__(self, cache_dir: Path | None = None) -> None:
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def get(self, key: str) -> Dict[str, Any] | None:
        path = self.cache_dir / f"{key}.json"
        if not path.exists():
            return None
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def set(self, key: str, value: Dict[str, Any]) -> None:
        path = self.cache_dir / f"{key}.json"
        with path.open("w", encoding="utf-8") as handle:
            json.dump(value, handle, indent=2, sort_keys=True)

    def delete(self, key: str) -> None:
        path = self.cache_dir / f"{key}.json"
        if path.exists():
            path.unlink()
