import React from 'react';
import { AlertTriangle, Clock, Users, TrendingUp } from 'lucide-react';

const FLAG_ICONS = {
  duplicate_ip:     Users,
  bulk_enrollment:  Users,
  attendance_gap:   Clock,
  salary_anomaly:   TrendingUp,
  default:          AlertTriangle,
};

const FLAG_COLORS = {
  high:   { border: 'border-[#DC2626]', bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', badge: 'bg-[#DC2626]' },
  medium: { border: 'border-[#D97706]', bg: 'bg-[#FEF9C3]', text: 'text-[#D97706]', badge: 'bg-[#D97706]' },
};

export default function FlagCard({ flag }) {
  const severity = flag.riskContribution >= 30 ? 'high' : 'medium';
  const colors = FLAG_COLORS[severity];
  const Icon = FLAG_ICONS[flag.type] || FLAG_ICONS.default;

  return (
    <div className={`rounded-xl border-l-4 ${colors.border} ${colors.bg} p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.text} shrink-0`} />
          <p className={`text-sm font-medium ${colors.text}`}>{flag.title}</p>
        </div>
        <span className={`${colors.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0`}>
          +{flag.riskContribution} pts
        </span>
      </div>
      <p className="text-xs text-[#4A4A4A]">{flag.detail}</p>
      {flag.evidence && (
        <p className="text-[10px] text-[#737373] font-mono bg-white/60 rounded px-2 py-1">{flag.evidence}</p>
      )}
    </div>
  );
}
