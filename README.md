# Oorja AQI — Full Technical Documentation
### Hyperlocal Pollution Forecasting Platform | Ghaziabad / Delhi NCR | 9-Day Build

---

## How to read this doc

- **Part 1** — Backend data pipeline (flowchart + what each stage does)
- **Part 2** — AI/ML pipeline (flowchart + what each stage does)
- **Part 3** — Full database schema, table by table
- **Part 4** — 9-day execution plan, mapped to the pipelines above

Read Part 1 and 2 as two *separate* systems that only talk to each other through the database — that separation is intentional so backend and ML work can happen in parallel without blocking each other.

---

# PART 1 — Backend Data Pipeline

This is the "plumbing": how raw data gets from the outside world into our database and out to the frontend. No AI happens in this pipeline — it's pure ingestion, storage, and serving.

```
┌─────────────────────────────────────────────────────────────────┐
│  [1] EXTERNAL DATA APIs                                         │
│      AQICN (air quality) · OpenWeatherMap (weather)             │
│      TomTom (traffic) · NASA FIRMS (fire/thermal)                │
└───────────────────────────────┬─────────────────────────────────┘
                                 │  raw JSON, each with lat/lng
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [2] PYTHON INGESTION WORKERS                                   │
│      • One worker per API                                       │
│      • Converts lat/lng → nearest 1km grid_id (PostGIS)         │
│      • Runs on a schedule (APScheduler / cron)                  │
│      • Falls back to cached/mock data if an API is down         │
└───────────────────────────────┬─────────────────────────────────┘
                                 │  clean, grid-tagged rows
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [3] POSTGRESQL DATABASE — oorja_aqi                             │
│      Stores everything, tagged by grid_id + timestamp           │
│      (full schema in Part 3)                                    │
└───────────────────────────────┬─────────────────────────────────┘
                                 │  read by ML workers (Part 2)
                                 ▼
                     [ AI/ML Pipeline runs here — see Part 2 ]
                                 │
                                 │  writes predictions back to DB
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [4] FASTAPI BACKEND (Serving Layer)                             │
│      GET /grid                 → all grid cell boundaries       │
│      GET /predictions/heatmap  → current AQI forecast per cell  │
│      GET /predictions/{id}     → detail + timeline for one cell │
│      GET /attribution/{id}     → source breakdown for donut     │
│      POST /chat                → RAG assistant                  │
└───────────────────────────────┬─────────────────────────────────┘
                                 │  JSON over HTTP
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [5] REACT + MAPBOX FRONTEND                                     │
│      Heatmap layer · Timeline slider · Donut chart · Chat panel │
└─────────────────────────────────────────────────────────────────┘
```

### What to do, stage by stage

**Stage 1 — External APIs**
- Get all 4 API keys working on Day 1, one test call each, before writing any pipeline code.
- Know each API's rate limit up front — this determines your polling frequency.

**Stage 2 — Ingestion workers**
- Each worker is a separate script/module: `ingest_aqicn.py`, `ingest_weather.py`, `ingest_traffic.py`, `ingest_fires.py`.
- Grid-mapping approach: use a PostGIS spatial query (`ST_Contains` or `ST_Within`) to find which grid polygon a lat/lng falls into — don't hand-roll the math.
- **Build the fallback/mock data path in this same stage, not later.** Seed it from a few hours of real responses so it looks realistic. This is what keeps the demo alive if an API dies mid-judging.

**Stage 3 — Database**
- Single source of truth. Nothing talks to another component directly — everything goes through Postgres.
- Full schema in Part 3.

**Stage 4 — FastAPI**
- Keep endpoints thin — they should mostly be `SELECT` queries against `ai_predictions` and the metric tables, not doing computation live.
- Agree on the exact JSON response shape with the frontend dev *before* building the frontend against it (do this Day 5, per the execution plan).

**Stage 5 — Frontend**
- Mapbox heatmap layer colors cells by `predicted_aqi`.
- Clicking a cell fetches `/predictions/{id}` and `/attribution/{id}` for the detail panel.

---

# PART 2 — AI / ML Pipeline

This is where raw stored data becomes an actual forecast and an explanation. Runs independently of the backend — it just reads from Postgres and writes back to `ai_predictions`.

```
┌─────────────────────────────────────────────────────────────────┐
│  [1] HISTORICAL DATA INGESTION                                  │
│      Kaggle "Air Quality Dataset: Indian Cities"                │
│      (station-level, not gridded — this is raw training data)   │
└───────────────────────────────┬─────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [2] GRID INTERPOLATION                                          │
│      Spreads sparse station readings across the 1km mesh        │
│      Method: IDW (Inverse Distance Weighting)                   │
│      — NOT plain nearest-neighbor, which produces blocky,       │
│        unrealistic-looking heatmap patches                      │
└───────────────────────────────┬─────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [3] FEATURE MATRIX CONSTRUCTION                                 │
│      One row per (grid_id, timestamp), columns:                 │
│      PM2.5, PM10, NO2, SO2, temperature, wind speed/direction,  │
│      congestion_index, avg_speed, distance-to-nearest-fire       │
└───────────────────────────────┬─────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [4] MODEL INFERENCE ENGINES                                     │
│                                                                    │
│   Model A — Source Attribution        Model B — Forecasting      │
│   • RandomForestRegressor             • RandomForest / XGBoost   │
│   • Explained via SHAP                  (tabular, not ST-GCN —   │
│     (TreeExplainer), NOT raw            see note below)          │
│     feature_importances_                • Predicts T+24/48/72h   │
│   • SHAP values per grid cell →           AQI per grid cell      │
│     % breakdown: traffic / industrial                            │
│     / crop burning / other                                        │
└───────────────────────────────┬─────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [5] LLM SYNTHESIS (RAG)                                          │
│      • User asks a question in the chat panel                    │
│      • Backend runs a SQL query for that grid's real numbers     │
│      • Numbers are injected into the Llama-3 system prompt       │
│      • Model answers in plain English, grounded in real data     │
│        (prevents hallucinated numbers)                           │
└───────────────────────────────┬─────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  [6] OUTPUT — WRITE TO ai_predictions TABLE                      │
│      predicted_aqi, source_attribution (JSONB), confidence_score │
└─────────────────────────────────────────────────────────────────┘
```

### ⚠️ Two important deviations from a "textbook" version of this pipeline

**1. Model A must use SHAP, not `feature_importances_`.**
`feature_importances_` is a single global ranking for the whole trained model — every grid cell would show the *same* percentages, which defeats the point of a per-cell donut chart. SHAP (`shap.TreeExplainer(model)`) gives a per-prediction, per-cell breakdown instead. Same trained model, small code addition, correct output. **Sanity check before building the frontend on top of this: pull attribution for two different grid cells and confirm the percentages actually differ.**

**2. Model B is a tabular model (RF/XGBoost), not ST-GCN, for the 9-day build.**
Spatiotemporal graph convolution networks are a legitimate approach but need more validation time than 9 days allows, especially with sparse ground-truth. Build the tabular forecaster as the real, shipped model. ST-GCN goes on the "future work" slide in the pitch — that's a strength to mention, not a gap to hide.

### What to do, stage by stage

**Stage 1 — Historical data**
- Load the Kaggle dataset, clean nulls/duplicates, keep only NCR-relevant cities if the dataset is broader than that.

**Stage 2 — Interpolation**
- Implement IDW: `scipy.interpolate` or a simple manual weighted-distance function against the sparse real station points.
- Output: an estimated value for every one of the ~thousands of grid cells, not just the handful with real stations.

**Stage 3 — Feature matrix**
- Join across all 4 raw tables (sensor, weather, traffic, fire) by `grid_id` + nearest timestamp.
- No NaNs in the final matrix — decide a fill strategy (forward-fill, interpolated, or drop) and apply it consistently.

**Stage 4 — Models**
- Train Model B first (simpler, needed sooner for the heatmap).
- Train Model A second, validate with the two-cell sanity check above.
- Log MAE/RMSE for Model B — even rough numbers are good to have for the pitch ("our forecast is within X AQI points on average").

**Stage 5 — RAG**
- Keep the prompt simple: system prompt = injected real numbers + "answer using only this data."
- Don't let the LLM do any math itself — all numbers should come from the SQL query, not be computed by the model.

**Stage 6 — Output**
- A scheduled job (not a live request) periodically runs stages 3–5 and writes fresh rows to `ai_predictions`. The FastAPI layer just reads this table — it never runs inference live on a user request.

---

# PART 3 — Database Schema (`oorja_aqi`)

Six tables. Everything is tagged by `grid_id`, which ties back to the master grid table. Think of `city_1km_grid` as the spine — every other table hangs off it.

### 1. `city_1km_grid` — the spatial foundation
| Column | Type | What it means |
|---|---|---|
| `grid_id` | VARCHAR (PK) | Unique cell ID, e.g. `grid_14_25` |
| `grid_x` | INT | Column position in the grid matrix |
| `grid_y` | INT | Row position in the grid matrix |
| `grid_polygon` | GEOMETRY(Polygon, 3857) | The actual 1km × 1km square boundary on the map |

*Every other table's `grid_id` is a foreign key into this table.*

### 2. `sensor_readings` — live pollution data
*Source: AQICN / CPCB API*
| Column | Type | What it means |
|---|---|---|
| `reading_id` | SERIAL (PK) | Row ID |
| `grid_id` | VARCHAR (FK) | Which cell this reading belongs to |
| `timestamp` | TIMESTAMP | When it was recorded |
| `aqi` | INT | Overall Air Quality Index |
| `pm2_5` | NUMERIC | Fine particulate matter |
| `pm10` | NUMERIC | Coarse particulate matter |
| `no2` | NUMERIC | Nitrogen Dioxide |
| `so2` | NUMERIC | Sulfur Dioxide |

### 3. `weather_metrics` — atmospheric data
*Source: OpenWeatherMap API*
| Column | Type | What it means |
|---|---|---|
| `metric_id` | SERIAL (PK) | Row ID |
| `grid_id` | VARCHAR (FK) | Which cell |
| `timestamp` | TIMESTAMP | When |
| `temperature` | NUMERIC | °C |
| `wind_speed` | NUMERIC | m/s — matters a lot for how pollution disperses |
| `wind_direction` | INT | Compass degrees (0–360) — used to figure out *which* neighboring cell pollution might be blowing in from |

### 4. `traffic_metrics` — mobility data
*Source: TomTom Traffic Flow API*
| Column | Type | What it means |
|---|---|---|
| `metric_id` | SERIAL (PK) | Row ID |
| `grid_id` | VARCHAR (FK) | Which cell |
| `timestamp` | TIMESTAMP | When |
| `congestion_index` | NUMERIC | 0–100 severity scale |
| `average_speed` | NUMERIC | km/h, current flow speed |

### 5. `static_emission_sources` — thermal & GIS data
*Source: NASA FIRMS API & Municipal GIS*
| Column | Type | What it means |
|---|---|---|
| `source_id` | SERIAL (PK) | Row ID |
| `grid_id` | VARCHAR (FK) | Which cell |
| `source_category` | TEXT | e.g. `'Crop_Fire'`, `'Industrial'` |
| `location_point` | GEOMETRY(Point, 4326) | Exact GPS coordinate of the source |
| `brightness_temp` | NUMERIC | Fire intensity — higher usually means a bigger/hotter burn |

### 6. `ai_predictions` — the frontend serving hub
*Source: internal Python ML workers (Part 2, Stage 6)*
| Column | Type | What it means |
|---|---|---|
| `prediction_id` | SERIAL (PK) | Row ID |
| `grid_id` | VARCHAR (FK) | Which cell |
| `target_timestamp` | TIMESTAMP | The *future* time this prediction is for |
| `predicted_aqi` | INT | Feeds the Mapbox heatmap color |
| `source_attribution` | JSONB | `{"traffic": 45, "industrial": 20, "crop_burning": 30, "other": 5}` — feeds the donut chart |
| `confidence_score` | NUMERIC | How certain the model is |

**This is the only table the frontend ever reads predictions from.** Every other table is "backstage" — used by the ingestion and ML pipelines, but never queried directly by the UI.

---

# PART 4 — 9-Day Execution Plan (mapped to Parts 1 & 2)

| Day | Focus | Maps to |
|---|---|---|
| 1 | Schema (Part 3) + grid generation + API keys working | Backend Stage 1–3 |
| 2 | Ingestion workers + fallback/mock data | Backend Stage 2 |
| 3 | Historical data load + IDW interpolation | AI Stage 1–2 |
| 4 | Feature matrix + Model A (RF+SHAP) + Model B (RF/XGBoost) | AI Stage 3–4 |
| 5 | FastAPI endpoints, agree response shape with frontend | Backend Stage 4 |
| 6 | React + Mapbox heatmap, wired to real backend data | Backend Stage 5 |
| 7 | RAG chat + timeline slider | AI Stage 5, Backend Stage 5 |
| 8 | Kill each API mid-run to test fallback, polish, write pitch narrative | End-to-end |
| 9 | Rehearsal only — no new features, record backup demo video | — |

**One rule for all 9 days:** if backend and ML are blocked on each other, the block is almost always "we haven't agreed on the table schema or response shape yet." Fix that conversation immediately rather than letting either side guess.

---

*Doc generated for team reference. Flag anything that needs updating as the build progresses.*
