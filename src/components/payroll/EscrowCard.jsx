import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

const SQUAD_STEPS = [
  { label: 'POST /virtual-account',              desc: 'Creating payroll escrow vault…' },
  { label: 'Webhook: account_created',            desc: 'Confirming virtual account…' },
  { label: 'POST /payout/initiate-bulk-transfer', desc: 'Staging verified transfers…' },
  { label: 'Escrow locked ✓',                    desc: 'Funds ring-fenced, awaiting verification' },
];

export default function EscrowCard({ summary, phase, squadStep, escrow, onLock }) {
  const isLocking = phase === 'locking';
  const isLocked  = phase === 'locked';

  return (
    <div className="bg-white rounded-xl shadow-card border border-brand-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-ink-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-pale flex items-center justify-center">
          <Lock className="w-4 h-4 text-brand" />
        </div>
        <div>
          <p className="font-display font-bold text-sm text-ink-900">Squad Payroll Escrow Vault</p>
          <p className="text-xs text-ink-500">Funds locked until AI verification passes — nothing disbursed yet</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="inline-grid place-items-center rounded-[3px] font-bold font-display text-brand-hover"
            style={{ width: 14, height: 14, fontSize: 9, background: '#000' }}
          >S</span>
          <span className="text-[10px] text-ink-500">Powered by Squad API</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Summary grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total to escrow',        value: `₦${((summary?.amount || 0) / 1e6).toFixed(1)}M`, accent: true },
            { label: 'Verified employees',     value: (summary?.clean || 0).toLocaleString(),  color: 'text-ok' },
            { label: 'Blocked (excluded)',      value: (summary?.blocked || 0).toLocaleString(), color: 'text-bad' },
          ].map(item => (
            <div key={item.label} className="bg-ink-100 rounded-lg p-3">
              <p className="text-[10px] text-ink-500 mb-1 uppercase tracking-wider">{item.label}</p>
              <p className={`font-display font-bold text-lg ${item.accent ? 'text-brand-dark' : item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Squad API visualizer */}
        <AnimatePresence mode="wait">
          {(isLocking || isLocked) && (
            <motion.div
              key="squad-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#111111] rounded-xl p-5 space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-1">
                {isLocking
                  ? <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
                  : <CheckCircle className="w-3.5 h-3.5 text-ok" />
                }
                <span className="text-brand text-xs font-mono font-medium">
                  {isLocking ? 'Calling Squad API…' : 'Squad API · All calls succeeded'}
                </span>
                {isLocked && <span className="ml-auto text-[10px] text-white/40 font-mono">~2.4s</span>}
              </div>

              {SQUAD_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: i <= squadStep ? 1 : 0.2, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    i < squadStep  ? 'bg-ok' :
                    i === squadStep ? 'bg-brand animate-pulse' :
                    'bg-white/20'
                  }`} />
                  <span className={`font-mono text-[11px] flex-1 ${i <= squadStep ? 'text-white' : 'text-white/25'}`}>
                    {step.label}
                  </span>
                  {i <= squadStep && (
                    <span className="text-[10px] text-white/40 hidden sm:block">{step.desc}</span>
                  )}
                </motion.div>
              ))}

              {isLocked && escrow && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3"
                >
                  {[
                    { label: 'Squad Reference',  value: escrow.reference,              orange: true },
                    { label: 'Virtual Account',  value: escrow.virtual_account_number, orange: false },
                    { label: 'Bank',             value: escrow.bank,                   orange: false },
                    { label: 'Status',           value: 'FUNDS LOCKED',                orange: false },
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 rounded-lg p-2.5">
                      <p className="text-[10px] text-white/40 mb-1">{item.label}</p>
                      <p className={`font-mono text-xs font-medium ${item.orange ? 'text-brand' : 'text-white'}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {isLocked && (
                <p className="text-[10px] text-white/30 text-center pt-1">
                  Verification requests sent to {(summary?.clean || 0).toLocaleString()} employees via SMS
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        {phase === 'results' && (
          <button
            onClick={onLock}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-hover text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Lock className="w-4 h-4" />
            Lock ₦{((summary?.amount || 0) / 1e6).toFixed(1)}M in Squad Escrow
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isLocked && (
          <div className="flex items-center justify-center gap-2 py-2.5 bg-ok-pale rounded-lg">
            <CheckCircle className="w-4 h-4 text-ok" />
            <span className="text-ok text-sm font-medium">
              Escrow locked · {(summary?.clean || 0).toLocaleString()} employees awaiting verification
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
