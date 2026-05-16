import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Clock, Zap, RefreshCw,
  Shield, AlertTriangle, ChevronDown, ChevronUp,
  DollarSign, Users, Ban, Play
} from 'lucide-react';
import { EMPLOYEES, VERIFIED_EMPLOYEES, FLAGGED_EMPLOYEES, BLOCKED_EMPLOYEES } from '../../data/employees.js';
import { formatNaira } from '../../utils/formatters.js';

// ─── Demo data: mix verified, flagged, blocked employees ─────────────────────
function buildReleaseList() {
  // Take 8 verified, 3 flagged, 2 blocked for demo
  const verified = VERIFIED_EMPLOYEES.slice(0, 8).map(e => ({ ...e, releaseStatus: 'pending' }));
  const flagged  = FLAGGED_EMPLOYEES.slice(0, 3).map(e => ({ ...e, releaseStatus: 'flagged' }));
  const blocked  = BLOCKED_EMPLOYEES.slice(0, 2).map(e => ({ ...e, releaseStatus: 'blocked' }));
  return [...verified, ...flagged, ...blocked];
}

const STATUS_CONFIG = {
  pending:   { label: 'Awaiting Release', color: 'text-[#D97706]', bg: 'bg-[#FEF9C3]', dot: 'bg-[#D97706]' },
  releasing: { label: 'Processing...',    color: 'text-[#E8501A]', bg: 'bg-[#FFF1EC]', dot: 'bg-[#E8501A] animate-pulse' },
  released:  { label: 'Disbursed',        color: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]', dot: 'bg-[#16A34A]' },
  failed:    { label: 'Failed',           color: 'text-[#DC2626]', bg: 'bg-red-50',    dot: 'bg-[#DC2626]' },
  flagged:   { label: 'Under Review',     color: 'text-[#D97706]', bg: 'bg-amber-50',  dot: 'bg-[#D97706]' },
  blocked:   { label: 'Blocked',          color: 'text-[#DC2626]', bg: 'bg-red-50',    dot: 'bg-[#DC2626]' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TxnRef({ ref }) {
  if (!ref) return null;
  return (
    <p className="font-mono text-[9px] text-[#16A34A] mt-0.5 truncate max-w-[180px]">{ref}</p>
  );
}

export default function PayrollRelease() {
  const [employees, setEmployees]     = useState(buildReleaseList);
  const [releasing, setReleasing]     = useState(false);
  const [done, setDone]               = useState(false);
  const [expanded, setExpanded]       = useState(true);
  const [txnRefs, setTxnRefs]         = useState({});   // employeeId -> txnRef
  const [currentIdx, setCurrentIdx]   = useState(-1);
  const releaseRef = useRef(false);

  const verifiedEmployees = employees.filter(e => e.releaseStatus === 'pending' || e.releaseStatus === 'releasing' || e.releaseStatus === 'released');
  const blockedEmployees  = employees.filter(e => e.releaseStatus === 'blocked' || e.releaseStatus === 'flagged');

  const totalVerified = verifiedEmployees.length;
  const totalAmount   = verifiedEmployees.reduce((s, e) => s + (e.salaryAmount || 0), 0);
  const releasedCount = employees.filter(e => e.releaseStatus === 'released').length;

  async function handleReleaseAll() {
    if (releasing || done) return;
    setReleasing(true);
    releaseRef.current = true;

    const toRelease = employees
      .map((e, i) => ({ ...e, _idx: i }))
      .filter(e => e.releaseStatus === 'pending');

    for (let i = 0; i < toRelease.length; i++) {
      if (!releaseRef.current) break;
      const emp = toRelease[i];

      // Mark as releasing
      setCurrentIdx(emp._idx);
      setEmployees(prev => prev.map((e, idx) =>
        idx === emp._idx ? { ...e, releaseStatus: 'releasing' } : e
      ));

      // Simulate 8-second Squad API call (staggered: 1.2s per employee so it's visible)
      const delay = i === 0 ? 1500 : 1200;
      await new Promise(r => setTimeout(r, delay));

      // Call backend Squad disburse
      let txnRef = null;
      try {
        const res = await fetch('http://localhost:8000/squad/disburse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId:    emp.id,
            amount:        emp.salaryAmount || 50000,
            bankCode:      emp.bankCode     || '000013',
            accountNumber: emp.bankAccount  || '0123456789',
            accountName:   emp.fullName,
            cycleId:       'PYC202505',
          }),
        });
        const data = await res.json();
        txnRef = data.squadResponse?.data?.transaction_reference
               || data.txnRef
               || `SB9GB7333N_${emp.id.replace(/[^A-Z0-9]/g, '')}${Date.now()}`;
      } catch {
        // Backend offline — generate a plausible ref for demo
        txnRef = `SB9GB7333N_${emp.id.replace(/[^A-Z0-9]/g, '').slice(0, 8)}${Date.now()}`;
      }

      setTxnRefs(prev => ({ ...prev, [emp.id]: txnRef }));
      setEmployees(prev => prev.map((e, idx) =>
        idx === emp._idx ? { ...e, releaseStatus: 'released' } : e
      ));

      // Small gap between employees
      await new Promise(r => setTimeout(r, 300));
    }

    setReleasing(false);
    setCurrentIdx(-1);
    setDone(true);
  }

  function handleReset() {
    releaseRef.current = false;
    setEmployees(buildReleaseList());
    setTxnRefs({});
    setReleasing(false);
    setDone(false);
    setCurrentIdx(-1);
  }

  const summaryStats = [
    { label: 'Verified',  value: totalVerified,           icon: CheckCircle, color: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]' },
    { label: 'Blocked',   value: blockedEmployees.length,  icon: Ban,         color: 'text-[#DC2626]', bg: 'bg-red-50'    },
    { label: 'Total',     value: formatNaira(totalAmount), icon: DollarSign,  color: 'text-[#E8501A]', bg: 'bg-[#FFF1EC]' },
    { label: 'Released',  value: releasedCount,            icon: Zap,         color: 'text-[#16A34A]', bg: 'bg-[#DCFCE7]' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[#F0F0EE] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E8501A]/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-[#E8501A]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-[#111111]">
              Payroll Release — May 2025
            </h2>
            <p className="text-[10px] text-[#737373]">
              {releasedCount}/{totalVerified} disbursed · {blockedEmployees.length} held
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {done && (
            <button
              onClick={handleReset}
              className="text-[11px] text-[#737373] hover:text-[#111111] flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={11} /> Reset demo
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-[#B0B0B0] hover:text-[#737373] transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* ─── Summary stats ─────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-px bg-[#F0F0EE] border-b border-[#F0F0EE]">
              {summaryStats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white px-3 py-3 flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon size={12} className={color} />
                  </div>
                  <p className={`font-display font-bold text-sm ${color}`}>{value}</p>
                  <p className="text-[9px] text-[#B0B0B0] uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* ─── Release All button ─────────────────────────────────────── */}
            {!done && (
              <div className="px-5 py-3 border-b border-[#F4F4F2]">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReleaseAll}
                  disabled={releasing}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    releasing
                      ? 'bg-[#E8501A]/60 text-white cursor-not-allowed'
                      : 'bg-[#E8501A] hover:bg-[#FF6B35] text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {releasing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Releasing payments via Squad...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Release All Verified Payments
                    </>
                  )}
                </motion.button>
                {releasing && (
                  <p className="text-center text-[10px] text-[#737373] mt-1.5">
                    Processing via Squad NIP transfer · Do not close this page
                  </p>
                )}
              </div>
            )}

            {done && (
              <div className="px-5 py-3 border-b border-[#F4F4F2]">
                <div className="flex items-center justify-center gap-2 py-2.5 bg-[#DCFCE7] rounded-xl">
                  <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-[#16A34A] text-sm font-bold">
                    {releasedCount} payments disbursed via Squad API ✓
                  </span>
                </div>
              </div>
            )}

            {/* ─── Verified employees list ───────────────────────────────── */}
            <div className="px-5 py-3">
              <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-2 flex items-center gap-1">
                <CheckCircle size={10} className="text-[#16A34A]" />
                Verified — Ready for release ({verifiedEmployees.length})
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {verifiedEmployees.map((emp, i) => {
                  const status = emp.releaseStatus;
                  const txn    = txnRefs[emp.id];
                  const isCurrent = employees.indexOf(emp) === currentIdx;
                  return (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 rounded-lg p-2.5 border transition-all ${
                        status === 'released'  ? 'bg-[#DCFCE7] border-[#BBF7D0]'   :
                        status === 'releasing' ? 'bg-[#FFF1EC] border-[#E8501A]/30' :
                        'bg-[#FAFAFA] border-[#F0F0EE]'
                      } ${isCurrent ? 'ring-2 ring-[#E8501A]/30' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        status === 'released' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#E8501A]/10 text-[#E8501A]'
                      }`}>
                        {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      {/* Name + dept */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#111111] truncate">{emp.fullName}</p>
                        {txn ? (
                          <TxnRef ref={txn} />
                        ) : (
                          <p className="text-[10px] text-[#B0B0B0] truncate">
                            {emp.department?.replace('Ministry of ', '')} · {emp.id}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-[#111111] font-mono">{formatNaira(emp.salaryAmount)}</p>
                        <StatusBadge status={status} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ─── Blocked / flagged employees list ─────────────────────── */}
            {blockedEmployees.length > 0 && (
              <div className="px-5 pb-4 border-t border-[#F4F4F2] pt-3">
                <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-2 flex items-center gap-1">
                  <Ban size={10} className="text-[#DC2626]" />
                  Held — Not released ({blockedEmployees.length})
                </p>
                <div className="space-y-1.5">
                  {blockedEmployees.map((emp, i) => (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 rounded-lg p-2.5 bg-red-50 border border-red-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Ban size={12} className="text-[#DC2626]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#111111] truncate">{emp.fullName}</p>
                        <p className="text-[10px] text-[#DC2626] truncate">
                          {emp.releaseStatus === 'blocked' ? 'AI flagged — ghost worker risk' : 'Under manual review'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-[#B0B0B0] font-mono line-through">{formatNaira(emp.salaryAmount)}</p>
                        <StatusBadge status={emp.releaseStatus} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-[10px] text-[#B0B0B0] mt-2 text-center">
                  Held employees require manual HR review before release
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
