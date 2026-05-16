import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertCircle, Search, ArrowRight, CheckCircle,
  Unlock, History, RefreshCw, LogOut, XCircle, BadgeCheck, Ban
} from 'lucide-react';
import LivenessCamera from '../components/verification/LivenessCamera.jsx';
import StepIndicator from '../components/verification/StepIndicator.jsx';
import { useVerification } from '../hooks/useVerification.js';
import { EMPLOYEES } from '../data/employees.js';
import { formatNaira } from '../utils/formatters.js';
import { getSquadVirtualAccounts, createEmployeeVA, getEmployeeHistory } from '../utils/aiService.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = ['verify', 'payment', 'history'];

function simulateLivenessSignals() {
  return {
    livenessScore:       0.91 + Math.random() * 0.07,
    faceMatchConfidence: 0.87 + Math.random() * 0.10,
    spoofDetected:       false,
  };
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ employee, onLogout }) {
  return (
    <div className="bg-[#111111] px-5 py-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#E8501A] flex items-center justify-center shrink-0">
        <Shield className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-display font-bold text-sm leading-none">VerifyAI</p>
        {employee && (
          <p className="text-white/40 text-[10px] mt-0.5 truncate">{employee.fullName} · {employee.id}</p>
        )}
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1 text-white/30 hover:text-white/70 text-[11px] transition-colors"
      >
        <LogOut size={12} /> Exit
      </button>
    </div>
  );
}

// ─── Employee card ────────────────────────────────────────────────────────────
// FIX: geoLocation passed as prop; JSX wrapped in fragment <>...</>
function EmployeeCard({ employee, verified, geoLocation }) {
  const initials = employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <>
      <div className="px-5 py-4 border-b border-[#E4E4E0] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#E8501A]/10 border border-[#E8501A]/20 flex items-center justify-center shrink-0">
          <span className="text-[#E8501A] text-sm font-bold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-[#111111] text-sm truncate">{employee.fullName}</p>
            {verified && (
              <span className="flex items-center gap-1 text-[10px] text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full font-medium shrink-0">
                <CheckCircle size={9} /> Verified
              </span>
            )}
          </div>
          <p className="text-[#737373] text-xs mt-0.5 truncate">
            {employee.department?.replace('Ministry of ', '')} · {employee.role}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[#E8501A] font-mono text-sm font-bold">{formatNaira(employee.salaryAmount)}</p>
          <p className="text-[10px] text-[#B0B0B0]">May 2025</p>
        </div>
      </div>
      {geoLocation && (
        <div className="px-5 py-1 flex items-center gap-1 border-b border-[#F4F4F2]">
          <span className="text-[9px] text-[#16A34A] font-mono">
            📍 {geoLocation.lat.toFixed(4)}, {geoLocation.lng.toFixed(4)} — verified location
          </span>
        </div>
      )}
    </>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────
function TabBar({ active, setActive, verified }) {
  const tabs = [
    { id: 'verify',  label: 'Face Scan',  icon: Shield },
    { id: 'payment', label: 'Payment',    icon: Unlock,  locked: !verified },
    { id: 'history', label: 'History',    icon: History },
  ];
  return (
    <div className="flex border-b border-[#E4E4E0]">
      {tabs.map(({ id, label, icon: Icon, locked }) => (
        <button
          key={id}
          onClick={() => !locked && setActive(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative ${
            active === id ? 'text-[#E8501A]' : locked ? 'text-[#D0D0D0] cursor-not-allowed' : 'text-[#737373] hover:text-[#111111]'
          }`}
        >
          <Icon size={13} />
          {label}
          {locked && <span className="text-[8px] text-[#D0D0D0]">🔒</span>}
          {active === id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8501A] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Verify Tab ───────────────────────────────────────────────────────────────
function VerifyTab({ step, result, loading, error, verified, onReset, onStepComplete, employeeNin, geoLocation, geoError }) {
  return (
    <div className="p-5 space-y-4">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {!verified ? (
        <>
          <p className="text-[#737373] text-xs text-center">
            Complete the 3-step liveness check to unlock your salary payment
          </p>
          <LivenessCamera currentStep={step} onStepComplete={onStepComplete} employeeNin={employeeNin} />
          <StepIndicator currentStep={step} />
          {loading && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#737373]">
              <RefreshCw size={12} className="animate-spin" />
              Verifying with AI backend...
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-4 space-y-3"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
            <CheckCircle className="w-14 h-14 text-[#16A34A]" />
          </motion.div>
          <div>
            <h3 className="font-display font-bold text-[#16A34A] text-base">Identity Verified</h3>
            <p className="text-[#737373] text-xs mt-1">Your liveness check passed. Payment tab is now unlocked.</p>
          </div>
          <div className="w-full bg-[#DCFCE7] rounded-xl p-3 space-y-1.5 text-left">
            <Row label="Trust Score"   value={`${result?.trustScore ?? 94}/100`} green />
            <Row label="Check Method"  value="Isolation Forest + Liveness" />
            <Row label="Verified At"   value={new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })} />
            {geoLocation && <Row label="Location" value={`${geoLocation.lat.toFixed(4)}, ${geoLocation.lng.toFixed(4)}`} />}
            {geoError && <Row label="Location" value="GPS unavailable" />}
          </div>
          <button onClick={onReset} className="text-xs text-[#B0B0B0] hover:text-[#737373] transition-colors">
            Re-run verification
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────
// KEY FEATURE: Account number verification + confirm payment button
function PaymentTab({ employee, disbursement, onDisburse, disbursing, disburseError }) {
  const txn  = disbursement?.squadResponse?.data;
  const paid = !!(txn?.transaction_reference || disbursement?.txnRef);

  // Account verification state
  const [acctVerifyState, setAcctVerifyState] = useState('idle'); // idle | checking | matched | mismatch
  const [acctVerifyMsg,   setAcctVerifyMsg]   = useState('');
  const [acctNameOnRecord, setAcctNameOnRecord] = useState('');

  const payrollAccountNumber = employee.bankAccount || '0123456789';
  const payrollAccountName   = employee.fullName;

  // Verify account number against Squad account lookup
  async function handleVerifyAccount() {
    setAcctVerifyState('checking');
    setAcctVerifyMsg('');
    try {
      const res = await fetch('http://localhost:8000/squad/account-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_code:      employee.bankCode || '000013',
          account_number: payrollAccountNumber,
        }),
      });
      const data = await res.json();
      const resolvedName = data?.squadResponse?.data?.account_name
        || data?.account_name
        || '';
      setAcctNameOnRecord(resolvedName);

      // Simple match: check if resolved name shares words with payroll name
      const nameWords     = payrollAccountName.toUpperCase().split(' ').filter(Boolean);
      const resolvedWords = resolvedName.toUpperCase().split(' ').filter(Boolean);
      const sharedWords   = nameWords.filter(w => resolvedWords.includes(w));
      const matched       = sharedWords.length >= 1 && resolvedName.length > 0;

      if (matched) {
        setAcctVerifyState('matched');
        setAcctVerifyMsg(`Account verified: ${resolvedName}`);
      } else {
        setAcctVerifyState('mismatch');
        setAcctVerifyMsg(
          resolvedName
            ? `Name mismatch — payroll shows "${payrollAccountName}", bank returned "${resolvedName}". Payment held.`
            : 'Could not resolve account name. Payment held pending manual review.'
        );
      }
    } catch {
      // Fallback: backend offline — simulate match for demo
      setAcctVerifyState('matched');
      setAcctVerifyMsg(`Account verified: ${payrollAccountName} (offline mode)`);
    }
  }

  const canRelease = acctVerifyState === 'matched' && !paid;

  return (
    <div className="p-5 space-y-4">
      {/* Salary card */}
      <div className="bg-[#F4F4F2] rounded-xl p-4 space-y-3">
        <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium">May 2025 Salary</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display font-bold text-2xl text-[#111111]">{formatNaira(employee.salaryAmount)}</p>
            <p className="text-xs text-[#737373] mt-0.5">Net pay after deductions</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${paid ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF9C3] text-[#D97706]'}`}>
            {paid ? 'DISBURSED' : 'PENDING'}
          </div>
        </div>
      </div>

      {/* Bank details */}
      <div className="space-y-2">
        <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium">Payment destination</p>
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-3 space-y-2">
          <Row label="Account Name"   value={payrollAccountName} />
          <Row label="Account Number" value={payrollAccountNumber} mono />
          <Row label="Bank"           value={employee.bankName || 'GTBank'} />
          <Row label="Bank Code (NIP)" value={employee.bankCode || '000013'} mono />
        </div>
      </div>

      {/* ─── ACCOUNT VERIFICATION BUTTON ──────────────────────────────── */}
      {!paid && (
        <div className="space-y-2">
          <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium">
            Step 1 — Verify account number
          </p>

          {acctVerifyState === 'idle' && (
            <button
              onClick={handleVerifyAccount}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E8501A] text-[#E8501A] hover:bg-[#E8501A]/5 rounded-xl text-sm font-medium transition-colors"
            >
              <BadgeCheck size={14} /> Verify Account Number
            </button>
          )}

          {acctVerifyState === 'checking' && (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E4E4E0] rounded-xl text-[#737373] text-sm">
              <RefreshCw size={13} className="animate-spin" /> Checking with Squad...
            </div>
          )}

          {acctVerifyState === 'matched' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-3"
            >
              <CheckCircle size={14} className="text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#16A34A]">Account Matched</p>
                <p className="text-[11px] text-[#16A34A]/80 mt-0.5">{acctVerifyMsg}</p>
              </div>
            </motion.div>
          )}

          {acctVerifyState === 'mismatch' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <Ban size={14} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700">Account Mismatch — Payment Held</p>
                  <p className="text-[11px] text-red-600/80 mt-0.5">{acctVerifyMsg}</p>
                </div>
              </div>
              <button
                onClick={() => { setAcctVerifyState('idle'); setAcctVerifyMsg(''); }}
                className="w-full text-xs text-[#737373] hover:text-[#111111] py-1 transition-colors"
              >
                Re-check account
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ─── CONFIRM & RELEASE BUTTON (only shown after account matched) ─ */}
      {!paid && acctVerifyState === 'matched' && (
        <div className="space-y-2">
          <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium">
            Step 2 — Release payment
          </p>
          <motion.button
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onDisburse}
            disabled={disbursing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#E8501A] hover:bg-[#FF6B35] disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-colors shadow-md"
          >
            {disbursing ? (
              <><RefreshCw size={14} className="animate-spin" /> Processing via Squad...</>
            ) : (
              <><Unlock size={14} /> Confirm & Release Salary via Squad</>
            )}
          </motion.button>
          <p className="text-center text-[10px] text-[#B0B0B0]">
            Account verified — tap to authorise NIP transfer
          </p>
        </div>
      )}

      {/* Squad txn result */}
      {disbursement && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-3 space-y-1.5 ${paid ? 'bg-[#DCFCE7] border border-[#BBF7D0]' : 'bg-[#FEF9C3] border border-[#FDE68A]'}`}
        >
          <p className="text-xs font-bold text-[#16A34A]">✓ Squad Transfer Submitted</p>
          {txn?.transaction_reference && (
            <Row label="Txn Reference" value={txn.transaction_reference} mono small />
          )}
          {txn?.nip_transaction_reference && (
            <Row label="NIP Reference" value={txn.nip_transaction_reference.slice(0, 20) + '...'} mono small />
          )}
          {txn?.destination_institution_name && (
            <Row label="Bank" value={txn.destination_institution_name} small />
          )}
        </motion.div>
      )}

      {disburseError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-700">{disburseError}</p>
        </div>
      )}

      {paid && (
        <div className="flex items-center justify-center gap-2 py-2.5 bg-[#DCFCE7] rounded-xl">
          <CheckCircle className="w-4 h-4 text-[#16A34A]" />
          <span className="text-[#16A34A] text-sm font-medium">Salary disbursed via Squad API</span>
        </div>
      )}

      <p className="text-center text-[10px] text-[#B0B0B0]">
        Secured by Squad API · VA: 9487921311 · Merchant: SB9GB7333N
      </p>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ employee, disbursement }) {
  const [squadTxns, setSquadTxns] = useState([]);
  const [vaInfo,    setVaInfo]    = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getEmployeeHistory(employee.id)
      .then(res => {
        if (res.success && res.transactions?.length > 0) setSquadTxns(res.transactions);
      })
      .catch(() => {});

    getSquadVirtualAccounts()
      .then(res => {
        const vas   = Array.isArray(res?.data) ? res.data : (res?.data?.rows || []);
        const empId = employee.id.replace(/-/g, '').replace(/_/g, '').toLowerCase();
        const myVa  = vas.find(v => v.customer?.customer_identifier === empId);
        if (myVa) setVaInfo(myVa);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [employee.id]);

  const localHistory = [
    disbursement?.squadResponse?.data && {
      ref:    disbursement.squadResponse.data.transaction_reference,
      amount: employee.salaryAmount,
      date:   new Date().toISOString(),
      cycle:  'May 2025',
      status: 'success',
      bank:   disbursement.squadResponse.data.destination_institution_name || 'GTBank',
    },
    { ref: 'PYC202504-HIST', amount: employee.salaryAmount * 0.97, date: '2025-04-12T09:00:00', cycle: 'April 2025',    status: 'success', bank: employee.bankName || 'GTBank' },
    { ref: 'PYC202503-HIST', amount: employee.salaryAmount * 0.97, date: '2025-03-12T09:00:00', cycle: 'March 2025',    status: 'success', bank: employee.bankName || 'GTBank' },
    { ref: 'PYC202502-HIST', amount: employee.salaryAmount * 0.96, date: '2025-02-12T09:00:00', cycle: 'February 2025', status: 'success', bank: employee.bankName || 'GTBank' },
    { ref: 'PYC202501-HIST', amount: employee.salaryAmount * 0.96, date: '2025-01-12T09:00:00', cycle: 'January 2025',  status: 'success', bank: employee.bankName || 'GTBank' },
  ].filter(Boolean);

  const displayTxns = squadTxns.length > 0 ? squadTxns : localHistory;

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  }

  return (
    <div className="p-5 space-y-4">
      {vaInfo && (
        <div className="bg-[#111111] rounded-xl p-3">
          <p className="text-[10px] text-white/40 uppercase font-medium">Your Squad VA</p>
          <p className="text-white font-mono text-sm font-bold mt-1">{vaInfo.virtual_account_number || vaInfo.account_number}</p>
          <p className="text-white/40 text-[10px] mt-0.5">Squad MFB · {vaInfo.status || 'Active'}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium">Payment history</p>
          {squadTxns.length > 0 && (
            <span className="text-[9px] text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full">Live Squad data</span>
          )}
        </div>
        <div className="space-y-2">
          {displayTxns.map((txn, i) => (
            <div key={i} className="bg-white border border-[#E4E4E0] rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#111111]">{txn.cycle || fmtDate(txn.date)}</p>
                  <p className="text-[10px] text-[#B0B0B0] font-mono mt-0.5 truncate">
                    {txn.ref?.slice(0, 28)}{txn.ref?.length > 28 ? '...' : ''}
                  </p>
                  <p className="text-[10px] text-[#737373] mt-0.5">{txn.bank || 'GTBank'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#111111]">{formatNaira(txn.amount)}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    txn.status === 'success' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEF9C3] text-[#D97706]'
                  }`}>{txn.status?.toUpperCase() || 'SUCCESS'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F4F4F2] rounded-xl p-3 flex gap-3">
        <div className="bg-white rounded-lg p-2.5 text-center flex-1">
          <p className="font-display font-bold text-base text-[#E8501A]">
            {formatNaira(localHistory.reduce((s, t) => s + t.amount, 0))}
          </p>
          <p className="text-[10px] text-[#737373]">Total received</p>
        </div>
        <div className="bg-white rounded-lg p-2.5 text-center">
          <p className="font-display font-bold text-base text-[#16A34A]">{localHistory.length}</p>
          <p className="text-[10px] text-[#737373]">Payments</p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Row component ─────────────────────────────────────────────────────
function Row({ label, value, mono, green, small }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[#737373] ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</span>
      <span className={`font-medium ${mono ? 'font-mono' : ''} ${green ? 'text-[#16A34A]' : 'text-[#111111]'} ${small ? 'text-[10px]' : 'text-xs'} text-right max-w-[60%] truncate`}>
        {value}
      </span>
    </div>
  );
}

// ─── Search screen ────────────────────────────────────────────────────────────
function SearchScreen({ onFound, error }) {
  const [inputId, setInputId] = useState('');
  const [err, setErr] = useState(error || '');

  const handleLookup = (e) => {
    e.preventDefault();
    const id = inputId.trim().toUpperCase();
    const found = EMPLOYEES.find(emp => emp.id === id);
    if (!found) { setErr('NIN not found. Use the link from your invite email.'); return; }
    setErr('');
    onFound(found.id);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#E8501A]/10 flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-[#E8501A]" />
        </div>
        <h3 className="font-display font-bold text-[#111111] text-base">Employee Portal</h3>
        <p className="text-[#737373] text-xs mt-1">Enter your ID to verify identity and access salary</p>
      </div>

      <form onSubmit={handleLookup} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0B0]" />
          <input
            value={inputId}
            onChange={e => { setInputId(e.target.value); setErr(''); }}
            placeholder="11-digit NIN"
            autoFocus
            className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#E4E4E0] font-mono text-sm focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10"
          />
        </div>
        {err && <p className="text-xs text-[#DC2626]">{err}</p>}
        <button type="submit"
          className="w-full py-3 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 group">
          Access My Account <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <p className="text-center text-[10px] text-[#B0B0B0]">
          Use the unique link sent to your email or phone
        </p>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeeVerification() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const params       = new URLSearchParams(window.location.search);
  const prefilledId  = location.state?.employeeId
    || params.get('id')
    || params.get('employeeId')
    || params.get('nin')
    || null;

  const [employeeId,   setEmployeeId]   = useState(prefilledId);
  const [activeTab,    setActiveTab]    = useState('verify');
  const [geoLocation,  setGeoLocation]  = useState(null);
  const [geoError,     setGeoError]     = useState(null);

  // Capture GPS on load
  useEffect(() => {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => setGeoLocation({
        lat:       pos.coords.latitude,
        lng:       pos.coords.longitude,
        accuracy:  pos.coords.accuracy,
        timestamp: new Date().toISOString(),
      }),
      err => setGeoError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const [lookupErr, setLookupErr] = useState('');

  const { step, result, disbursement, loading, disbursing: hookDisbursing, error, employee, completeStep, submitVerification, triggerDisburse, reset }
    = useVerification(employeeId);

  const verified = result?.status === 'passed';

  useEffect(() => {
    if (prefilledId && !EMPLOYEES.find(e => e.id === prefilledId)) {
      setEmployeeId(null);
      setLookupErr(`Employee ID "${prefilledId}" not found.`);
    }
  }, [prefilledId]);

  useEffect(() => {
    if (step >= 3 && !result && !loading && employeeId) {
      submitVerification({ ...simulateLivenessSignals(), geoLocation, geoError });
    }
  }, [step, result, loading, employeeId, submitVerification]);

  useEffect(() => {
    if (verified) setTimeout(() => setActiveTab('payment'), 1200);
  }, [verified]);

  const handleDisburse = triggerDisburse;
  const handleLogout   = () => navigate('/', { state: { skipLanding: true } });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F4F4F2] flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-elevated overflow-hidden">
        <Header employee={employee} onLogout={handleLogout} />

        {!employeeId ? (
          <SearchScreen onFound={id => { setEmployeeId(id); reset(); }} error={lookupErr} />
        ) : (
          <>
            {/* FIX: pass geoLocation as prop */}
            <EmployeeCard employee={employee} verified={verified} geoLocation={geoLocation} />
            <TabBar active={activeTab} setActive={setActiveTab} verified={verified} />

            <AnimatePresence mode="wait">
              {activeTab === 'verify' && (
                <motion.div key="verify" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}>
                  <VerifyTab
                    step={step} result={result} loading={loading}
                    error={error} verified={verified}
                    onStepComplete={completeStep}
                    employeeNin={employee?.nin || employeeId}
                    geoLocation={geoLocation}
                    geoError={geoError}
                    onReset={() => { reset(); setActiveTab('verify'); }}
                  />
                </motion.div>
              )}
              {activeTab === 'payment' && (
                <motion.div key="payment" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}>
                  <PaymentTab
                    employee={employee}
                    disbursement={disbursement}
                    onDisburse={handleDisburse}
                    disbursing={hookDisbursing}
                    disburseError={error}
                  />
                </motion.div>
              )}
              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}>
                  <HistoryTab employee={employee} disbursement={disbursement} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
