// Recent payroll cycles for the dashboard table.
import { EMPLOYEES, VERIFIED_EMPLOYEES, FLAGGED_EMPLOYEES, BLOCKED_EMPLOYEES } from './employees.js';

const totalAmount = EMPLOYEES.reduce((s, e) => s + e.salaryAmount, 0);

export const PAYROLL_CYCLES = [
  {
    id: 'PYC-2025-05',
    name: 'May 2025 Payroll',
    period: 'May 2025',
    date: '2025-05-12',
    totalEmployees: EMPLOYEES.length,
    verified: VERIFIED_EMPLOYEES.length,
    flagged:  FLAGGED_EMPLOYEES.length,
    blocked:  BLOCKED_EMPLOYEES.length,
    amount:   totalAmount,
    status:   'In Progress',
    squadEscrowRef: 'SQ-2025-ESC-04712',
  },
  {
    id: 'PYC-2025-04',
    name: 'April 2025 Payroll',
    period: 'April 2025',
    date: '2025-04-12',
    totalEmployees: 198,
    verified: 187,
    flagged:  9,
    blocked:  2,
    amount: 36_440_000,
    status: 'Complete',
    squadEscrowRef: 'SQ-2025-ESC-04201',
  },
  {
    id: 'PYC-2025-03',
    name: 'March 2025 Payroll',
    period: 'March 2025',
    date: '2025-03-12',
    totalEmployees: 196,
    verified: 184,
    flagged: 10,
    blocked:  2,
    amount: 36_120_000,
    status: 'Complete',
    squadEscrowRef: 'SQ-2025-ESC-03844',
  },
  {
    id: 'PYC-2025-02',
    name: 'February 2025 Payroll',
    period: 'February 2025',
    date: '2025-02-12',
    totalEmployees: 195,
    verified: 178,
    flagged: 14,
    blocked:  3,
    amount: 35_890_000,
    status: 'Complete',
    squadEscrowRef: 'SQ-2025-ESC-03102',
  },
  {
    id: 'PYC-2025-01',
    name: 'January 2025 Payroll',
    period: 'January 2025',
    date: '2025-01-12',
    totalEmployees: 192,
    verified: 174,
    flagged: 14,
    blocked:  4,
    amount: 35_410_000,
    status: 'Complete',
    squadEscrowRef: 'SQ-2025-ESC-02544',
  },
];

export const CURRENT_CYCLE = PAYROLL_CYCLES[0];

/** Total leakage prevented across all cycles (sum of blocked amounts) */
export const TOTAL_LEAKAGE_PREVENTED = 4_215_000;
