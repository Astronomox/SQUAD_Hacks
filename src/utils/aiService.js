const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

async function post(endpoint, body) {
  const res = await fetch(`${AI_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI Service ${endpoint} failed: ${res.status}`);
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`${AI_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`AI Service ${endpoint} failed: ${res.status}`);
  return res.json();
}

export const checkHealth          = ()           => get('/health');
export const scanPayroll          = (employees)  => post('/analyze', { employees });
export const verifyLiveness       = (data)       => post('/verify-liveness', data);
export const createEscrow         = (cycleId, totalAmount, verifiedCount) =>
  post('/squad/create-escrow', { cycleId, totalAmount, verifiedCount });
export const disburseSalary       = (data)       => post('/squad/disburse', data);
export const verifyTransaction    = (txnRef)     => get(`/squad/verify/${txnRef}`);
export const getSquadBalance      = ()           => get('/squad/balance');
export const getSquadTransactions = ()           => get('/squad/transactions');
export const getSquadVirtualAccounts = ()        => get('/squad/virtual-accounts');
export const simulatePayment      = (virtual_account_number, amount) =>
  post('/squad/simulate-payment', { virtual_account_number, amount });
export const fetchEmployees       = ()           => get('/employees');
export const fetchEmployee        = (id)         => get(`/employees/${id}`);
