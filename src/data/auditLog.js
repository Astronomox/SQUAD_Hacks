// Audit log — immutable record of every system event.
// In production this is a Postgres table with a cryptographic chain;
// here we hardcode a realistic recent window for the demo.

import { GHOST_EMPLOYEES, VERIFIED_EMPLOYEES } from './employees.js';

const cleanSample = VERIFIED_EMPLOYEES.slice(0, 6);
const ghostSample = GHOST_EMPLOYEES.slice(0, 4);

function ts(daysAgo, h, m, s = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, s, 0);
  return d.toISOString();
}

export const AUDIT_LOG = [
  // Today
  { idx: 32, timestamp: ts(0, 14, 42, 18), actor: 'HR Admin · Funmi A.', actorType: 'hr',     action: 'Funds locked in escrow',    employeeId: null,             entity: 'PYC-2025-05', amount: 37_220_000, outcome: 'success',     txRef: 'SQ-2025-ESC-04712', detail: '₦37.22M moved to Squad Virtual Account' },
  { idx: 31, timestamp: ts(0, 14, 40,  2), actor: 'AI Engine',           actorType: 'ai',     action: 'Ghost worker detected',     employeeId: ghostSample[0].id, entity: ghostSample[0].id, amount: ghostSample[0].salaryAmount, outcome: 'blocked', txRef: null, detail: 'Pattern A — bulk enrollment + shared IP' },
  { idx: 30, timestamp: ts(0, 14, 40,  1), actor: 'AI Engine',           actorType: 'ai',     action: 'Ghost worker detected',     employeeId: ghostSample[1].id, entity: ghostSample[1].id, amount: ghostSample[1].salaryAmount, outcome: 'blocked', txRef: null, detail: 'Pattern A — bulk enrollment + shared IP' },
  { idx: 29, timestamp: ts(0, 14, 40,  0), actor: 'AI Engine',           actorType: 'ai',     action: 'Anomaly scan complete',     employeeId: null,             entity: 'PYC-2025-05', amount: null, outcome: 'success', txRef: null, detail: `${VERIFIED_EMPLOYEES.length} records · ${GHOST_EMPLOYEES.length} flagged · 8.3s` },
  { idx: 28, timestamp: ts(0, 14, 39, 53), actor: 'AI Engine',           actorType: 'ai',     action: 'Anomaly scan started',      employeeId: null,             entity: 'PYC-2025-05', amount: null, outcome: 'info',    txRef: null, detail: 'Isolation Forest engine v2.1' },
  { idx: 27, timestamp: ts(0, 14, 39, 40), actor: 'HR Admin · Funmi A.', actorType: 'hr',     action: 'Uploaded payroll CSV',      employeeId: null,             entity: 'PYC-2025-05', amount: null, outcome: 'success', txRef: null, detail: 'kogi_may_2025.csv · 200 rows · 142 KB' },

  // -1 day
  { idx: 26, timestamp: ts(1, 11, 18,  7), actor: 'Employee',             actorType: 'employee', action: 'Liveness verified',       employeeId: cleanSample[0].id, entity: cleanSample[0].id, amount: cleanSample[0].salaryAmount, outcome: 'verified', txRef: 'SQ-2025-VRF-04421', detail: 'Liveness 0.94 · Match 0.91' },
  { idx: 25, timestamp: ts(1, 11, 18,  8), actor: 'Squad API',            actorType: 'squad',    action: 'Salary disbursed',        employeeId: cleanSample[0].id, entity: cleanSample[0].id, amount: cleanSample[0].salaryAmount, outcome: 'payment_sent', txRef: cleanSample[0].squadDisbursementRef, detail: `Settled to ${cleanSample[0].bankName} ••${cleanSample[0].bankAccount.slice(-4)}` },
  { idx: 24, timestamp: ts(1, 11, 17, 55), actor: 'Employee',             actorType: 'employee', action: 'Liveness failed',         employeeId: 'EMP-00982',       entity: 'EMP-00982',         amount: null, outcome: 'failed',  txRef: null, detail: 'Liveness 0.41 · no movement detected' },
  { idx: 23, timestamp: ts(1, 11, 14, 22), actor: 'System',               actorType: 'system',   action: 'Verification request sent', employeeId: null,           entity: '1,217 employees',   amount: null, outcome: 'info',    txRef: null, detail: 'SMS + push notification' },
  { idx: 22, timestamp: ts(1, 10, 30,  0), actor: 'HR Admin · Funmi A.',  actorType: 'hr',       action: 'Flag escalated',          employeeId: ghostSample[2].id, entity: ghostSample[2].id,   amount: ghostSample[2].salaryAmount, outcome: 'escalated', txRef: null, detail: 'Forwarded to ICPC — ref IC/2025/0411' },
  { idx: 21, timestamp: ts(1,  9, 31, 45), actor: 'Squad API',            actorType: 'squad',    action: 'Salary disbursed',        employeeId: cleanSample[1].id, entity: cleanSample[1].id,   amount: cleanSample[1].salaryAmount, outcome: 'payment_sent', txRef: cleanSample[1].squadDisbursementRef, detail: `Settled to ${cleanSample[1].bankName} ••${cleanSample[1].bankAccount.slice(-4)}` },
  { idx: 20, timestamp: ts(1,  9, 31, 44), actor: 'Employee',             actorType: 'employee', action: 'Liveness verified',       employeeId: cleanSample[1].id, entity: cleanSample[1].id,   amount: cleanSample[1].salaryAmount, outcome: 'verified', txRef: 'SQ-2025-VRF-04422', detail: 'Liveness 0.92 · Match 0.89' },
  { idx: 19, timestamp: ts(1,  9, 14, 23), actor: 'System',               actorType: 'system',   action: 'Payment blocked',         employeeId: ghostSample[0].id, entity: ghostSample[0].id,   amount: ghostSample[0].salaryAmount, outcome: 'blocked', txRef: null, detail: 'Auto-blocked from AI flag' },
  { idx: 18, timestamp: ts(1,  9, 14, 22), actor: 'AI Engine',            actorType: 'ai',       action: 'Ghost worker detected',   employeeId: ghostSample[3].id, entity: ghostSample[3].id,   amount: ghostSample[3].salaryAmount, outcome: 'flagged', txRef: null, detail: 'Pattern B — duplicate device fingerprint' },

  // -2 days
  { idx: 17, timestamp: ts(2, 16,  2, 55), actor: 'HR Admin · Funmi A.',  actorType: 'hr',       action: 'Flag cleared',           employeeId: cleanSample[2].id, entity: cleanSample[2].id, amount: null, outcome: 'verified', txRef: null, detail: 'False positive — confirmed via supervisor' },
  { idx: 16, timestamp: ts(2, 14, 22,  1), actor: 'Squad API',            actorType: 'squad',    action: 'Bulk transfer settled', employeeId: null,             entity: 'PYC-2025-04',     amount: 36_440_000, outcome: 'payment_sent', txRef: 'SQ-2025-BTC-04201', detail: '187 transfers · ₦36.4M' },
  { idx: 15, timestamp: ts(2, 14, 18, 30), actor: 'Squad API',            actorType: 'squad',    action: 'Bulk transfer initiated', employeeId: null,           entity: 'PYC-2025-04',     amount: 36_440_000, outcome: 'info', txRef: 'SQ-2025-BTC-04201', detail: 'POST /payout/initiate-bulk-transfer' },
  { idx: 14, timestamp: ts(2, 10, 14,  9), actor: 'AI Engine',            actorType: 'ai',       action: 'Salary outlier',         employeeId: ghostSample[3].id, entity: ghostSample[3].id, amount: ghostSample[3].salaryAmount, outcome: 'flagged', txRef: null, detail: '4.2× department median' },
  { idx: 13, timestamp: ts(2,  9, 30, 12), actor: 'AI Engine',            actorType: 'ai',       action: 'Pattern match: night logins', employeeId: cleanSample[3].id, entity: cleanSample[3].id, amount: null, outcome: 'info', txRef: null, detail: '24 logins between 01:00–04:00' },

  // -3..-5 days
  { idx: 12, timestamp: ts(3, 14, 55, 39), actor: 'HR Admin · Funmi A.',  actorType: 'hr',       action: 'Flag escalated to ICPC', employeeId: ghostSample[0].id, entity: ghostSample[0].id, amount: ghostSample[0].salaryAmount, outcome: 'escalated', txRef: null, detail: 'Case forwarded — reference IC/2025/0411' },
  { idx: 11, timestamp: ts(3, 12, 12,  4), actor: 'Squad API',            actorType: 'squad',    action: 'Escrow vault created', employeeId: null,             entity: 'PYC-2025-04',     amount: 36_440_000, outcome: 'success', txRef: 'SQ-2025-ESC-04201', detail: 'Virtual account 9012345678' },
  { idx: 10, timestamp: ts(4,  8, 14,  9), actor: 'System',               actorType: 'system',   action: 'Audit export to PDF',  employeeId: null,             entity: 'PYC-2025-04',     amount: null, outcome: 'success', txRef: null, detail: 'Exported by Funmi A.' },
  { idx:  9, timestamp: ts(4, 12, 32,  8), actor: 'Squad API',            actorType: 'squad',    action: 'Transaction verified', employeeId: cleanSample[2].id, entity: cleanSample[2].id, amount: cleanSample[2].salaryAmount, outcome: 'payment_sent', txRef: cleanSample[2].squadDisbursementRef, detail: 'GET /transaction/verify' },
  { idx:  8, timestamp: ts(5, 17, 11, 32), actor: 'HR Admin · Funmi A.',  actorType: 'hr',       action: 'Payment blocked',     employeeId: ghostSample[1].id, entity: ghostSample[1].id, amount: ghostSample[1].salaryAmount, outcome: 'blocked', txRef: null, detail: 'Manual review confirmed fraud pattern A' },
  { idx:  7, timestamp: ts(5,  9, 20, 14), actor: 'AI Engine',            actorType: 'ai',       action: 'Risk score updated',  employeeId: ghostSample[2].id, entity: ghostSample[2].id, amount: null, outcome: 'info', txRef: null, detail: 'Risk 71 → 74 after attendance gap update' },

  // -6..-14 days
  { idx:  6, timestamp: ts(7, 11,  4,  0), actor: 'Squad API',            actorType: 'squad',    action: 'Bulk transfer settled', employeeId: null,           entity: 'PYC-2025-03',     amount: 36_120_000, outcome: 'payment_sent', txRef: 'SQ-2025-BTC-03844', detail: '184 transfers' },
  { idx:  5, timestamp: ts(8, 15, 22, 31), actor: 'Employee',             actorType: 'employee', action: 'Liveness verified',  employeeId: cleanSample[4].id, entity: cleanSample[4].id, amount: cleanSample[4].salaryAmount, outcome: 'verified', txRef: 'SQ-2025-VRF-03988', detail: 'Liveness 0.96' },
  { idx:  4, timestamp: ts(9,  8,  2, 11), actor: 'AI Engine',            actorType: 'ai',       action: 'Anomaly scan complete', employeeId: null,           entity: 'PYC-2025-03',     amount: null, outcome: 'success', txRef: null, detail: '196 records · 12 flagged · 8.1s' },
  { idx:  3, timestamp: ts(11, 13, 18, 47), actor: 'HR Admin · Funmi A.', actorType: 'hr',       action: 'Uploaded payroll CSV', employeeId: null,            entity: 'PYC-2025-03',     amount: null, outcome: 'success', txRef: null, detail: 'kogi_march_2025.csv · 196 rows' },
  { idx:  2, timestamp: ts(12,  9, 30,  0), actor: 'System',              actorType: 'system',   action: 'Chain block sealed',  employeeId: null,             entity: 'BLK-0000048',       amount: null, outcome: 'success', txRef: null, detail: 'Hash 0x8a3f…c411' },
  { idx:  1, timestamp: ts(14, 10,  0,  0), actor: 'System',              actorType: 'system',   action: 'Audit retention rotated', employeeId: null,         entity: '—',                 amount: null, outcome: 'info', txRef: null, detail: 'Records >90d archived' },
];

/** Chain head hash — purely visual, regenerates on reload */
export const CHAIN_HEAD = '0x' + Math.random().toString(16).slice(2, 10) + '…' + Math.random().toString(16).slice(2, 6);

/** All distinct actors / outcomes for filter dropdowns */
export const AUDIT_ACTORS   = ['HR Admin', 'AI Engine', 'System', 'Squad API', 'Employee'];
export const AUDIT_OUTCOMES = ['verified', 'flagged', 'blocked', 'payment_sent', 'escalated', 'failed', 'success', 'info'];
