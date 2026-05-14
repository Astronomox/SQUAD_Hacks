import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { EMPLOYEES, DEPARTMENTS, departmentStats } from '../../data/employees.js';

const COLORS = { verified: '#16A34A', flagged: '#D97706', blocked: '#DC2626' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-ink-200 rounded-lg shadow-elevated p-3 min-w-[160px]">
      <div className="font-display font-semibold text-[13px] text-ink-900 mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[12px] py-0.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
          <span className="capitalize text-ink-700 flex-1">{p.dataKey}</span>
          <span className="font-mono font-semibold tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DepartmentChart({ scanResult }) {
  const [data, setData] = useState(() => departmentStats());
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!scanResult?.results) return;

    const byDept = {};
    DEPARTMENTS.forEach(d => {
      byDept[d.short] = { dept: d.short, verified: 0, flagged: 0, blocked: 0 };
    });

    scanResult.results.forEach(r => {
      const emp = EMPLOYEES.find(e => e.id === r.id);
      if (!emp) return;
      const deptShort = DEPARTMENTS.find(d => d.name === emp.department)?.short
        || (emp.department || '').replace('Ministry of ', '').slice(0, 8);
      if (!byDept[deptShort]) byDept[deptShort] = { dept: deptShort, verified: 0, flagged: 0, blocked: 0 };
      if (r.status === 'verified') byDept[deptShort].verified++;
      else if (r.status === 'flagged') byDept[deptShort].flagged++;
      else if (r.status === 'blocked') byDept[deptShort].blocked++;
    });

    setData(Object.values(byDept).filter(d => d.verified + d.flagged + d.blocked > 0));
    setLive(true);
  }, [scanResult]);

  return (
    <div>
      {live && (
        <p className="text-[10px] text-ok bg-ok-pale px-2 py-0.5 rounded-full font-medium inline-block mb-3">
          Live AI data
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={14} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EE" />
          <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F4F2' }} />
          <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Bar dataKey="verified" fill={COLORS.verified} radius={[3,3,0,0]} />
          <Bar dataKey="flagged"  fill={COLORS.flagged}  radius={[3,3,0,0]} />
          <Bar dataKey="blocked"  fill={COLORS.blocked}  radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
