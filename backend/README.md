# TrackingApp Backend (FastAPI + PostgreSQL)

REST API that serves sales reps, their routes/shops, and live GPS location
data to the React Native manager app.

## Prerequisites

- Python 3.11+
- A running PostgreSQL instance

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create the database in PostgreSQL:

```bash
createdb tracking      # or: psql -c "CREATE DATABASE tracking;"
```

Configure the connection:

```bash
cp .env.example .env
# edit DATABASE_URL if your user/password/host differ
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first startup the tables are created and seeded automatically. Set
`RESET_DB=1` in `.env` to drop and re-seed on the next start.

Interactive docs: http://localhost:8000/docs

## Endpoints

| Method | Path                      | Description                                  |
|--------|---------------------------|----------------------------------------------|
| GET    | `/health`                 | Health check                                 |
| GET    | `/reps`                   | List all reps (with progress + live position)|
| GET    | `/reps/{id}`              | A single rep                                 |
| GET    | `/reps/{id}/route`        | Route: shops, planned polyline, GPS history  |
| GET    | `/reps/{id}/location`     | Latest position + full breadcrumb history    |
| POST   | `/reps/{id}/location`     | Record a GPS ping (called by the rep's app)  |

## Simulating live movement

The manager app only reads location data. To see the live trail move, run the
included simulator (stands in for the rep's mobile app):

```bash
python simulate_rep.py rep1 --interval 3
```

## Connecting the app

The RN app reads its API base URL from `src/constants/config.ts`:

- Android emulator: `http://10.0.2.2:8000`
- iOS simulator: `http://localhost:8000`
- Physical device: set it to your machine's LAN IP, e.g. `http://192.168.1.20:8000`
