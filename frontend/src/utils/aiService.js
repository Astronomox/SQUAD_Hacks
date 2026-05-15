// aiService.js — all backend calls go through here.
// Base URL: VITE_AI_URL env var, fallback to localhost:8000
// Production: VITE_AI_URL is set in Vercel env vars → https://verifyaibe.onrender.com
// Local dev:  falls back to localhost:8000
const AI_BASE = import.meta.env.VITE_AI_URL || 'https://verifyaibe.onrender.com';

// ─── Core fetch helpers ───────────────────────────────────────────────────────

async function post(endpoint, body) {
  const res = await fetch(`${AI_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`POST ${endpoint} → ${res.status}: ${text.slice(0, 120)}`);
  }
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`${AI_BASE}${endpoint}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${endpoint} → ${res.status}: ${text.slice(0, 120)}`);
  }
  return res.json();
}

// ─── System ──────────────────────────────────────────────────────────────────

export const checkHealth = () => get('/health');

// ─── AI Engine ───────────────────────────────────────────────────────────────

export const scanPayroll    = (employees) => post('/analyze', { employees });
export const verifyLiveness = (data)      => post('/verify-liveness', data);

// ─── Squad API ───────────────────────────────────────────────────────────────

export const createEscrow = (cycleId, totalAmount, verifiedCount) =>
  post('/squad/create-escrow', { cycleId, totalAmount, verifiedCount });

export const accountLookup = (bankCode, accountNumber) =>
  post('/squad/account-lookup', { bankCode, accountNumber });

export const disburseSalary = (data) => post('/squad/disburse', data);

export const verifyTransaction = (txnRef) => get(`/squad/verify/${txnRef}`);

export const getSquadBalance = () => get('/squad/balance');

export const getSquadTransactions = () => get('/squad/transactions');

export const getSquadVirtualAccounts = () => get('/squad/virtual-accounts');

export const getVATransactions = (customerIdentifier) =>
  get(`/squad/va-transactions/${customerIdentifier}`);

export const simulatePayment = (virtual_account_number, amount) =>
  post('/squad/simulate-payment', { virtual_account_number, amount });

export const getWebhookErrors = () => get('/squad/webhook-errors');
