import React from 'react';
import { Users, ShieldCheck, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import StatCard from '../ui/StatCard.jsx';
import { formatNumber, formatNairaShort } from '../../utils/formatters.js';

export default function StatsBar({ stats }) {
  if (!stats) return null;
  const items = [
    { label: 'Total Employees',    value: formatNumber(stats?.totalEmployees ?? 0), icon: <Users size={16}/>,        sub: <><TrendingUp size={11} className="text-ok"/> +12 since last cycle</> },
    { label: 'Verified',           value: formatNumber(stats?.verified ?? 0),       icon: <ShieldCheck size={16}/>,  sub: <span className="text-ok">{stats?.totalEmployees ? Math.round((stats.verified / stats.totalEmployees) * 100) : 0}% pass rate</span> },
    { label: 'Flagged',            value: formatNumber(stats?.flagged ?? 0),        icon: <AlertTriangle size={16}/>,sub: <span className="text-warn">Pending review</span> },
    { label: 'Blocked',            value: formatNumber(stats?.blocked ?? 0),        icon: <XCircle size={16}/>,      sub: <span className="text-bad">High-risk holds</span> },
    { label: 'Leakage Prevented',  value: formatNairaShort(stats?.leakage ?? 0),    accent: true,                    hint: 'This cycle · vs Apr: ₦3.1M' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((it, i) => (
        <StatCard key={it.label} {...it} index={i} />
      ))}
    </div>
  );
}
