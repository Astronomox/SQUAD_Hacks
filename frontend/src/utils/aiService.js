const AI_BASE = import.meta.env.VITE_AI_URL || 'https://verifyaibe.onrender.com';
const TIMEOUT_MS = 55000;

function withTimeout(promise, ms = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Backend is waking up — please retry in 10 seconds')), ms)
    ),
  ]);
}

async function post(endpoint, body) {
  const res = await withTimeout(fetch(`${AI_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function get(endpoint) {
  const res = await withTimeout(fetch(`${AI_BASE}${endpoint}`));
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const checkHealth             = ()           => get('/health');
export const scanPayroll             = (employees)  => post('/analyze', { employees });
export const verifyLiveness          = (data)       => post('/verify-liveness', data);
export const createEscrow            = (cycleId, totalAmount, verifiedCount) =>
  post('/squad/create-escrow', { cycleId, totalAmount, verifiedCount });
export const disburseSalary          = (data)       => post('/squad/disburse', data);
export const verifyTransaction       = (txnRef)     => get(`/squad/verify/${txnRef}`);
export const getSquadBalance         = ()           => get('/squad/balance');
export const getSquadTransactions    = ()           => get('/squad/transactions');
export const getSquadVirtualAccounts = ()           => get('/squad/virtual-accounts');
export const simulatePayment         = (virtual_account_number, amount) =>
  post('/squad/simulate-payment', { virtual_account_number, amount });
export const createEmployeeVA        = (data)       => post('/squad/create-employee-va', data);
export const getEmployeeHistory      = (employeeId) => get(`/squad/employee-history/${employeeId}`);
// Employee management
export const addEmployee             = (data)       => post('/employees/add', data);
export const batchAddEmployees       = (data)       => post('/employees/batch', data);
export const listEmployees           = ()           => get('/employees/list');
export const verifyNIN               = (nin, employeeId) => post('/employees/verify-nin', { nin, employeeId });
export const notifyEmployee          = (data)       => post('/employees/notify', data);
