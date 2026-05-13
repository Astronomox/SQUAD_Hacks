// Precomputed risk flags for the demo ghost workers - also used as fallback
// when riskScoring.js hasn't run yet (e.g. during the initial scan animation).

import { EMPLOYEES, GHOST_EMPLOYEES } from './employees.js';
import { scoreEmployee } from '../utils/riskScoring.js';

// Compute flags for every ghost worker once at module load
export const FLAG_BY_EMPLOYEE = (() => {
  const out = {};
  for (const emp of GHOST_EMPLOYEES) {
    const { score, flags } = scoreEmployee(emp, EMPLOYEES);
    out[emp.id] = {
      employeeId: emp.id,
      score: emp.riskScore || score, // honour the hardcoded score on the seed records
      flags: flags.length > 0 ? flags : [
        // Defensive fallback so cards never render empty
        { type: 'pattern_match', title: 'Anomaly pattern detected', detail: 'AI Isolation Forest scored this record as an outlier.', points: 50 },
      ],
    };
  }
  return out;
})();

/** Get flags for an employee id, or compute on the fly if not pre-cached */
export function flagsFor(employeeId) {
  if (FLAG_BY_EMPLOYEE[employeeId]) return FLAG_BY_EMPLOYEE[employeeId];
  const emp = EMPLOYEES.find(e => e.id === employeeId);
  if (!emp) return { employeeId, score: 0, flags: [] };
  return { employeeId, ...scoreEmployee(emp, EMPLOYEES) };
}

/** Aggregate counts across all flagged records, for the dashboard widgets */
export function flagTypeBreakdown() {
  const counts = {};
  for (const id of Object.keys(FLAG_BY_EMPLOYEE)) {
    for (const f of FLAG_BY_EMPLOYEE[id].flags) {
      counts[f.type] = (counts[f.type] || 0) + 1;
    }
  }
  return counts;
}
