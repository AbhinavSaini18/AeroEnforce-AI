# Environment setup guide

This repository is prepared for a clean clone-and-run workflow.

## Install dependencies

Run the setup helper from the repository root:

```bash
bash setup.sh
```

The script creates a local virtual environment in `.venv`, upgrades `pip`, installs everything from `requirements.txt`, and verifies the core packages.

## Authenticate Google Earth Engine

Install the CLI and authenticate once:

```bash
earthengine authenticate
```

You can also point to a service account JSON file with:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Configure CDS API

Create a `~/.cdsapirc` file with your CDS credentials or export the API key directly:

```bash
export CDS_API_KEY=your-cds-api-key
```

## Get a NASA FIRMS API key

Register for a NASA FIRMS account and create an API key, then export it:

```bash
export NASA_FIRMS_API_KEY=your-firms-key
```

## Run the lightweight sample downloader

```bash
python download_data.py
```

This script performs a small, non-destructive initialization pass and prints a clear PASS/FAIL result for each step.

## Run the historical data preparation script

```bash
python download_historical_data.py
```

This script creates small sample historical datasets under `data/raw/` and converts the CSV outputs to Parquet where appropriate.
