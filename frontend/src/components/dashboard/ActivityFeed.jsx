import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, ShieldAlert, Send, Activity } from 'lucide-react';
import { relativeTime } from '../../utils/formatters.js';
import { EMPLOYEES } from '../../data/employees.js';

const ICONS = {
  verified:  { Icon: Check,         tone: 'bg-ok-pale   text-ok'   },
  flagged:   { Icon: AlertTriangle, tone: 'bg-warn-pale text-warn' },
  blocked:   { Icon: ShieldAlert,   tone: 'bg-bad-pale  text-bad'  },
  disbursed: { Icon: Send,          tone: 'bg-info-pale text-info' },
  scan:      { Icon: Activity,      tone: 'bg-brand-pale text-brand-dark' },
};

function buildEventPool(scanResult) {
  const pool = [];

  if (scanResult?.results) {
    // Use real AI results
    const verified = scanResult.results.filter(r => r.status === 'verified').slice(0, 20);
    const flagged  = scanResult.results.filter(r => r.status !== 'verified').slice(0, 10);

    for (const r of verified) {
      const emp = EMPLOYEES.find(e => e.id === r.id);
      if (!emp) continue;
      pool.push({ kind: 'verified',  who: 'Employee',  text: 'Liveness verified',  meta: `${emp.id} · ${(emp.department || '').replace('Ministry of ', '')}` });
      pool.push({ kind: 'disbursed', who: 'Squad API', text: 'Salary disbursed',   meta: `${emp.id} · ₦${emp.salaryAmount.toLocaleString()}` });
    }
    for (const r of flagged) {
      const emp = EMPLOYEES.find(e => e.id === r.id);
      if (!emp) continue;
      pool.push({ kind: 'flagged', who: 'AI Engine', text: 'Ghost worker flagged', meta: `${emp.id} · Risk ${Math.round(r.riskScore)}` });
      pool.push({ kind: 'blocked', who: 'System',    text: 'Payment blocked',      meta: `${emp.id} · ₦${emp.salaryAmount.toLocaleString()}` });
    }
    pool.push({ kind: 'scan', who: 'AI Engine', text: 'Isolation Forest scan complete', meta: `${scanResult.total} records · ${scanResult.flagged} flagged` });
  } else {
    // Fallback when backend offline
    const sample = EMPLOYEES.slice(0, 15);
    for (const e of sample) {
      pool.push({ kind: 'verified',  who: 'Employee',  text: 'Liveness verified', meta: `${e.id} · ${(e.department || '').replace('Ministry of ', '')}` });
      pool.push({ kind: 'disbursed', who: 'Squad API', text: 'Salary disbursed',  meta: `${e.id} · ₦${e.salaryAmount.toLocaleString()}` });
    }
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

let globalId = 0;
function stamp(ev) { return { ...ev, id: ++globalId, ts: new Date() }; }

export default function ActivityFeed({ scanResult }) {
  const [items,    setItems]    = useState([]);
  const poolRef    = useRef([]);
  const idxRef     = useRef(0);
  const MAX_ITEMS  = 6;

  useEffect(() => {
    poolRef.current = buildEventPool(scanResult);
    idxRef.current  = 0;
    setItems([]);

    // Pre-fill 3 items immediately
    const initial = [];
    for (let i = 0; i < 3; i++) {
      initial.push(stamp(poolRef.current[idxRef.current % poolRef.current.length]));
      idxRef.current++;
    }
    setItems(initial);

    const interval = setInterval(() => {
      const next = stamp(poolRef.current[idxRef.current % poolRef.current.length]);
      idxRef.current++;
      setItems(prev => [next, ...prev].slice(0, MAX_ITEMS));
    }, 3200);

    return () => clearInterval(interval);
  }, [scanResult]);

  return (
    <div className="space-y-2 overflow-hidden">
      <AnimatePresence initial={false}>
        {items.map(item => {
          const { Icon, tone } = ICONS[item.kind] || ICONS.scan;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-2.5"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${tone}`}>
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-ink-900 leading-tight">
                  <span className="text-ink-500">{item.who} · </span>{item.text}
                </p>
                <p className="text-[11px] text-ink-500 mt-0.5 font-mono truncate">{item.meta}</p>
              </div>
              <span className="text-[10px] text-ink-400 shrink-0 mt-0.5">just now</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
