import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Check } from 'lucide-react';

export default function ScanProgress({ phase, progress, analyzed, total }) {
  const pct = phase === 'uploading' ? progress : (analyzed / total) * 100;

  const label = phase === 'uploading'
    ? 'Uploading & validating CSV…'
    : `AI scanning ${analyzed.toLocaleString()} of ${total.toLocaleString()} records…`;

  const subLabel = useMemo(() => {
    if (phase === 'uploading') return 'parsing schema · validating types…';
    if (analyzed < total * 0.2)  return 'Validating format…';
    if (analyzed < total * 0.4)  return 'Running anomaly detection (Isolation Forest)…';
    if (analyzed < total * 0.6)  return 'Checking enrollment patterns…';
    if (analyzed < total * 0.8)  return 'Analyzing attendance gaps…';
    return 'Generating risk scores…';
  }, [phase, analyzed, total]);

  const checks = [
    { label: 'CSV schema validated',         done: phase !== 'uploading' || progress > 30 },
    { label: 'Duplicate IP clustering',      done: analyzed > total * 0.18 },
    { label: 'Bulk enrollment detection',    done: analyzed > total * 0.38 },
    { label: 'Salary outlier analysis',      done: analyzed > total * 0.62 },
    { label: 'Attendance gap correlation',   done: analyzed > total * 0.82 },
    { label: 'Risk score normalization',     done: analyzed >= total },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-ink-200 rounded-xl shadow-card p-8"
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 h-6 px-2 bg-brand-pale text-brand-dark border border-brand-border rounded-full text-[11px] font-medium">
            <Cpu size={11} /> Isolation Forest engine v2.1
          </div>
          <h2 className="font-display font-bold text-[24px] mt-3 leading-tight text-ink-900">
            {phase === 'uploading' ? 'Preparing your dataset' : 'Detecting ghost worker patterns'}
          </h2>
          <p className="text-ink-500 mt-3 text-[14px] leading-relaxed max-w-md">
            We're checking each record for duplicate IPs, bulk enrollment, salary outliers, and attendance gaps. Funds remain in your account — nothing is disbursed yet.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[12.5px] mb-2">
              <span className="font-medium text-ink-700">{label}</span>
              <span className="font-mono text-ink-500 tabular-nums">{Math.round(pct)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-ink-200 overflow-hidden relative">
              <div className="h-full bg-brand transition-[width] duration-100 ease-linear" style={{ width: `${pct}%` }} />
              <div className="absolute inset-0 shimmer pointer-events-none"></div>
            </div>
            <div className="mt-2 text-[11px] text-ink-500 font-mono">{subLabel}</div>
          </div>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-[12.5px]">
                <span className={`w-4 h-4 rounded-full grid place-items-center shrink-0 ${c.done ? 'bg-ok text-white' : 'bg-ink-200 text-ink-500'}`}>
                  {c.done ? <Check size={11} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </span>
                <span className={c.done ? 'text-ink-900' : 'text-ink-500'}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <ScanGrid analyzed={analyzed} total={total} phase={phase} />
      </div>
    </motion.div>
  );
}

function ScanGrid({ analyzed, total, phase }) {
  const cols = Math.ceil(Math.sqrt(total * 1.6));
  const cells = Math.max(total, cols * Math.ceil(total / cols));

  const cellState = (i) => {
    if (i >= analyzed) return 'idle';
    if (i % 47 === 0)  return 'block';
    if (i % 19 === 0)  return 'flag';
    return 'ok';
  };
  const COLORS = { idle: '#E4E4E0', ok: '#16A34A', flag: '#D97706', block: '#DC2626' };

  const okN    = Math.max(0, analyzed - Math.floor(analyzed / 47) - Math.floor(analyzed / 19));
  const flagN  = Math.floor(analyzed / 19);
  const blockN = Math.floor(analyzed / 47);

  return (
    <div className="relative bg-ink-100 border border-ink-200 rounded-xl p-6 overflow-hidden min-h-[280px]">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10.5px] font-mono text-ink-500">
        <span>{total.toLocaleString()} RECORDS</span>
        <span className="text-brand-dark font-medium">SCAN.AI · v2.1</span>
      </div>

      {phase === 'scanning' && (
        <div className="sweep-bar absolute left-6 right-6 h-px bg-brand/70 shadow-[0_0_8px_rgba(232,80,26,.7)] pointer-events-none"></div>
      )}

      <div
        className="mt-8 grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cells }).map((_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[2px] transition-colors duration-200"
            style={{ background: COLORS[cellState(i)] }}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <CellStat color="#16A34A" label="Clean"   n={okN} />
        <CellStat color="#D97706" label="Review"  n={flagN} />
        <CellStat color="#DC2626" label="Blocked" n={blockN} />
      </div>
    </div>
  );
}

function CellStat({ color, label, n }) {
  return (
    <div className="bg-white border border-ink-200 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-500 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-sm" style={{ background: color }}></span>{label}
      </div>
      <div className="font-display font-bold text-[20px] mt-1 tabular-nums text-ink-900">{n.toLocaleString()}</div>
    </div>
  );
}
