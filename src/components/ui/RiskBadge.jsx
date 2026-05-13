import React from 'react';
import clsx from 'clsx';
import { riskSeverity } from '../../utils/riskScoring.js';

const TONE = {
  critical: 'bg-bad-pale  text-bad   border-bad/30',
  high:     'bg-warn-pale text-warn  border-warn/30',
  medium:   'bg-info-pale text-info  border-info/30',
  low:      'bg-ok-pale   text-ok    border-ok/30',
};

const SIZE = {
  sm: 'h-6 px-2 text-[11px] gap-1',
  md: 'h-7 px-2.5 text-xs gap-1.5',
  lg: 'h-10 px-3 text-sm gap-2',
};

/** Risk score badge - 0..100, colour-graded */
export default function RiskBadge({ score = 0, size = 'md', showLabel = false, className }) {
  const sev = riskSeverity(score);
  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono font-medium rounded-md border tabular-nums',
        TONE[sev],
        SIZE[size],
        className
      )}
      title={`${sev[0].toUpperCase() + sev.slice(1)} risk · ${score}/100`}
    >
      <span className="font-display font-bold">{score}</span>
      <span className="opacity-60">/100</span>
      {showLabel && <span className="ml-1 uppercase tracking-wider text-[10px] font-semibold">{sev}</span>}
    </span>
  );
}
