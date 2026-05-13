import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { departmentStats } from '../../data/employees.js';

const COLORS = {
  verified: '#16A34A',
  flagged:  '#D97706',
  blocked:  '#DC2626',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-ink-200 rounded-lg shadow-elevated p-3 min-w-[160px]">
      <div className="font-display font-semibold text-[13px] text-ink-900 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] py-0.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
          <span className="capitalize text-ink-700 flex-1">{p.dataKey}</span>
          <span className="font-mono font-semibold tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DepartmentChart() {
  const data = departmentStats();
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap={28}>
          <CartesianGrid stroke="#F1F1F1" vertical={false} />
          <XAxis dataKey="department" tickLine={false} axisLine={{ stroke: '#E4E4E0' }} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232,80,26,.05)' }} />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(v) => <span className="capitalize text-ink-700">{v}</span>}
          />
          <Bar dataKey="verified" fill={COLORS.verified} radius={[3, 3, 0, 0]} />
          <Bar dataKey="flagged"  fill={COLORS.flagged}  radius={[3, 3, 0, 0]} />
          <Bar dataKey="blocked"  fill={COLORS.blocked}  radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
