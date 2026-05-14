import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function StatCard({
  label,
  value,
  sub,
  hint,
  accent = false,
  icon,
  index = 0,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={clsx(
        'p-5 rounded-xl border shadow-card',
        accent ? 'bg-brand-pale border-brand-border' : 'bg-white border-ink-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={clsx('text-[11px] uppercase tracking-[0.1em] font-semibold', accent ? 'text-brand-dark' : 'text-ink-500')}>
          {label}
        </div>
        {icon && (
          <div className={clsx('w-8 h-8 rounded-lg grid place-items-center', accent ? 'bg-brand text-white' : 'bg-ink-100 text-ink-700')}>
            {icon}
          </div>
        )}
      </div>

      <div className={clsx('font-display font-bold mt-2 tabular-nums leading-none', accent ? 'text-brand-dark text-[30px]' : 'text-ink-900 text-[28px]')}>
        {value}
      </div>

      {sub && <div className="mt-2 text-[12.5px] text-ink-500 flex items-center gap-1.5">{sub}</div>}
      {hint && <div className={clsx('mt-1 text-[11px]', accent ? 'text-brand-dark/70' : 'text-ink-500')}>{hint}</div>}
    </motion.div>
  );
}
