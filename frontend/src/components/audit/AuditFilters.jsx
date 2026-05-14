import React from 'react';
import { Search, Download, X } from 'lucide-react';

export default function AuditFilters({ auditLog }) {
  const { query, setQuery, actor, setActor, outcome, setOutcome, from, setFrom, to, setTo, clear } = auditLog;

  return (
    <div className="bg-white rounded-xl shadow-card p-4 flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:flex-1 sm:min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B0B0]" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search employee, ID, action, Squad ref…"
          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A]"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto flex-wrap">
        <select value={actor} onChange={e => setActor(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A] bg-white text-[#4A4A4A]">
          <option value="all">All actors</option>
          <option value="hr">HR Admin</option>
          <option value="ai">AI Engine</option>
          <option value="system">System</option>
          <option value="squad">Squad API</option>
          <option value="employee">Employee</option>
        </select>

        <select value={outcome} onChange={e => setOutcome(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A] bg-white text-[#4A4A4A]">
          <option value="all">All outcomes</option>
          <option value="verified">Verified</option>
          <option value="flagged">Flagged</option>
          <option value="blocked">Blocked</option>
          <option value="payment_sent">Payment Sent</option>
          <option value="escalated">Escalated</option>
          <option value="success">Success</option>
          <option value="info">Info</option>
        </select>

        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A] bg-white text-[#4A4A4A]"
          title="From date" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A] bg-white text-[#4A4A4A]"
          title="To date" />
        {(query || actor !== 'all' || outcome !== 'all' || from || to) && (
          <button onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] text-[#737373] hover:text-[#111111] transition-colors">
            <X size={13} /> Clear
          </button>
        )}

        <button onClick={() => window.print()} className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </div>
  );
}
