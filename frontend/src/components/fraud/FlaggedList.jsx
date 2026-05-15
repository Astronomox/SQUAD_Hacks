import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const TABS = ['All', 'High Risk', 'Review', 'Blocked'];

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function riskBadge(score) {
  if (score >= 70) return 'bg-red-50 text-red-600 border border-red-100';
  if (score >= 40) return 'bg-amber-50 text-amber-600 border border-amber-100';
  return 'bg-green-50 text-green-600 border border-green-100';
}

function riskLabel(score) {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Review';
  return 'Low';
}

function avatarColor(score) {
  if (score >= 70) return 'bg-red-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-green-500';
}

function riskBar(score) {
  if (score >= 70) return 'bg-red-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-green-500';
}

export default function FlaggedList({ employees, selected, onSelect, mobile }) {
  const [tab,    setTab]    = useState('All');
  const [search, setSearch] = useState('');

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = (e.fullName || '').toLowerCase().includes(q) ||
                        (e.id || '').toLowerCase().includes(q);
    if (tab === 'High Risk') return matchSearch && e.riskScore >= 70;
    if (tab === 'Review')    return matchSearch && e.riskScore >= 40 && e.riskScore < 70;
    if (tab === 'Blocked')   return matchSearch && e.status === 'blocked';
    return matchSearch;
  });

  return (
    // On mobile: full width, no fixed height — parent scrolls
    // On desktop: w-80, flex-col, overflow-hidden (parent controls height)
    <div className={`bg-white flex flex-col ${mobile ? 'w-full' : 'w-full h-full overflow-hidden'}`}>

      {/* Search + filters */}
      <div className="p-3 border-b border-[#E4E4E0] space-y-2 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B0B0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or ID…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#E4E4E0] bg-[#F9F9F8] focus:outline-none focus:border-[#E8501A] focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                tab === t
                  ? 'bg-[#E8501A] text-white shadow-sm'
                  : 'text-[#737373] hover:bg-[#F4F4F2]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-3 py-2 bg-[#F9F9F8] border-b border-[#E4E4E0]">
        <p className="text-[10px] text-[#B0B0B0] font-medium uppercase tracking-wide">
          {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* List — on desktop this scrolls inside the fixed pane */}
      {/* On mobile this is normal flow so the page scrolls */}
      <div className={mobile ? '' : 'overflow-y-auto flex-1'}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#B0B0B0]">
            <SlidersHorizontal size={24} className="text-[#E4E4E0]" />
            <p className="text-xs">No employees match this filter</p>
          </div>
        ) : (
          filtered.map(emp => (
            <button
              key={emp.id}
              onClick={() => onSelect(emp)}
              className={`w-full text-left px-3 py-3.5 border-b border-[#F4F4F2] flex items-center gap-3 transition-colors active:bg-[#FFF1EC] ${
                selected?.id === emp.id
                  ? 'bg-[#FFF1EC] border-l-[3px] border-l-[#E8501A]'
                  : 'hover:bg-[#FFF8F6] border-l-[3px] border-l-transparent'
              }`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ${avatarColor(emp.riskScore)} flex items-center justify-center shrink-0 shadow-sm`}>
                <span className="text-white text-xs font-bold">{initials(emp.fullName)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-[#111111] truncate">{emp.fullName}</p>
                </div>
                <p className="text-[10px] text-[#B0B0B0] font-mono mt-0.5">{emp.id}</p>
                <p className="text-[10px] text-[#737373] truncate mt-0.5">{emp.department}</p>
                {/* Mini risk bar */}
                <div className="h-1 bg-[#F4F4F2] rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${riskBar(emp.riskScore)} transition-all`}
                    style={{ width: `${emp.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Risk badge */}
              <div className="shrink-0 text-right">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskBadge(emp.riskScore)}`}>
                  {emp.riskScore}
                </div>
                <p className={`text-[9px] mt-1 font-medium ${
                  emp.riskScore >= 70 ? 'text-red-500' :
                  emp.riskScore >= 40 ? 'text-amber-500' : 'text-green-500'
                }`}>{riskLabel(emp.riskScore)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
