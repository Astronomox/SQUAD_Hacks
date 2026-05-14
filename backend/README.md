# VerifyAI — Backend

FastAPI + Isolation Forest + Squad API

## Setup
```
pip install -r requirements.txt
python main.py
```
Runs on http://localhost:8000
Swagger UI: http://localhost:8000/docs

## Structure
- main.py         — app entry point
- config.py       — Squad credentials + env vars
- models.py       — Pydantic request/response models
- routers/ai.py   — Isolation Forest scan + liveness
- routers/squad.py — all Squad API endpoints

## Env
Create a .env file:
```
SQUAD_SECRET=sandbox_sk_...
```
