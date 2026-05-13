import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import CSVUploader from '../components/payroll/CSVUploader.jsx';
import ScanProgress from '../components/payroll/ScanProgress.jsx';
import ResultsTable from '../components/payroll/ResultsTable.jsx';
import EscrowCard from '../components/payroll/EscrowCard.jsx';
import { usePayroll } from '../hooks/usePayroll.js';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const STEPS = ['Upload', 'AI Scan', 'Review', 'Lock Escrow'];

function stepIndex(phase) {
  if (phase === 'idle')                    return 0;
  if (phase === 'uploading')               return 1;
  if (phase === 'scanning')                return 1;
  if (phase === 'results')                 return 2;
  if (phase === 'locking' || phase === 'locked') return 3;
  return 0;
}

export default function PayrollUpload() {
  const { phase, progress, analyzed, total, escrow, squadStep, summary, startScan, lockEscrow, reset } = usePayroll();
  const activeStep = stepIndex(phase);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="p-4 lg:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Payroll Upload</h1>
          <p className="text-ink-500 text-sm mt-0.5">AI-powered verification before any funds move</p>
        </div>
        {phase !== 'idle' && (
          <button onClick={reset} className="text-xs text-ink-500 hover:text-ink-900 border border-ink-200 px-3 py-1.5 rounded-lg transition-colors">
            Start over
          </button>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const done   = i < activeStep;
          const active = i === activeStep;
          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active ? 'bg-brand text-white' :
                done   ? 'bg-ok-pale text-ok' :
                         'bg-ink-100 text-ink-500'
              }`}>
                {done
                  ? <Check size={11} strokeWidth={3} />
                  : <span className="w-4 h-4 rounded-full border border-current grid place-items-center text-[10px]">{i + 1}</span>
                }
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-colors ${i < activeStep ? 'bg-ok' : 'bg-ink-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Phase content */}
      {phase === 'idle' && (
        <CSVUploader onUpload={startScan} />
      )}

      {(phase === 'uploading' || phase === 'scanning') && (
        <ScanProgress
          phase={phase}
          progress={progress}
          analyzed={analyzed}
          total={total}
        />
      )}

      {(phase === 'results' || phase === 'locking' || phase === 'locked') && (
        <div className="space-y-6">
          {/* Summary banner */}
          <div className="bg-white border border-ink-200 rounded-xl shadow-card px-6 py-4 flex flex-wrap gap-6 items-center">
            <Stat label="Total analyzed"    value={summary.total.toLocaleString()}  color="text-ink-900" />
            <Stat label="Clean employees"   value={summary.clean.toLocaleString()}  color="text-ok" />
            <Stat label="Under review"      value={summary.review.toLocaleString()} color="text-warn" />
            <Stat label="Blocked"           value={summary.blocked.toLocaleString()} color="text-bad" />
            <Stat label="Leakage prevented" value={`₦${(summary.saved / 1e6).toFixed(1)}M`} color="text-brand-dark" accent />
          </div>

          <ResultsTable />

          <EscrowCard
            summary={summary}
            phase={phase}
            squadStep={squadStep}
            escrow={escrow}
            onLock={lockEscrow}
          />
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value, color, accent }) {
  return (
    <div className={accent ? 'bg-brand-pale rounded-lg px-4 py-2' : ''}>
      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">{label}</p>
      <p className={`font-display font-bold text-xl tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
