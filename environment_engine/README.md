# Environmental Intelligence Engine

This package is a reusable environmental data engine designed to be dropped into a larger backend with minimal changes.

## Structure
- ingestion/: adapters for Sentinel-5P, FIRMS, ERA5, Open-Meteo, CAAQMS, historical AQI, and geospatial data
- normalization/: normalization hooks for external payloads
- caching/: simple disk-based caching helpers
- feature_builder/: one public builder interface that composes all environmental features
- schemas/: feature bundle schema definitions
- agents/: placeholder folders for future AI agents

## Public interface
Import the builder as:

```python
from environment_engine import FeatureBuilder

builder = FeatureBuilder()
features = builder.build(latitude=28.6139, longitude=77.2090)
```

## Integration notes
A future FastAPI backend only needs to call FeatureBuilder.build(...) and consume the returned dictionary.
