# Environmental Intelligence Engine

This repository now provides a modular, package-oriented environmental intelligence engine.

## Public entry point

```python
from environment_engine import FeatureBuilder

builder = FeatureBuilder()
features = builder.build(latitude=28.6139, longitude=77.2090)
```

## Notes
- No FastAPI routes are included.
- No authentication or database assumptions are required.
- Each ingestion module exposes download/normalize/cache/query methods.
- Agent folders exist as placeholders only.
