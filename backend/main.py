"""
VerifyAI — AI Service
Entry point. Registers routers and starts server.

Routers:
  routers/ai.py    — Isolation Forest scan + liveness verification
  routers/squad.py — All Squad API calls (escrow, transfer, balance, VAs)

Models:    models.py
Config:    config.py (env vars, Squad credentials)
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import SQUAD_SECRET, MERCHANT_ID
from routers.ai        import router as ai_router
from routers.squad     import router as squad_router
from routers.employees import router as emp_router

app = FastAPI(
    title="VerifyAI AI Service",
    description="Payroll integrity engine. AI anomaly detection + Squad API payments.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register routers ─────────────────────────────────────────────────────────
app.include_router(ai_router)
app.include_router(squad_router)
app.include_router(emp_router)


# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "service": "VerifyAI AI Engine v1.0",
        "squad_key": SQUAD_SECRET[:18] + "...",
        "merchant_id": MERCHANT_ID
    }


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
