# VerifyAI — Payroll Integrity Platform

> AI-powered payroll verification that stops ghost worker fraud before funds leave government accounts.
> Built for SquadHacks 3.0 — Challenge 01: "Proof of Life"

**Tagline:** _Every Naira reaches a living worker._

---

## The Problem

Nigeria loses **₦200B+ annually** to ghost workers — fake, deceased, or duplicate employees collecting government salaries. Manual audits catch less than 10% of this fraud.

## The Solution

VerifyAI sits between payroll and disbursement:

1. **HR uploads payroll CSV** → AI scans every record in seconds
2. **Anomaly engine flags** duplicate IPs, bulk enrollments, attendance gaps, salary outliers
3. **Funds locked in Squad Escrow Vault** — no disbursement until verification
4. **Employees complete facial liveness check** on any device
5. **Only verified employees** trigger Squad bulk transfer
6. **Every action logged** to an immutable, cryptographically-chained audit trail

## Squad APIs Used

| API | Purpose |
|---|---|
| **Virtual Accounts** | Per-cycle escrow vault — funds ring-fenced until AI clearance |
| **Bulk Disbursement** | Single API call disburses to all verified employees |
| **Transaction Verification** | Confirms each transfer for the audit trail |

The Squad integration is mocked at `src/utils/squadMock.js` with the real API response shapes. Drop in real keys via `.env` to go live.

---

## Quick Start

```bash
git clone <this-repo>
cd verifyai
npm install
cp .env.example .env   # optional — add Squad keys when going live
npm run dev
```

App runs at **http://localhost:3000**.

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build
```

### Demo Credentials

- **HR Admin:** `admin@verifyai.ng` / `demo1234`
- **Test Employee ID:** `EMP-00001` (any employee from the demo dataset)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| Styling | TailwindCSS 3 + CSS variables |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | lucide-react |
| Type / Mono | Sora · DM Sans · JetBrains Mono (Google Fonts) |

## Folder Structure

```
src/
├── main.jsx              # React entry
├── App.jsx               # Router + page routes
├── index.css             # Global styles + design tokens
├── pages/                # 6 top-level pages
├── components/
│   ├── layout/           # Sidebar, Navbar, AppLayout
│   ├── ui/               # Button, StatCard, RiskBadge, StatusBadge, Modal
│   ├── dashboard/        # StatsBar, DepartmentChart, ActivityFeed, PayrollCyclesTable
│   ├── payroll/          # CSVUploader, ScanProgress, ResultsTable, EscrowCard
│   ├── verification/     # LivenessCamera, StepIndicator, VerificationResult
│   ├── fraud/            # FlaggedList, RiskGauge, FlagCard, InvestigationPanel
│   └── audit/            # AuditTable, AuditFilters
├── data/                 # Mock datasets (200 employees, cycles, flags, log)
├── hooks/                # useVerification, usePayroll, useAuditLog
└── utils/                # formatters, riskScoring, squadMock
```

## Pages

1. **Login** — Dual-portal entry (HR Admin / Employee Verify) with brand panel.
2. **HR Dashboard** — 5-stat overview, department chart, live activity feed, payroll cycles.
3. **Payroll Upload** — CSV drop zone → AI scan animation → results table → Squad escrow lock.
4. **Employee Verification** — Mobile-first liveness flow with success/failure result states.
5. **Fraud Investigation** — Master/detail flagged-employee list with risk gauge, flag cards, actions.
6. **Audit Trail** — Immutable, filterable, exportable log of every action.

## How the AI Works (in the prototype)

The frontend includes a working anomaly scoring algorithm at `src/utils/riskScoring.js`:

- **Bulk enrollment detection** (+25–40 pts) — same `enrollmentBatchId`, suspicious enrollment hour
- **IP / device clustering** (+30–40 pts) — multiple employees sharing IP or fingerprint
- **Attendance gap** (+8–20 pts) — days since last attendance
- **Salary outlier** (+9–25 pts) — salary deviation vs. department median
- **Pattern matching** (+18 pts) — duplicate bank accounts, identical timestamps

In production, this runs as a Python FastAPI microservice using scikit-learn's Isolation Forest. The frontend logic mirrors the same feature set.

## Deployment

Vite outputs a static `dist/` folder. Drag it into Netlify, Vercel, Cloudflare Pages, or any static host. No backend required for the demo.

```bash
npm run build
# upload dist/ to your host
```

---

## The Team

[Your names here]

---

_Built for SquadHacks 3.0._
