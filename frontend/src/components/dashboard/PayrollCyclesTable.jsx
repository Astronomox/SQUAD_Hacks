import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatNaira, formatDate, formatNumber } from '../../utils/formatters.js';
import { PAYROLL_CYCLES } from '../../data/payrollCycles.js';

export default function PayrollCyclesTable({ scanResult }) {
  const nav = useNavigate();

  // Enrich the current cycle with real AI scan data if available
  const cycles = PAYROLL_CYCLES.map((c, i) => {
    if (i === 0 && scanResult) {
      const verified = scanResult.results.filter(r => r.status === 'verified').length;
      const flagged  = scanResult.results.filter(r => r.status === 'flagged').length;
      const blocked  = scanResult.results.filter(r => r.status === 'blocked').length;
      return { ...c, totalEmployees: scanResult.total, verified, flagged, blocked };
    }
    return c;
  });

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-ink-500 border-b border-ink-200">
            <th className="font-semibold pb-3 pr-4">Cycle</th>
            <th className="font-semibold pb-3 pr-4">Period</th>
            <th className="font-semibold pb-3 pr-4 text-right">Employees</th>
            <th className="font-semibold pb-3 pr-4 text-right">Verified</th>
            <th className="font-semibold pb-3 pr-4 text-right">Flagged</th>
            <th className="font-semibold pb-3 pr-4 text-right">Amount</th>
            <th className="font-semibold pb-3 pr-4">Status</th>
            <th className="font-semibold pb-3 pr-0 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {cycles.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => i === 0 && nav('/payroll')}
              className="border-b border-ink-200 last:border-0 hover:bg-ink-100/60 cursor-pointer transition-colors"
            >
              <td className="py-3.5 pr-4">
                <div className="font-medium text-ink-900">{c.name}</div>
                <div className="font-mono text-[11.5px] text-ink-500 mt-0.5">{c.id}</div>
              </td>
              <td className="py-3.5 pr-4 text-ink-700">{formatDate(c.date)}</td>
              <td className="py-3.5 pr-4 text-right tabular-nums">{formatNumber(c.totalEmployees)}</td>
              <td className="py-3.5 pr-4 text-right tabular-nums text-ok font-medium">{formatNumber(c.verified)}</td>
              <td className="py-3.5 pr-4 text-right tabular-nums text-warn font-medium">{formatNumber(c.flagged)}</td>
              <td className="py-3.5 pr-4 text-right tabular-nums font-medium">{formatNaira(c.amount)}</td>
              <td className="py-3.5 pr-4"><StatusBadge status={c.status} /></td>
              <td className="py-3.5 text-ink-500"><ChevronRight size={16} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
