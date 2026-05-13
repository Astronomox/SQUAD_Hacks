// Mock Squad API client - mirrors the shape of real Squad responses so the
// frontend can be wired to the live SDK by swapping this file for the real one.
// See: https://squadinc.gitbook.io/squad-api-documentation

const BASE = 'https://sandbox-api-d.squadco.com';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Generate a Squad-style reference */
function makeRef(prefix) {
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${new Date().getFullYear()}-${rand}`;
}

/** Create a virtual account that holds payroll funds in escrow until verification clears */
export async function createEscrow(cycleId, amount) {
  await delay(900);
  return {
    status: 200,
    message: 'Successful',
    data: {
      virtual_account_number: '90' + Math.floor(Math.random() * 1e8).toString().padStart(8, '0'),
      customer_identifier:    `payroll_${cycleId}`,
      display_name:           `VerifyAI Escrow - ${cycleId}`,
      amount,
      reference:              makeRef('SQ-ESC'),
      bank:                   'Squad MFB',
      base_url:               BASE,
      created_at:             new Date().toISOString(),
    },
  };
}

/** Initiate a single salary disbursement for a verified employee */
export async function disburseSalary(employeeId, amount, bankAccount, bankCode) {
  await delay(500);
  return {
    status: 200,
    message: 'Transfer Successful',
    data: {
      transaction_ref:  makeRef('SQ-TXN'),
      amount,
      recipient:        employeeId,
      bank_account:     bankAccount,
      bank_code:        bankCode,
      status:           'success',
      narration:        `Salary - ${employeeId} - VerifyAI Verified`,
      transaction_date: new Date().toISOString(),
    },
  };
}

/** Initiate bulk transfer for all verified employees in a cycle */
export async function disburseBulk(verifiedEmployees) {
  await delay(1200);
  const transfers = verifiedEmployees.map((emp) => ({
    transaction_ref: makeRef('SQ-TXN'),
    amount: emp.salaryAmount,
    recipient: emp.id,
    status: 'success',
  }));
  return {
    status: 200,
    message: 'Bulk Transfer Initiated',
    data: {
      batch_ref: makeRef('SQ-BTC'),
      transfer_count: transfers.length,
      total_amount: transfers.reduce((s, t) => s + t.amount, 0),
      transfers,
      initiated_at: new Date().toISOString(),
    },
  };
}

/** Verify a transaction by reference (for audit trail confirmation) */
export async function verifyTransaction(reference) {
  await delay(350);
  return {
    status: 200,
    message: 'Successful',
    data: {
      transaction_ref:  reference,
      status:           'success',
      transaction_date: new Date().toISOString(),
    },
  };
}

/** Group all helpers as a single default export, mirroring `squad.service.js` on the backend */
export const squad = {
  createEscrow,
  disburseSalary,
  disburseBulk,
  verifyTransaction,
};

export default squad;
