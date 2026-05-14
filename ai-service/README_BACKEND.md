# VerifyAI Backend — AI Service

## Quick Start
```
pip install -r requirements.txt
python main.py
```
Runs on http://localhost:8000

## Endpoints
- POST /analyze — Isolation Forest anomaly detection on payroll data
- POST /verify-liveness — Liveness verification scoring
- POST /squad/create-escrow — Real Squad Virtual Account API
- POST /squad/disburse — Real Squad Transfer API
- GET  /squad/verify/:ref — Transaction verification
- GET  /health — Health check
