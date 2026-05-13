# VerifyAI — Payroll Integrity Platform
### SquadHacks 3.0 · Challenge 01: "Proof of Life" · Team Synthex

> **Every Naira reaches a living worker.**

## The Problem
Nigeria loses ₦200B+ annually to ghost workers — fake, deceased, or duplicate employees collecting government salaries. Manual audits catch less than 10% of fraud.

## The Solution
VerifyAI uses AI to intercept salary disbursement. Funds are locked in a Squad escrow vault until each employee passes:
1. **Isolation Forest anomaly detection** — flags bulk enrollment, shared IPs, attendance gaps, salary outliers
2. **Facial liveness verification** — 3-step check blocks photo/video spoofing
3. **Squad API clearance** — only verified employees trigger disbursement

## Squad APIs Used
| API | Purpose |
|-----|---------|
| `POST /virtual-account` | Payroll escrow vault — funds locked until AI clears employees |
| `POST /payout/transfer` | Bulk salary disbursement to verified employees only |
| `GET /transaction/verify/:ref` | Transaction confirmation for immutable audit trail |

## Tech Stack
- **Frontend:** React 18 + Vite + TailwindCSS + Recharts + Framer Motion
- **AI Backend:** Python FastAPI + scikit-learn (Isolation Forest)
- **Payments:** Squad API (sandbox)
- **Auth:** JWT

## Quick Start

### Frontend
```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

### AI Backend
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

## Demo Flow
1. Login → HR Admin portal
2. Upload Payroll CSV (or use demo dataset)
3. Watch AI scan 1,240 records in 8 seconds
4. See 15 ghost workers flagged with risk scores
5. Click "Lock in Squad Escrow" → real Squad API fires
6. Employee liveness verification (3-step)
7. Squad disburses to verified employees only
8. Audit trail shows every action

## Demo Credentials
- HR Admin: `admin@verifyai.ng` / `demo1234`
- Employee ID: `EMP-00042`

## AI Model Details
- Algorithm: Isolation Forest
- Estimators: 200
- Contamination rate: 8%
- Features: enrollment hour, batch size, IP sharing, device reuse, salary ratio, attendance gap

## Team Synthex
Built for SquadHacks 3.0 — 48 hours.
