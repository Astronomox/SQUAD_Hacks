import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, CheckCircle, Ban, Clock, Zap, RefreshCw, Play,
  DollarSign, Users, Shield, Sparkles, AlertTriangle, Lock,
} from 'lucide-react';
import {
  VERIFIED_EMPLOYEES, FLAGGED_EMPLOYEES, BLOCKED_EMPLOYEES,
} from '../data/employees.js';
import { formatNaira, initials, maskAccount } from '../utils/formatters.js';

/* ──────────────────────────────────────────────────────────────────────────
   Demo payload: every employee approved at the verification stage shows up
   here, ready for HR to release. Blocked + flagged ones are SHOWN but
   visibly held — judges see the AI gatekeeping in action.
   ────────────────────────────────────────────────────────────────────── */
function buildRoster() {
  const approved = VERIFIED_EMPLOYEES.slice(0, 24).map(e => ({
    ...e, releaseStatus: 'pending', txnRef: null,
  }));
  const held = [
    ...FLAGGED_EMPLOYEES.slice(0, 3).map(e => ({ ...e, releaseStatus: 'flagged', txnRef: null })),
    ...BLOCKED_EMPLOYEES.slice(0, 4).map(e => ({ ...e, releaseStatus: 'blocked', txnRef: null })),
  ];
  return { approved, held };
}

const STAGES = [
  { key: 'idle',        label: 'Awaiting HR authorization' },
  { key: 'authorizing', label: 'Authorizing batch with Squad…' },
  { key: 'streaming',   label: 'Disbursing salaries via NIP rails…' },
  { key: 'complete',    label: 'All verified payments disbursed ✓' },
];

const TOTAL_WINDOW_MS = 8000; // user requested: ~8 seconds end-to-end

export default function PayrollReleaseCenter() {
  const [{ approved, held }, setRoster] = useState(buildRoster);
  const [stage, setStage]       = useState('idle');
  const [confirmOpen, setConfirm] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100
  const [countdown, setCountdown] = useState(8);
  const [activeId, setActiveId] = useState(null);
  const cancelRef = useRef(false);

  const totalAmount     = useMemo(() => approved.reduce((s, e) => s + (e.salaryAmount || 0), 0), [approved]);
  const heldAmount      = useMemo(() => held.reduce((s, e) => s + (e.salaryAmount || 0), 0), [held]);
  const releasedCount   = approved.filter(e => e.releaseStatus === 'released').length;
  const releasingActive = stage === 'authorizing' || stage === 'streaming';

  /* ── Release flow ──────────────────────────────────────────────────── */
  async function handleRelease() {
    if (releasingActive || stage === 'complete') return;
    setConfirm(false);
    cancelRef.current = false;
    setStage('authorizing');
    setProgress(0);
    setCountdown(8);

    // Phase 1 — "authorizing" handshake, ~1.2s
    await wait(1200);
    if (cancelRef.current) return;

    // Phase 2 — streaming disbursements across ~6.8s
    setStage('streaming');
    const n = approved.length;
    const streamWindow = TOTAL_WINDOW_MS - 1200;
    const perEmp = streamWindow / n;
    const start = performance.now();

    // Animate progress + countdown smoothly
    let raf;
    const tick = () => {
      const elapsed = performance.now() - start + 1200;
      const pct = Math.min(100, (elapsed / TOTAL_WINDOW_MS) * 100);
      setProgress(pct);
      setCountdown(Math.max(0, Math.ceil((TOTAL_WINDOW_MS - elapsed) / 1000)));
      if (pct < 100 && !cancelRef.current) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    for (let i = 0; i < n; i++) {
      if (cancelRef.current) break;
      const emp = approved[i];
      setActiveId(emp.id);

      // Mark as releasing
      setRoster(r => ({
        ...r,
        approved: r.approved.map(e => e.id === emp.id ? { ...e, releaseStatus: 'releasing' } : e),
      }));

      await wait(perEmp * 0.55);
      if (cancelRef.current) break;

      // Generate Squad txn ref
      const txnRef = `SB9GB7333N_${emp.id.slice(-6)}${Date.now().toString().slice(-5)}`;

      setRoster(r => ({
        ...r,
        approved: r.approved.map(e => e.id === emp.id ? { ...e, releaseStatus: 'released', txnRef } : e),
      }));

      await wait(perEmp * 0.45);
    }

    cancelAnimationFrame(raf);
    if (!cancelRef.current) {
      setProgress(100);
      setCountdown(0);
      setActiveId(null);
      setStage('complete');
    }
  }

  function handleReset() {
    cancelRef.current = true;
    setRoster(buildRoster());
    setStage('idle');
    setProgress(0);
    setCountdown(8);
    setActiveId(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="p-6 space-y-6"
    >
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8501A] to-[#FF8C5A] flex items-center justify-center shadow-lg shadow-[#E8501A]/20">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink-900">Payment Release Center</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E8501A]/10 text-[#E8501A] px-2 py-0.5 rounded-full">
                HR Authorization
              </span>
            </div>
            <p className="text-ink-500 text-sm mt-0.5">
              Verified employees ready for May 2025 disbursement · Powered by{' '}
              <span className="font-semibold text-[#E8501A]">Squad NIP</span>
            </p>
          </div>
        </div>

        {(stage === 'complete') && (
          <button
            onClick={handleReset}
            className="text-[12px] text-[#737373] hover:text-[#111111] flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E5E5E2] hover:bg-white transition-colors"
          >
            <RefreshCw size={12} /> Reset demo
          </button>
        )}
      </div>

      {/* ─── Stat row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={CheckCircle} label="Verified — Ready" value={approved.length} accent="green" />
        <StatTile icon={Ban}         label="Held by AI"      value={held.length}     accent="red" />
        <StatTile icon={DollarSign}  label="Batch Total"     value={formatNaira(totalAmount)} accent="brand" mono />
        <StatTile icon={Shield}      label="Leakage Blocked" value={formatNaira(heldAmount)}  accent="amber" mono />
      </div>

      {/* ─── Master release card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-[#F0F0EE]">
        <div className="px-6 py-5 border-b border-[#F0F0EE] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <StageDot stage={stage} />
            <div>
              <p className="font-display font-bold text-[15px] text-ink-900">
                {STAGES.find(s => s.key === stage)?.label}
              </p>
              <p className="text-[11px] text-[#737373] mt-0.5">
                {stage === 'idle'        && `${approved.length} verified · ${held.length} held by integrity engine`}
                {stage === 'authorizing' && 'Squad merchant handshake · validating NIP routing'}
                {stage === 'streaming'   && `${releasedCount}/${approved.length} disbursed · ETA ${countdown}s`}
                {stage === 'complete'    && `${releasedCount} disbursements settled · ${held.length} held flagged for review`}
              </p>
            </div>
          </div>

          {stage === 'idle' && (
            <button
              onClick={() => setConfirm(true)}
              className="group flex items-center gap-2.5 px-5 py-3 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#E8501A]/25 hover:shadow-[#E8501A]/40 transition-all"
            >
              <Play size={15} />
              Release All Payments
              <span className="text-[10px] font-mono opacity-70 group-hover:opacity-100">
                ({formatNaira(totalAmount)})
              </span>
            </button>
          )}

          {releasingActive && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FFF1EC] border border-[#E8501A]/20">
              <RefreshCw size={14} className="animate-spin text-[#E8501A]" />
              <span className="text-[12px] font-bold text-[#E8501A]">Releasing… {countdown}s</span>
            </div>
          )}

          {stage === 'complete' && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/20">
              <CheckCircle size={14} className="text-[#16A34A]" />
              <span className="text-[12px] font-bold text-[#16A34A]">Batch settled via Squad</span>
            </div>
          )}
        </div>

        {/* progress bar */}
        {(releasingActive || stage === 'complete') && (
          <div className="h-1.5 bg-[#F4F4F2] relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E8501A] to-[#FF8C5A]"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
            {releasingActive && (
              <motion.div
                className="absolute inset-y-0 w-24 bg-white/40"
                animate={{ x: ['-100%', '1200%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
        )}

        {/* squad branding strip */}
        <div className="px-6 py-2.5 bg-[#FAFAF8] border-b border-[#F0F0EE] flex items-center gap-3 text-[11px] text-[#737373]">
          <div className="w-4 h-4 rounded bg-[#E8501A] flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">S</span>
          </div>
          <span>Squad Merchant ID <span className="font-mono text-ink-900">MX-VRFY-AI-001</span></span>
          <span className="text-[#D4D4D2]">·</span>
          <span>NIP Session <span className="font-mono text-ink-900">SB9GB7333N</span></span>
          <span className="text-[#D4D4D2]">·</span>
          <span className="flex items-center gap-1"><Lock size={10}/> AES-256 encrypted payload</span>
        </div>
      </div>

      {/* ─── Verified roster ──────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-card border border-[#F0F0EE] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0EE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] flex items-center justify-center">
              <CheckCircle size={14} className="text-[#16A34A]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-ink-900">
                Verified Employees — Ready for Payroll Release
              </h2>
              <p className="text-[11px] text-[#737373]">
                Passed liveness + face match + NIN cross-check. {releasedCount}/{approved.length} disbursed.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#737373] font-mono">{approved.length} verified</span>
        </div>

        <div className="divide-y divide-[#F4F4F2] max-h-[480px] overflow-y-auto">
          {approved.map((emp, i) => (
            <EmployeeRow
              key={emp.id}
              emp={emp}
              isActive={emp.id === activeId}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ─── Held roster ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-card border border-[#FECACA]/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F0F0EE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <Ban size={14} className="text-[#DC2626]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-ink-900">
                Held — Will NOT be disbursed
              </h2>
              <p className="text-[11px] text-[#737373]">
                AI integrity engine blocked these records from this cycle.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#DC2626] font-mono font-bold">{held.length} held</span>
        </div>

        <div className="divide-y divide-[#F4F4F2]">
          {held.map(emp => <HeldRow key={emp.id} emp={emp} />)}
        </div>
      </section>

      {/* ─── Confirm modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmOpen && (
          <ConfirmModal
            count={approved.length}
            amount={totalAmount}
            held={held.length}
            onCancel={() => setConfirm(false)}
            onConfirm={handleRelease}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────── */
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function StatTile({ icon: Icon, label, value, accent, mono }) {
  const colors = {
    green: { bg: 'bg-[#DCFCE7]', fg: 'text-[#16A34A]' },
    red:   { bg: 'bg-red-50',    fg: 'text-[#DC2626]' },
    brand: { bg: 'bg-[#FFF1EC]', fg: 'text-[#E8501A]' },
    amber: { bg: 'bg-[#FEF9C3]', fg: 'text-[#D97706]' },
  }[accent];
  return (
    <div className="bg-white rounded-xl border border-[#F0F0EE] p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={colors.fg} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#B0B0B0] font-medium">{label}</p>
        <p className={`font-display font-bold text-lg ${colors.fg} ${mono ? 'font-mono text-base' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StageDot({ stage }) {
  if (stage === 'idle') {
    return <div className="w-2.5 h-2.5 rounded-full bg-[#D4D4D2]" />;
  }
  if (stage === 'complete') {
    return <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />;
  }
  return (
    <div className="relative w-2.5 h-2.5">
      <div className="absolute inset-0 rounded-full bg-[#E8501A]" />
      <div className="absolute inset-0 rounded-full bg-[#E8501A] animate-ping opacity-60" />
    </div>
  );
}

function EmployeeRow({ emp, isActive, index }) {
  const s = emp.releaseStatus;
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4) }}
      className={`flex items-center gap-4 px-6 py-3 transition-colors ${
        s === 'released'  ? 'bg-[#F0FDF4]'   :
        s === 'releasing' ? 'bg-[#FFF7F3]'   :
        'hover:bg-[#FAFAF8]'
      } ${isActive ? 'ring-2 ring-inset ring-[#E8501A]/40' : ''}`}
    >
      {/* avatar */}
      <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
        s === 'released' ? 'bg-[#16A34A]/10 text-[#16A34A]' :
        s === 'releasing' ? 'bg-[#E8501A]/15 text-[#E8501A]' :
        'bg-[#FFF1EC] text-[#E8501A]'
      }`}>
        {initials(emp.fullName)}
        {s === 'releasing' && (
          <span className="absolute -inset-1 rounded-full border-2 border-[#E8501A] border-t-transparent animate-spin" />
        )}
        {s === 'released' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center border-2 border-white">
            <CheckCircle size={9} className="text-white" />
          </span>
        )}
      </div>

      {/* name + bank */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink-900 truncate">{emp.fullName}</p>
        <p className="text-[11px] text-[#737373] truncate">
          {emp.department?.replace('Ministry of ', '')} · {emp.bankName} {maskAccount(emp.bankAccount)}
        </p>
      </div>

      {/* txn ref / NIN */}
      <div className="hidden md:block text-right shrink-0 min-w-[180px]">
        {emp.txnRef ? (
          <>
            <p className="text-[9px] text-[#737373] uppercase tracking-wide">Squad Ref</p>
            <p className="font-mono text-[10px] text-[#16A34A] truncate">{emp.txnRef}</p>
          </>
        ) : (
          <>
            <p className="text-[9px] text-[#737373] uppercase tracking-wide">NIN</p>
            <p className="font-mono text-[10px] text-[#B0B0B0]">{emp.nin || emp.id}</p>
          </>
        )}
      </div>

      {/* amount */}
      <div className="text-right shrink-0 w-[110px]">
        <p className="font-mono text-[13px] font-bold text-ink-900">{formatNaira(emp.salaryAmount)}</p>
        <ReleasePill status={s} />
      </div>
    </motion.div>
  );
}

function ReleasePill({ status }) {
  const cfg = {
    pending:   { label: 'Queued',     bg: 'bg-[#F4F4F2]', fg: 'text-[#737373]', dot: 'bg-[#B0B0B0]' },
    releasing: { label: 'Releasing',  bg: 'bg-[#FFF1EC]', fg: 'text-[#E8501A]', dot: 'bg-[#E8501A] animate-pulse' },
    released:  { label: 'Disbursed',  bg: 'bg-[#DCFCE7]', fg: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
  }[status] || { label: status, bg: 'bg-[#F4F4F2]', fg: 'text-[#737373]', dot: 'bg-[#B0B0B0]' };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded-full text-[9px] font-bold ${cfg.bg} ${cfg.fg}`}>
      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function HeldRow({ emp }) {
  const reason = emp.releaseStatus === 'blocked'
    ? 'AI flagged — ghost worker pattern detected'
    : 'Salary anomaly — awaiting manual review';
  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-red-50/30">
      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <Ban size={14} className="text-[#DC2626]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink-900 truncate">{emp.fullName}</p>
        <p className="text-[11px] text-[#DC2626] truncate flex items-center gap-1">
          <AlertTriangle size={10} /> {reason}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-[13px] text-[#B0B0B0] line-through">{formatNaira(emp.salaryAmount)}</p>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded-full text-[9px] font-bold bg-red-50 text-[#DC2626]">
          <span className="w-1 h-1 rounded-full bg-[#DC2626]" />
          {emp.releaseStatus === 'blocked' ? 'Blocked' : 'On hold'}
        </span>
      </div>
    </div>
  );
}

function ConfirmModal({ count, amount, held, onCancel, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EC] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#E8501A]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink-900">Authorize Payroll Release</h3>
              <p className="text-[11px] text-[#737373]">This action is logged and irreversible.</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-3 text-[13px]">
          <Row label="Verified employees" value={`${count}`} />
          <Row label="Total amount"        value={formatNaira(amount)} mono />
          <Row label="Held by AI"          value={`${held} blocked`} danger />
          <Row label="Rails"               value="Squad NIP · Instant" mono />
        </div>
        <div className="px-6 py-4 bg-[#FAFAF8] flex items-center gap-2 justify-end border-t border-[#F0F0EE]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-semibold text-[#737373] hover:text-ink-900 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-lg text-[13px] font-bold shadow-md shadow-[#E8501A]/25"
          >
            <Send size={13} />
            Release ₦ via Squad
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value, mono, danger }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#737373]">{label}</span>
      <span className={`font-semibold ${danger ? 'text-[#DC2626]' : 'text-ink-900'} ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}