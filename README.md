# Nexora — AI-Powered Security Monitoring & Incident Reconstruction

Nexora doesn't stop at "flag the outlier on a dashboard." It **correlates flagged
events across time into one coherent incident** — the mechanism that separates
UEBA-style tooling from plain anomaly detection — and shows the evidence chain
that produced each incident. Detection is validated with measured numbers, not
numbers the simulator guarantees.

This repo is a **complete, runnable system**: a simulator, a detection engine, a
correlation engine, a FastAPI backend (REST + WebSocket, Postgres/SQLite), and a
React dashboard wired to live data.

![pipeline](https://img.shields.io/badge/pipeline-simulator→detection→correlation→API→UI-blue)

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  FRONTEND  (React + TS, frontend/)                            │
│  Dashboard · live stream · correlation graph · incidents ·    │
│  evidence chain · benchmarks — one WebSocket, REST snapshots  │
└───────────────▲───────────────────────────────────────────────┘
                │ REST + WebSocket
┌───────────────┴───────────────────────────────────────────────┐
│  BACKEND  (FastAPI, backend/)                                 │
│  /api/events /api/incidents /api/metrics /api/simulate/...    │
│  /ws/events  ·  SQLAlchemy → Postgres (or SQLite)             │
│                                                               │
│  LIVE PIPELINE (backend/app/pipeline.py), every tick:         │
│    simulator ─▶ rolling window ─▶ detection ─▶ correlation ─▶ │
│    persist + broadcast                                        │
└───┬─────────────────┬────────────────────┬────────────────────┘
    │                 │                    │
┌───▼──────────┐ ┌────▼──────────┐ ┌───────▼────────────────────┐
│ simulator/   │ │ detection/    │ │ correlation/                │
│ normal traffic│ │ IsolationForest│ │ entity-linked event graph   │
│ + 4 attack    │ │ + rule flags  │ │ + attack-chain templates    │
│ injectors     │ │ + classifier  │ │ + severity scoring          │
│ (p2-pipeline) │ │               │ │ → incident + evidence chain │
└───────────────┘ └───────────────┘ └─────────────────────────────┘
```

Single canonical event schema (`p2-pipeline/schema/event_schema.json`) is the
one contract: the backend Pydantic models and the frontend TypeScript types
mirror it, and a test asserts they stay in sync.

---

## Quick start

### Option A — Docker + Postgres (primary)

```bash
docker compose up --build
# open http://localhost:8000
```

One image builds the frontend, installs the backend, trains the detection models,
and serves the SPA + API + WebSocket on port 8000, backed by Postgres (events and
incidents persist across restarts).

### Option B — Local (no Docker, SQLite)

```bash
# 1. Python backend (from repo root)
python -m pip install -r requirements.txt
python -m detection.train_baseline        # one-time: trains models + writes metrics
python -m uvicorn backend.app.main:app --port 8000
#    → http://localhost:8000 (serves the SPA if frontend/dist exists)

# 2. Frontend dev server (separate terminal, optional — for hot reload)
cd frontend
npm install
npm run dev                                 # → http://localhost:5173 (auto-targets :8000)
```

- `http://localhost:8000/docs` — interactive API docs
- `ws://localhost:8000/ws/events` — live event/incident/stats stream

---

## Using it

Open the dashboard, click **Inject Attack**, and pick one of the four scoped
attacks. Watch it stream into the live feed, get flagged by the detector,
reconstructed by the correlation engine into a single incident, and animate the
attack chain on the graph with a threat card. The **Incidents** page shows the
full evidence chain; **Analytics** shows the benchmark numbers.

---

## Attack scenarios (scope — plan §5/§7)

| Attack | Signal class | How it's detected | Correlation template |
|---|---|---|---|
| **Brute force** | auth | ≥5 failed logins/user in a window → compromise chain | failures → success → db read → file download |
| **Port scan** | network | ≥15 `connection_attempt`/IP in a window | burst of probes, one source IP |
| **Data exfiltration** | volume | large file download (≥10 MB) | login → db read → bulk download |
| **API abuse** | rate | ≥25 `api_call`/IP in a window | API-call burst, one source IP |

Out of scope by design: privilege-escalation / insider scenarios, SQL-injection,
a learned graph-neural correlation model, enterprise streaming infra.

---

## Data strategy & metrics (plan §4, §10 — the honest framing)

Detection has two numbers, and Nexora reports both:

- **Supervised classifier on simulated data** is near-perfect *by construction*
  — injected attacks are separable, which is the **circularity trap**, not a
  headline. The Analytics page labels it as such.
- **Unsupervised IsolationForest** (attack-vs-benign) is the honest, transferable
  number: **≈ P 0.83 / R 0.89 / F1 0.86** on held-out simulated data.
- **Correlation accuracy**: 4/4 scoped attacks reconstructed into one incident
  (reproducible self-check at `/api/metrics`).
- **Benign false-positive rate** and **max detection latency** are reported too.

For the **real-data** number (CICIDS2017 / UNSW-NB15), drop the dataset into
`data/raw/` and run:

```bash
python -m detection.benchmark_cicids --dataset cicids2017   # or --dataset unsw
```

This writes `data/processed/metrics_real.json`. The live demo runs on the
simulator because no public dataset gives cross-system (auth→api→db→file) event
correlation at the granularity the reconstruction engine needs.

---

## Project structure

```
p2-pipeline/simulator/    normal-traffic generator + 4 attack injectors
p2-pipeline/schema/       canonical event schema (single source of truth)
detection/                features, IsolationForest detector, classifier, training, benchmark
correlation/              event graph, templates, matcher, scoring, engine
backend/app/              FastAPI app, routers, live pipeline, WebSocket, DB models
frontend/src/             React dashboard (pages, live WebSocket provider, graph)
data/processed/           generated metrics (+ class distributions)
```

## Testing

```bash
# simulator schema tests
cd p2-pipeline && python -m pytest tests/ -v
# correlation / detection sanity (from repo root)
python -m detection.train_baseline        # prints metrics
```

## Tech stack

Python · FastAPI · scikit-learn · NetworkX · SQLAlchemy · Postgres/SQLite ·
React + TypeScript · Vite · Tailwind · Framer Motion · WebSocket.
