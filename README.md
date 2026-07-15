# VerifyAI

**Every Naira reaches a living worker.**

AI-powered payroll integrity platform. VerifyAI detects ghost workers, salary anomalies, and duplicate identities in payroll data, then routes verified salaries through escrow-backed disbursement on the Squad API.

Built by **Team Synthex** for Squad Hackathon 3.0 — *Smart Systems: The Intelligent Economy*.

**Live demo:** https://verifyai-hr.vercel.app

---

## The problem

Ghost workers drain billions of Naira from Nigerian payrolls every year. Names on the payroll that belong to no one, duplicated identities collecting double salaries, and accounts that keep receiving pay long after the worker has left. Audits catch this months later, after the money is gone.

## What VerifyAI does

1. **Scan** — Upload payroll data. An Isolation Forest model flags statistical anomalies: outlier salaries, duplicate account patterns, suspicious employee records.
2. **Verify** — Flagged workers complete liveness verification. Face match confidence and spoof detection produce a verification score per employee.
3. **Disburse** — Verified salaries move through Squad virtual accounts and escrow. Unverified records are held, not paid.

Every disbursement is traceable: transaction verification, balance tracking, and webhook error monitoring are built in.

## Architecture

```
VerifyAI/
├── frontend/   React 18 + Vite + TailwindCSS
└── backend/    FastAPI + scikit-learn (Isolation Forest) + Squad API
```

The frontend calls the AI service through `src/utils/aiService.js`. If the backend is unreachable, it degrades to local scoring (`riskScoring.js`) so the demo never hard-fails.

## Backend API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/analyze` | Isolation Forest anomaly detection on payroll data |
| POST | `/verify-liveness` | Liveness verification scoring |
| POST | `/squad/create-escrow` | Create Squad virtual account escrow |
| POST | `/squad/account-lookup` | Resolve bank account details |
| POST | `/squad/disburse` | Disburse verified salary |
| GET | `/squad/verify/{txn_ref}` | Verify a transaction |
| GET | `/squad/balance` | Merchant balance |
| GET | `/squad/transactions` | Transaction history |
| GET | `/squad/virtual-accounts` | List virtual accounts |
| POST | `/squad/simulate-payment` | Sandbox payment simulation |
| GET | `/squad/webhook-errors` | Webhook failure log |
| GET | `/health` | Health check |

Interactive docs at `http://localhost:8000/docs` once the backend is running.

## Quick start

**Backend**

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Runs on `http://localhost:8000`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Environment**

```
# backend/.env
SQUAD_SECRET_KEY=your_squad_sandbox_key

# frontend/.env.local
VITE_AI_URL=http://localhost:8000
```

## Tech stack

- **Frontend:** React 18, Vite, TailwindCSS
- **AI:** scikit-learn Isolation Forest for unsupervised anomaly detection, custom liveness scoring
- **Payments:** Squad API (sandbox) — virtual accounts, escrow, transfers, webhooks
- **Backend:** FastAPI, Pydantic

## Extras in this repo

- `pitch-deck.html` — hackathon pitch deck
- `one-pager.html` — product one-pager with live Squad status widget

---

Team Synthex · Squad Hackathon 3.0
