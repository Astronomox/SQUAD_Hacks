import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TABS = ['All', 'High Risk', 'Review', 'Blocked'];

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function riskColor(score) {
  if (score >= 70) return 'bg-[#FEE2E2] text-[#DC2626]';
  if (score >= 40) return 'bg-[#FEF9C3] text-[#D97706]';
  return 'bg-[#DCFCE7] text-[#16A34A]';
}

function avatarColor(score) {
  if (score >= 70) return 'bg-[#DC2626]';
  if (score >= 40) return 'bg-[#D97706]';
  return 'bg-[#16A34A]';
}

export default function FlaggedList({ employees, selected, onSelect }) {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = employees.filter(e => {
    const matchSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    if (tab === 'High Risk') return matchSearch && e.riskScore >= 70;
    if (tab === 'Review')    return matchSearch && e.riskScore >= 40 && e.riskScore < 70;
    if (tab === 'Blocked')   return matchSearch && e.status === 'blocked';
    return matchSearch;
  });

  return (
    <div className="w-80 shrink-0 border-r border-[#E4E4E0] bg-white flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[#E4E4E0] space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B0B0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or ID..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#E4E4E0] focus:outline-none focus:border-[#E8501A]"
          />
        </div>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
                tab === t ? 'bg-[#E8501A] text-white' : 'text-[#737373] hover:bg-[#F4F4F2]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {filtered.map(emp => (
          <button
            key={emp.id}
            onClick={() => onSelect(emp)}
            className={`w-full text-left px-3 py-3 border-b border-[#F4F4F2] flex items-center gap-3 hover:bg-[#FFF1EC] transition-colors ${
              selected?.id === emp.id ? 'bg-[#FFF1EC] border-l-2 border-l-[#E8501A]' : ''
            }`}
          >
            <div className={`w-9 h-9 rounded-full ${avatarColor(emp.riskScore)} flex items-center justify-center shrink-0`}>
              <span className="text-white text-xs font-bold">{initials(emp.fullName)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#111111] truncate">{emp.fullName}</p>
              <p className="text-[10px] text-[#B0B0B0] font-mono">{emp.id}</p>
              <p className="text-[10px] text-[#737373] truncate">{emp.department}</p>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${riskColor(emp.riskScore)}`}>
              {emp.riskScore}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
