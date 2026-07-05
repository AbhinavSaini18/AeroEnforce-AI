# 🚀 AeroEnforce AI — Contributor Setup Guide

Welcome to the **AeroEnforce AI** workspace! This repository houses our predictive spatial intelligence platform, combining live environmental APIs, a 1km x 1km PostGIS spatial grid, and multi-agent AI workflows to deliver proactive urban air quality interventions.

To ensure alignment and prevent broken dependencies, please follow this environment setup guide carefully.

---

# 🏗️ Repository Architecture

This codebase is organized as a unified **Monorepo**. Do **not** create separate repositories for individual components.

```text
AeroEnforce-AI/
│
├── backend/                 # FastAPI Engine, SQL/GeoAlchemy2, Ingestion pipelines
│   ├── app/                 # Core logic application directory
│   │   ├── services/        # Live API ingestion scripts (MODIS, VIIRS, CPCB, etc.)
│   │   ├── database.py      # PostGIS connection pool configuration
│   │   └── models.py        # Spatial schemas (SpatialGrid & SensorObservation)
│   ├── init_db.py           # Database migration/table generation script
│   └── requirements.txt     # Locked Python package requirements
│
├── Frontend/                # UI Dashboard (React / Next.js / Vite environment)
│
└── docker-compose.yml       # Root infrastructure orchestration (PostGIS container)
```

---

# ⚙️ Step-by-Step Environment Setup

## 1️⃣ Securely Clone the Repository

Do not download this project as a ZIP archive. Clone it via Git to preserve branch tracking and commits.

```bash
git clone https://github.com/AbhinavSaini18/AeroEnforce-AI.git
cd AeroEnforce-AI
```

---

## 2️⃣ Initialize the Local Infrastructure Database

Ensure Docker Desktop is open and running on your machine.

From the root directory (`AeroEnforce-AI/`), execute:

```bash
docker compose up -d
```

This command pulls the `postgis/postgis:16-3.4` container image and boots the spatial engine in detached mode on port **5432**.

---

## 3️⃣ Setup Python Virtual Environment (OS-Specific)

Navigate directly into the backend folder before executing environment commands.

```bash
cd backend
```

### 🌐 Linux & macOS

Run the following commands sequentially in your terminal.

```bash
# 1. Create the virtual environment
python3 -m venv venv

# 2. Activate the virtual environment
source venv/bin/activate

# 3. Upgrade pip and install all locked project dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

### 🪟 Windows

Run the following commands sequentially in your Command Prompt (**cmd**) or **PowerShell**.

```bash
# 1. Create the virtual environment
python -m venv venv

# 2. Activate the virtual environment

# Command Prompt:
venv\Scripts\activate

# PowerShell:
.\venv\Scripts\Activate.ps1

# 3. Upgrade pip and install all locked project dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4️⃣ Seed and Generate Database Schemas

Once your virtual environment is activated and your requirements are completely installed, run the database initialization script to build your local tables.

```bash
python init_db.py
```

Verify that the console outputs:

> ✅ Database initialized and tables generated successfully!

---

# 🚦 Git Branching & Contribution Workflow

To keep the `main` branch completely stable, direct pushing to `main` is strictly prohibited.

Follow these steps to submit your modules.

---

## 1️⃣ Create an Isolated Feature Branch

Before writing any code, pull the latest changes from the server and create a dedicated branch named after your feature.

```bash
git checkout main
git pull origin main
git checkout -b feature/<your-task-name>

# Example:
# git checkout -b feature/satellite-modis-pipeline
```

---

## 2️⃣ Commit and Snapshot Work Regularly

Keep your commits highly specific and well-documented. Do not group unrelated features into a single commit.

```bash
git add .
git commit -m "feat: integrate async httpx fetch for MODIS thermal anomalies"
```

---

## 3️⃣ Push and Open a Code Review

Push your branch to the cloud remote.

```bash
git push origin feature/<your-task-name>
```

Go to the GitHub repository web interface, click **Compare & pull request**, complete the standard checklist, and assign the project maintainer for structural review before code integration.
