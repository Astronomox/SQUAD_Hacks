import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ACTOR_STYLES = {
  ai:       'bg-purple-100 text-purple-700',
  system:   'bg-blue-100 text-blue-700',
  hr:       'bg-[#FFF1EC] text-[#E8501A]',
  squad:    'bg-[#DCFCE7] text-[#16A34A]',
  employee: 'bg-gray-100 text-gray-600',
};
const ACTOR_LABELS = {
  ai: 'AI Engine', system: 'System', hr: 'HR Admin', squad: 'Squad API', employee: 'Employee',
};
const OUTCOME_STYLES = {
  verified:     'bg-[#DCFCE7] text-[#16A34A]',
  payment_sent: 'bg-[#DCFCE7] text-[#16A34A]',
  success:      'bg-[#DCFCE7] text-[#16A34A]',
  flagged:      'bg-[#FEF9C3] text-[#D97706]',
  escalated:    'bg-[#FEF9C3] text-[#D97706]',
  blocked:      'bg-[#FEE2E2] text-[#DC2626]',
  failed:       'bg-[#FEE2E2] text-[#DC2626]',
  info:         'bg-blue-50 text-blue-600',
};
const OUTCOME_LABELS = {
  verified: 'VERIFIED', payment_sent: 'PAYMENT SENT', success: 'SUCCESS',
  flagged: 'FLAGGED', escalated: 'ESCALATED', blocked: 'BLOCKED', failed: 'FAILED', info: 'INFO',
};

const PAGE_SIZE = 20;

function fmt(n) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString('en-NG', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch { return iso; }
}

export default function AuditTable({ rows = [] }) {
  const [page, setPage] = useState(1);
  const sorted   = [...rows].sort((a, b) => b.idx - a.idx);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged    = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when rows change (filter applied)
  React.useEffect(() => setPage(1), [rows.length]);

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E4E0] bg-[#F4F4F2]">
              {['#', 'Timestamp', 'Actor', 'Action', 'Entity / Employee', 'Amount', 'Outcome', 'Tx Reference'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#737373] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.idx} className="border-b border-[#F4F4F2] hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-xs text-[#B0B0B0] font-mono">{String(row.idx).padStart(3, '0')}</td>
                <td className="px-4 py-3 text-xs text-[#737373] font-mono whitespace-nowrap">{fmtTime(row.timestamp)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${ACTOR_STYLES[row.actorType] || 'bg-gray-100 text-gray-600'}`}>
                    {ACTOR_LABELS[row.actorType] || row.actor}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#4A4A4A]">{row.action}</td>
                <td className="px-4 py-3">
                  {row.employeeId
                    ? <><p className="text-xs text-[#111111] font-mono">{row.employeeId}</p>{row.detail && <p className="text-[10px] text-[#B0B0B0] truncate max-w-[140px]">{row.detail}</p>}</>
                    : <p className="text-xs text-[#737373]">{row.entity || '—'}</p>
                  }
                </td>
                <td className="px-4 py-3 text-xs text-[#4A4A4A] whitespace-nowrap">{fmt(row.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${OUTCOME_STYLES[row.outcome] || 'bg-gray-100 text-gray-600'}`}>
                    {OUTCOME_LABELS[row.outcome] || row.outcome?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.txRef
                    ? <span className="text-[10px] font-mono text-[#E8501A]">{row.txRef}</span>
                    : <span className="text-[#B0B0B0] text-xs">—</span>
                  }
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#B0B0B0] text-sm">No matching audit records</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E4E0] bg-[#FAFAFA]">
          <p className="text-xs text-[#737373]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-7 h-7 rounded border border-[#E4E4E0] text-[#737373] hover:bg-[#F4F4F2] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded border text-xs font-medium transition-colors ${
                    p === page ? 'bg-[#E8501A] border-[#E8501A] text-white' : 'border-[#E4E4E0] text-[#737373] hover:bg-[#F4F4F2]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-7 h-7 rounded border border-[#E4E4E0] text-[#737373] hover:bg-[#F4F4F2] disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
