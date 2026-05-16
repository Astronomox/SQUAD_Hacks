import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, ShieldAlert, Send, Activity } from 'lucide-react';
import { relativeTime } from '../../utils/formatters.js';
import { EMPLOYEES, GHOST_EMPLOYEES, VERIFIED_EMPLOYEES } from '../../data/employees.js';

const ICONS = {
  verified:    { Icon: Check,        tone: 'bg-ok-pale   text-ok'   },
  flagged:     { Icon: AlertTriangle,tone: 'bg-warn-pale text-warn' },
  blocked:     { Icon: ShieldAlert,  tone: 'bg-bad-pale  text-bad'  },
  disbursed:   { Icon: Send,         tone: 'bg-info-pale text-info' },
  scan:        { Icon: Activity,     tone: 'bg-brand-pale text-brand-dark' },
};

// A small library of synthetic event templates pulled from the dataset
function buildEventPool() {
  const verifiedSample = VERIFIED_EMPLOYEES.slice(0, 30);
  const flaggedSample  = GHOST_EMPLOYEES;

  const pool = [];
  for (const e of verifiedSample) {
    pool.push({ kind: 'verified', who: 'Employee', text: 'Liveness verified', meta: `${e.id} · ${e.department.replace('Ministry of ', '')}` });
    pool.push({ kind: 'disbursed', who: 'Squad API', text: 'Salary disbursed', meta: `${e.id} · ₦${e.salaryAmount.toLocaleString()}` });
  }
  for (const e of flaggedSample) {
    pool.push({ kind: 'flagged', who: 'AI Engine', text: 'Ghost worker flagged', meta: `${e.id} · Risk ${e.riskScore}` });
    pool.push({ kind: 'blocked', who: 'System',   text: 'Payment blocked',     meta: `${e.id} · ₦${e.salaryAmount.toLocaleString()}` });
  }
  pool.push({ kind: 'scan', who: 'AI Engine', text: 'Anomaly scan completed', meta: `${EMPLOYEES.length} records · 8.3s` });

  return pool;
}

export default function ActivityFeed({ maxItems = 7 }) {
  const pool = useRef(buildEventPool());
  const [events, setEvents] = useState(() =>
    pool.current.slice(0, maxItems).map((e, i) => ({
      ...e, id: `seed-${i}`, ts: new Date(Date.now() - (i + 1) * 60_000),
    }))
  );

  useEffect(() => {
    let counter = 0;
    const tid = setInterval(() => {
      const e = pool.current[Math.floor(Math.random() * pool.current.length)];
      setEvents((prev) => [
        { ...e, id: `live-${++counter}-${Date.now()}`, ts: new Date() },
        ...prev.slice(0, maxItems - 1),
      ]);
    }, 4000);
    return () => clearInterval(tid);
  }, [maxItems]);

  return (
    <ul className="flex-1 flex flex-col gap-2 -mx-2 overflow-hidden">
      <AnimatePresence initial={false}>
        {events.map((e) => {
          const { Icon, tone } = ICONS[e.kind] || ICONS.scan;
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-ink-100"
            >
              <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${tone}`}>
                <Icon size={14} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-tight">
                  <span className="font-medium text-ink-900">{e.who}</span>
                  <span className="text-ink-500"> · {e.text}</span>
                </div>
                <div className="text-[11.5px] text-ink-500 mt-1 font-mono truncate">{e.meta}</div>
              </div>
              <div className="text-[11px] text-ink-500 mt-1 tabular-nums shrink-0">{relativeTime(e.ts)}</div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
