import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { flagsFor } from '../../data/fraudFlags.js';
import RiskGauge from './RiskGauge.jsx';
import FlagCard from './FlagCard.jsx';

function fmt(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso) {
  if (!iso) return 'No record';
  try { return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function InvestigationPanel({ employee }) {
  const [action, setAction] = useState(null);
  const { flags } = flagsFor(employee.id);

  const handleAction = (type) => {
    setAction(type);
    setTimeout(() => setAction(null), 3000);
  };

  return (
    <motion.div
      key={employee.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 overflow-y-auto bg-[#F4F4F2] p-6 space-y-5"
    >
      {/* Employee header */}
      <div className="bg-white rounded-xl shadow-card p-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-1 min-w-0">
          {[
            ['Employee ID', employee.id, true],
            ['Department',  employee.department, false],
            ['Role',        employee.role, false],
            ['Salary',      fmt(employee.salaryAmount), false],
            ['Enrolled',    fmtDate(employee.enrollmentDate), false],
            ['Last Attendance', fmtDate(employee.lastAttendance), false],
          ].map(([label, value, mono]) => (
            <div key={label}>
              <p className="text-[10px] text-[#B0B0B0] uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-medium text-[#111111] mt-0.5 ${mono ? 'font-mono text-[#E8501A]' : ''}`}>{value}</p>
            </div>
          ))}
        </div>
        <RiskGauge score={employee.riskScore} />
      </div>

      {/* Risk breakdown bars */}
      {flags.length > 0 && (
        <div className="bg-white rounded-xl shadow-card p-5 space-y-3">
          <h3 className="font-display font-bold text-sm text-[#111111]">Risk Score Breakdown</h3>
          {flags.map((flag, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#4A4A4A]">{flag.title}</span>
                <span className="font-medium text-[#DC2626]">{flag.points} pts</span>
              </div>
              <div className="h-1.5 bg-[#F4F4F2] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (flag.points / 40) * 100)}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="h-full bg-[#DC2626] rounded-full"
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[#E4E4E0] flex justify-between text-sm font-bold">
            <span className="text-[#111111]">Total Risk Score</span>
            <span className="text-[#DC2626]">{employee.riskScore}/100</span>
          </div>
        </div>
      )}

      {/* Flag cards */}
      {flags.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-[#111111]">Active Flags ({flags.length})</h3>
          {flags.map((flag, i) => (
            <FlagCard
              key={i}
              flag={{
                ...flag,
                riskContribution: flag.points,
                evidence: flag.evidence
                  ? typeof flag.evidence === 'string'
                    ? flag.evidence
                    : flag.evidence.others
                      ? `Linked employees: ${flag.evidence.others.slice(0, 4).join(', ')}`
                      : flag.evidence.ip
                        ? `IP: ${flag.evidence.ip}`
                        : JSON.stringify(flag.evidence).slice(0, 80)
                  : null,
              }}
            />
          ))}
        </div>
      )}

      {/* Investigation timeline */}
      <div className="bg-white rounded-xl shadow-card p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-[#111111]">Investigation Timeline</h3>
        {[
          { label: 'AI flagged',    time: 'May 13, 2025  09:14 AM', color: '#DC2626' },
          { label: 'HR notified',   time: 'May 13, 2025  09:14 AM', color: '#D97706' },
          { label: 'Under review',  time: 'May 13, 2025  10:30 AM', color: '#2563EB' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-[#4A4A4A] font-medium">{item.label}</span>
            <span className="text-[#B0B0B0] font-mono ml-auto">{item.time}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => handleAction('blocked')}
          className="flex-1 min-w-[120px] py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {action === 'blocked' ? '✓ Payment Blocked' : 'Block Payment'}
        </button>
        <button
          onClick={() => handleAction('escalated')}
          className="flex-1 min-w-[120px] py-2.5 border border-[#D97706] text-[#D97706] hover:bg-[#FEF9C3] rounded-lg text-sm font-medium transition-colors"
        >
          {action === 'escalated' ? '✓ Escalated' : 'Escalate to Auditor'}
        </button>
        <button
          onClick={() => handleAction('cleared')}
          className="flex-1 min-w-[120px] py-2.5 border border-[#16A34A] text-[#16A34A] hover:bg-[#DCFCE7] rounded-lg text-sm font-medium transition-colors"
        >
          {action === 'cleared' ? '✓ Cleared' : 'Clear Flag'}
        </button>
      </div>
    </motion.div>
  );
}
