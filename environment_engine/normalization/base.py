from typing import Any, Dict


class BaseNormalizer:
    """Base class for data normalization hooks."""

    def normalize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return payload
