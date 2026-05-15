import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { flagsFor } from '../../data/fraudFlags.js';
import RiskGauge from './RiskGauge.jsx';
import FlagCard from './FlagCard.jsx';

function fmt(n) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso) {
  if (!iso) return 'No record';
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function statusChip(status) {
  if (status === 'blocked')  return 'bg-red-50 text-red-600 border border-red-100';
  if (status === 'flagged')  return 'bg-amber-50 text-amber-600 border border-amber-100';
  if (status === 'verified') return 'bg-green-50 text-green-600 border border-green-100';
  return 'bg-gray-50 text-gray-500 border border-gray-100';
}

export default function InvestigationPanel({ employee }) {
  const [action, setAction] = useState(null);

  const flags = employee.aiFlags?.length > 0
    ? employee.aiFlags.map(f => ({ ...f, riskContribution: f.points }))
    : (() => {
        const { flags: localFlags } = flagsFor(employee.id);
        return localFlags.map(f => ({ ...f, riskContribution: f.points }));
      })();

  const handleAction = (type) => setAction(prev => prev === type ? null : type);

  return (
    // On mobile: normal block flow — page scrolls naturally
    // On desktop: flex-1 + overflow-y-auto — pane scrolls inside split layout
    <div className="bg-[#F4F4F2] lg:flex-1 lg:overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-4">

        {/* ── Employee header card ──────────────────────────────────── */}
        <motion.div
          key={employee.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-[#E4E4E0] p-4 lg:p-5"
        >
          {/* Name + status row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-[#111111]">{employee.fullName}</h2>
              <p className="font-mono text-xs text-[#E8501A] mt-0.5">{employee.id}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusChip(employee.status)}`}>
                {employee.status || 'flagged'}
              </span>
              {employee.aiFlags?.length > 0 && (
                <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                  Live AI
                </span>
              )}
            </div>
          </div>

          {/* Details grid + gauge */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-1">
              {[
                ['Department',      employee.department],
                ['Role',            employee.role],
                ['Salary',          fmt(employee.salaryAmount)],
                ['Enrolled',        fmtDate(employee.enrollmentDate)],
                ['Last Attendance', fmtDate(employee.lastAttendance)],
                ['Bank Code',       employee.bankCode || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[9px] text-[#B0B0B0] uppercase tracking-wide font-medium">{label}</p>
                  <p className="text-sm font-medium text-[#111111] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center sm:justify-end">
              <RiskGauge score={employee.riskScore} />
            </div>
          </div>
        </motion.div>

        {/* ── Risk breakdown ────────────────────────────────────────── */}
        {flags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E4E4E0] p-4 lg:p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-[#111111]">Risk Score Breakdown</h3>
            {flags.map((flag, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#4A4A4A]">{flag.title}</span>
                  <span className="font-bold text-red-600">{flag.points} pts</span>
                </div>
                <div className="h-1.5 bg-[#F4F4F2] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (flag.points / 40) * 100)}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: flag.points >= 30
                        ? '#DC2626'
                        : flag.points >= 15
                        ? '#D97706'
                        : '#E8501A',
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[#E4E4E0] flex justify-between text-sm font-bold">
              <span className="text-[#111111]">Total Risk Score</span>
              <span className="text-red-600">{employee.riskScore}/100</span>
            </div>
          </div>
        )}

        {/* ── Flag cards ────────────────────────────────────────────── */}
        {flags.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm text-[#111111]">
              Active Flags ({flags.length})
            </h3>
            {flags.map((flag, i) => (
              <FlagCard
                key={i}
                flag={{
                  ...flag,
                  evidence: flag.evidence
                    ? typeof flag.evidence === 'string'
                      ? flag.evidence
                      : flag.evidence.others
                        ? `Linked: ${flag.evidence.others.slice(0, 4).join(', ')}`
                        : flag.evidence.ip
                          ? `IP: ${flag.evidence.ip}`
                          : null
                    : null,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Timeline ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E4E0] p-4 lg:p-5">
          <h3 className="font-display font-bold text-sm text-[#111111] mb-3">Investigation Timeline</h3>
          <div className="space-y-3">
            {[
              { label: 'AI flagged',   time: 'May 13, 2025 09:14 AM', icon: <AlertTriangle size={12} />, color: 'text-red-600 bg-red-50' },
              { label: 'HR notified',  time: 'May 13, 2025 09:14 AM', icon: <Clock size={12} />,         color: 'text-amber-600 bg-amber-50' },
              { label: 'Under review', time: 'May 13, 2025 10:30 AM', icon: <Clock size={12} />,         color: 'text-blue-600 bg-blue-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-[#4A4A4A] flex-1">{item.label}</span>
                <span className="text-[10px] text-[#B0B0B0] font-mono">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action buttons ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-6 lg:pb-0">
          <button
            onClick={() => handleAction('blocked')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              action === 'blocked'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {action === 'blocked' ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {action === 'blocked' ? 'Payment Blocked' : 'Block Payment'}
          </button>
          <button
            onClick={() => handleAction('escalated')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
              action === 'escalated'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                : 'border-amber-400 text-amber-600 hover:bg-amber-50'
            }`}
          >
            {action === 'escalated' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            {action === 'escalated' ? 'Escalated' : 'Escalate'}
          </button>
          <button
            onClick={() => handleAction('cleared')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
              action === 'cleared'
                ? 'bg-green-600 text-white border-green-600 shadow-md'
                : 'border-green-500 text-green-600 hover:bg-green-50'
            }`}
          >
            {action === 'cleared' ? <CheckCircle size={15} /> : <CheckCircle size={15} />}
            {action === 'cleared' ? 'Flag Cleared' : 'Clear Flag'}
          </button>
        </div>

      </div>
    </div>
  );
}
