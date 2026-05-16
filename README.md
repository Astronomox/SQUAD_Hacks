# VerifyAI — Payroll Integrity Platform

## SquadHacks 3.0 · Challenge 01: "Proof of Life" · Team Synthex

> **Every Naira reaches a living worker.**

---

## The Problem

Nigeria loses ₦200B+ annually to ghost workers — fake, deceased, or duplicate employees collecting government salaries. Manual audits catch less than 10% of fraud. Current payroll systems verify names in databases, not whether humans actually exist.

---

## The Solution

VerifyAI uses AI to intercept salary disbursement. Funds are locked in a Squad escrow vault until each employee passes:

1. **Isolation Forest anomaly detection** — flags bulk enrollment, shared IPs, attendance gaps, salary outliers
2. **Facial liveness verification** — 3-step check blocks photo and video spoofing
3. **Squad API clearance** — only verified employees trigger disbursement

---

## Squad APIs Used

| API | Purpose |
|-----|---------|
| `POST /virtual-account` | Payroll escrow vault — funds locked until AI clears employees |
| `POST /payout/transfer` | Salary disbursement to verified employees only |
| `GET /transaction/verify/:ref` | Transaction confirmation for immutable audit trail |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + Recharts + Framer Motion |
| AI Backend | Python FastAPI + scikit-learn (Isolation Forest) |
| Payments | Squad API (sandbox) |
| Deployment | Vercel (frontend) + local Python service |

---

## Quick Start

### 1. Frontend

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

### 2. AI Backend
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

## Demo Flow

1. **Login** → HR Admin portal (`admin@verifyai.ng` / `demo1234`)
2. **Dashboard** — Live AI Engine status, real-time stats
3. **Upload Payroll** → Use demo dataset
4. **AI Scan** — Isolation Forest analyzes 200 records in ~8 seconds
5. **Review Results** — 15 ghost workers flagged with risk scores 0–100
6. **Lock Escrow** — Real Squad Virtual Account API fires
7. **Employee Verification** — Enter `EMP-00042`, complete 3-step liveness check
8. **Squad Disburses** — Transfer API sends salary to verified employee
9. **Audit Trail** — Every action logged, cryptographically sealed, fully filterable

---

## AI Model

- **Algorithm:** Isolation Forest
- **Estimators:** 200
- **Contamination rate:** 8%
- **Features:** enrollment hour, batch size, IP sharing, device reuse, salary ratio, attendance gap
- **Output:** Risk score 0–100, status (verified / flagged / blocked), flag breakdown per employee

---

## Demo Credentials

| Role | Credential |
|------|-----------|
| HR Admin | `admin@verifyai.ng` / `demo1234` |
| Employee IDs | `EMP-00001` through `EMP-00200` |
| Ghost workers | `EMP-00089` through `EMP-00093` (Pattern A, risk 88–96) |

---

## Project Structure

```
SQUAD_Hacks/
├── src/
│   ├── pages/              # 6 full pages
│   ├── components/         # UI, layout, dashboard, payroll, fraud, audit, verification
│   ├── hooks/              # usePayroll, useVerification, useAuditLog
│   ├── utils/              # aiService.js, formatters, riskScoring, squadMock
│   └── data/               # employees, auditLog, fraudFlags, payrollCycles
├── ai-service/
│   ├── main.py             # FastAPI + Isolation Forest + Squad API
│   └── requirements.txt
├── pitch-deck.html         # 10-slide presentation
├── one-pager.html          # A4 submission summary
└── README.md
```

---

## The Four Pillars

| Pillar | Implementation |
|--------|---------------|
| AI Automation | Isolation Forest anomaly detection + facial liveness verification |
| Use of Data | 200 employees, 6 fraud signals, real-time risk scoring |
| Squad APIs | Virtual Account escrow + Transfer disbursement + Transaction verification |
| Financial Innovation | Escrow-locked payroll — no payment without AI clearance |

---

## Impact

| Metric | Value |
|--------|-------|
| Ghost workers detected (pilot) | 15 of 200 |
| Leakage prevented (first cycle) | ₦4.2M |
| AI scan time | ~8 seconds |
| States that could deploy immediately | 36 |
| Potential annual savings at national scale | ₦7.2B+ |

---

## Team Synthex

Built for SquadHacks 3.0 — Challenge 01

`github.com/Astronomox/SQUAD_Hacks`
