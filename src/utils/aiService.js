// VerifyAI — AI Service Client
// All AI, verification, and payment operations go through this module.
// The backend is the single source of truth for all scores, flags, and Squad transactions.

const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function post(endpoint, body) {
  const res = await fetch(`${AI_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Service ${endpoint} failed: ${res.status} — ${err}`);
  }
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`${AI_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`AI Service ${endpoint} failed: ${res.status}`);
  return res.json();
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth() {
  return get('/health');
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────
// Sends all employee records to the Python Isolation Forest model.
// Returns risk scores, flags, and anomaly verdicts per employee.

export async function scanPayroll(employees) {
  return post('/analyze', { employees });
}

// ─── Liveness Verification ────────────────────────────────────────────────────
// Sends liveness signals from the camera step to the backend.
// Backend determines pass/fail/review verdict.

export async function verifyLiveness({ employeeId, livenessScore, faceMatchConfidence, spoofDetected, stepsPassed }) {
  return post('/verify-liveness', {
    employeeId,
    livenessScore,
    faceMatchConfidence,
    spoofDetected,
    stepsPassed,
  });
}

// ─── Squad: Escrow ────────────────────────────────────────────────────────────
// Creates a Squad Virtual Account to hold payroll funds.
// Funds are ring-fenced until each employee is verified.

export async function createEscrow(cycleId, totalAmount, verifiedCount) {
  return post('/squad/create-escrow', { cycleId, totalAmount, verifiedCount });
}

// ─── Squad: Disburse ──────────────────────────────────────────────────────────
// Transfers salary to a single verified employee via Squad Transfer API.

export async function disburseSalary({ employeeId, amount, bankCode, accountNumber, accountName, cycleId }) {
  return post('/squad/disburse', { employeeId, amount, bankCode, accountNumber, accountName, cycleId });
}

// ─── Squad: Verify Transaction ────────────────────────────────────────────────

export async function verifyTransaction(txnRef) {
  return get(`/squad/verify/${txnRef}`);
}
