import React from 'react';
import clsx from 'clsx';
import { Check, AlertTriangle, XCircle, Clock, Shield, Send } from 'lucide-react';

/** Maps employee/payroll/audit status strings → tone + icon */
const MAP = {
  verified:     { tone: 'ok',   icon: Check,         label: 'Verified' },
  passed:       { tone: 'ok',   icon: Check,         label: 'Passed' },
  payment_sent: { tone: 'ok',   icon: Send,          label: 'Payment Sent' },
  success:      { tone: 'ok',   icon: Check,         label: 'Success' },
  clean:        { tone: 'ok',   icon: Check,         label: 'Clean' },

  flagged:      { tone: 'warn', icon: AlertTriangle, label: 'Flagged' },
  review:       { tone: 'warn', icon: AlertTriangle, label: 'Review' },
  warning:      { tone: 'warn', icon: AlertTriangle, label: 'Warning' },
  escalated:    { tone: 'warn', icon: Shield,        label: 'Escalated' },
  'in progress':{ tone: 'warn', icon: Clock,         label: 'In Progress' },
  pending:      { tone: 'warn', icon: Clock,         label: 'Pending' },

  blocked:      { tone: 'bad',  icon: XCircle,       label: 'Blocked' },
  failed:       { tone: 'bad',  icon: XCircle,       label: 'Failed' },

  complete:     { tone: 'info', icon: Check,         label: 'Complete' },
  disbursed:    { tone: 'info', icon: Send,          label: 'Disbursed' },
  info:         { tone: 'info', icon: Shield,        label: 'Info' },
};

const TONE = {
  ok:    'bg-ok-pale   text-ok    border-ok/30',
  warn:  'bg-warn-pale text-warn  border-warn/30',
  bad:   'bg-bad-pale  text-bad   border-bad/30',
  info:  'bg-info-pale text-info  border-info/30',
  ink:   'bg-ink-100   text-ink-700 border-ink-200',
};

export default function StatusBadge({ status, size = 'md', showIcon = true, className }) {
  const cfg = MAP[String(status || '').toLowerCase()] || { tone: 'ink', icon: null, label: status || '-' };
  const Icon = cfg.icon;
  const sizeCls = size === 'sm' ? 'h-5 px-1.5 text-[10.5px]' : 'h-6 px-2 text-[11.5px]';

  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full border font-medium', TONE[cfg.tone], sizeCls, className)}>
      {showIcon && Icon && <Icon size={11} strokeWidth={2.6} />}
      {cfg.label}
    </span>
  );
}
