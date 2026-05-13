import React, { useState } from 'react';
import { Search, Download } from 'lucide-react';

export default function AuditFilters() {
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('All');
  const [outcome, setOutcome] = useState('All');

  return (
    <div className="bg-white rounded-xl shadow-card p-4 flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:flex-1 sm:min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B0B0]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employee, ID, action..."
          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A]"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto">
        <select
          value={actor}
          onChange={e => setActor(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A] bg-white text-[#4A4A4A]"
        >
          {['All', 'HR Admin', 'AI Engine', 'System', 'Squad API'].map(a => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <select
          value={outcome}
          onChange={e => setOutcome(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A] bg-white text-[#4A4A4A]"
        >
          {['All', 'Verified', 'Flagged', 'Blocked', 'Payment Sent', 'Escalated'].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <button className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </div>
  );
}
