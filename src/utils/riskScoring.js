// Risk scoring engine — mirrors the Python Isolation Forest features
// used in the production AI service (ai_service/main.py).
//
// Each detector returns 0 if no anomaly, or a positive integer of "risk points".
// Total risk = sum of detector contributions, capped at 100.

import { daysSince } from './formatters.js';

/** Returns { score: 0-100, flags: [{ type, title, detail, points }] } for an employee in a dataset. */
export function scoreEmployee(employee, dataset = []) {
  const flags = [];

  // ---- Bulk enrollment detector --------------------------------------------
  if (employee.enrollmentBatchId) {
    const batchSize = dataset.filter(e => e.enrollmentBatchId === employee.enrollmentBatchId).length;
    if (batchSize >= 20) {
      const hour = employee.enrollmentDate ? new Date(employee.enrollmentDate).getHours() : 12;
      const offHours = hour < 6 || hour > 22;
      const points = offHours ? 40 : 25;
      flags.push({
        type: 'bulk_enrollment',
        title: offHours
          ? `Bulk enrollment in batch of ${batchSize} (off-hours)`
          : `Bulk enrollment batch of ${batchSize}`,
        detail: offHours
          ? `Enrolled at ${String(hour).padStart(2, '0')}:00 alongside ${batchSize - 1} others in batch ${employee.enrollmentBatchId}.`
          : `Enrolled in batch ${employee.enrollmentBatchId} containing ${batchSize} records.`,
        points,
        evidence: { batchId: employee.enrollmentBatchId, batchSize, hour },
      });
    }
  }

  // ---- Shared IP detector --------------------------------------------------
  if (employee.ipAtEnrollment) {
    const sharing = dataset.filter(e =>
      e.ipAtEnrollment === employee.ipAtEnrollment && e.id !== employee.id
    );
    if (sharing.length >= 3) {
      const points = Math.min(40, sharing.length * 6);
      flags.push({
        type: 'duplicate_ip',
        title: `Shared IP with ${sharing.length} employee${sharing.length === 1 ? '' : 's'}`,
        detail: `IP ${employee.ipAtEnrollment} is associated with ${sharing.length + 1} different employees.`,
        points,
        evidence: { ip: employee.ipAtEnrollment, others: sharing.map(s => s.id) },
      });
    }
  }

  // ---- Shared device fingerprint -------------------------------------------
  if (employee.deviceFingerprint) {
    const sharing = dataset.filter(e =>
      e.deviceFingerprint === employee.deviceFingerprint && e.id !== employee.id
    );
    if (sharing.length >= 2) {
      const points = Math.min(35, sharing.length * 8);
      flags.push({
        type: 'device_reuse',
        title: `Same device used by ${sharing.length} other employee${sharing.length === 1 ? '' : 's'}`,
        detail: `Device fingerprint ${employee.deviceFingerprint} ties this record to ${sharing.length} others.`,
        points,
        evidence: { fingerprint: employee.deviceFingerprint, others: sharing.map(s => s.id) },
      });
    }
  }

  // ---- Attendance gap ------------------------------------------------------
  const gap = daysSince(employee.lastAttendance);
  if (gap == null || gap >= 90) {
    const points = gap == null ? 22 : Math.min(20, Math.floor(gap / 10));
    flags.push({
      type: 'attendance_gap',
      title: gap == null ? 'No attendance records on file' : `No attendance in ${gap} days`,
      detail: gap == null
        ? 'No attendance has ever been logged for this employee.'
        : `Last clock-in recorded on ${employee.lastAttendance}.`,
      points,
      evidence: { lastAttendance: employee.lastAttendance, daysSince: gap },
    });
  } else if (gap >= 30) {
    flags.push({
      type: 'attendance_gap',
      title: `No attendance in ${gap} days`,
      detail: `Last clock-in: ${employee.lastAttendance}.`,
      points: 8,
      evidence: { lastAttendance: employee.lastAttendance, daysSince: gap },
    });
  }

  // ---- Salary outlier ------------------------------------------------------
  if (employee.salaryAmount != null) {
    const peers = dataset.filter(e => e.department === employee.department);
    if (peers.length >= 5) {
      const sorted = peers.map(p => p.salaryAmount).sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const ratio = employee.salaryAmount / median;
      if (ratio >= 4) {
        flags.push({
          type: 'salary_outlier',
          title: `Salary ${ratio.toFixed(1)}× department median`,
          detail: `Median salary in ${employee.department} is ${median.toLocaleString()}, but this record is ${employee.salaryAmount.toLocaleString()}.`,
          points: Math.min(25, Math.floor((ratio - 3) * 8)),
          evidence: { median, ratio },
        });
      } else if (ratio >= 2.5) {
        flags.push({
          type: 'salary_outlier',
          title: `Salary ${ratio.toFixed(1)}× department median`,
          detail: `Median salary in ${employee.department} is ${median.toLocaleString()}.`,
          points: 9,
          evidence: { median, ratio },
        });
      }
    }
  }

  // ---- Account / pattern reuse --------------------------------------------
  if (employee.bankAccount) {
    const matches = dataset.filter(e =>
      e.bankAccount && e.id !== employee.id &&
      e.bankAccount.slice(-6) === employee.bankAccount.slice(-6)
    );
    if (matches.length > 0) {
      flags.push({
        type: 'account_reuse',
        title: 'Bank account near-match',
        detail: `Last 6 digits match ${matches.length} other employee${matches.length === 1 ? '' : 's'}.`,
        points: 18,
        evidence: { matches: matches.map(m => m.id) },
      });
    }
  }

  const total = Math.min(100, flags.reduce((sum, f) => sum + f.points, 0));
  return { score: total, flags };
}

/** Quick severity bucket for a raw score */
export function riskSeverity(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/** Convert numeric score → tailwind colour token */
export function riskTone(score) {
  if (score >= 70) return 'bad';
  if (score >= 50) return 'warn';
  if (score >= 25) return 'info';
  return 'ok';
}

/** Inverse: trust score from risk score */
export function trustFromRisk(risk) {
  return Math.max(0, 100 - risk);
}
