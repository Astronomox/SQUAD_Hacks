import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, Download, AlertTriangle, XCircle, Shield, Check } from 'lucide-react';
import Button from '../ui/Button.jsx';
import RiskBadge from '../ui/RiskBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatNaira, maskAccount } from '../../utils/formatters.js';
import { EMPLOYEES } from '../../data/employees.js';

export default function ResultsTable({ scanResult }) {
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  // Merge AI scores from backend with employee records
  const enriched = useMemo(() => {
    if (!scanResult?.results) {
      // Fallback: use local data
      return EMPLOYEES.map(e => ({ ...e, aiFlags: [] }));
    }
    return scanResult.results.map(r => {
      const emp = EMPLOYEES.find(e => e.id === r.id) || {};
      return { ...emp, riskScore: r.riskScore, status: r.status, aiFlags: r.flags || [] };
    });
  }, [scanResult]);

  const flagged  = enriched.filter(e => e.status === 'flagged');
  const blocked  = enriched.filter(e => e.status === 'blocked');
  const verified = enriched.filter(e => e.status === 'verified');

  const FILTER_TABS = [
    { id: 'all',     label: 'All',     count: enriched.length },
    { id: 'flagged', label: 'Flagged', count: flagged.length },
    { id: 'blocked', label: 'Blocked', count: blocked.length },
  ];

  const rows = useMemo(() => {
    const sorted = [...blocked, ...flagged, ...verified.slice(0, 8)];
    if (filter === 'flagged') return flagged;
    if (filter === 'blocked') return blocked;
    return sorted;
  }, [filter, flagged, blocked, verified]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-ink-200 rounded-xl shadow-card overflow-hidden"
    >
      <div className="px-6 py-5 flex items-center justify-between border-b border-ink-200 flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-[17px] text-ink-900">AI Scan Results</h2>
          <p className="text-[12.5px] text-ink-500 mt-1">
            {enriched.length.toLocaleString()} records · {scanResult ? 'Live AI scores' : 'Local fallback'} · sorted by risk
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-ink-100 rounded-lg p-1">
            {FILTER_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`h-8 px-3 rounded-md text-[12.5px] font-medium transition flex items-center gap-1.5
                  ${filter === t.id ? 'bg-white shadow-card text-ink-900' : 'text-ink-700 hover:text-ink-900'}`}
              >
                {t.label}
                <span className="text-[10.5px] font-mono opacity-70">{t.count}</span>
              </button>
            ))}
          </div>
          <Button kind="ghost" size="sm" icon={<Download size={13} />}>Export CSV</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-ink-500 border-b border-ink-200 bg-ink-100/60">
              <th className="font-semibold py-3 px-6">Risk</th>
              <th className="font-semibold py-3 pr-4">Employee</th>
              <th className="font-semibold py-3 pr-4">Department</th>
              <th className="font-semibold py-3 pr-4 text-right">Salary</th>
              <th className="font-semibold py-3 pr-4">Top Flag</th>
              <th className="font-semibold py-3 pr-4">Status</th>
              <th className="font-semibold py-3 pr-6 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isOpen = openId === r.id;
              const tinted = r.status === 'blocked' ? 'bg-bad-pale/40' : r.status === 'flagged' ? 'bg-warn-pale/30' : '';
              const topFlag = r.aiFlags?.[0]?.title || '-';

              return (
                <React.Fragment key={r.id}>
                  <tr
                    className={`border-b border-ink-200 cursor-pointer transition-colors hover:bg-ink-100/60 ${tinted}`}
                    onClick={() => setOpenId(isOpen ? null : r.id)}
                  >
                    <td className="py-3.5 px-6"><RiskBadge score={r.riskScore} size="sm" /></td>
                    <td className="py-3.5 pr-4">
                      <div className="font-medium leading-tight text-ink-900">{r.fullName}</div>
                      <div className="text-[11.5px] font-mono text-ink-500 mt-0.5">{r.id}</div>
                    </td>
                    <td className="py-3.5 pr-4 text-ink-700 text-[13px]">{(r.department || '').replace('Ministry of ', '')}</td>
                    <td className="py-3.5 pr-4 text-right tabular-nums">{formatNaira(r.salaryAmount)}</td>
                    <td className="py-3.5 pr-4 text-[12.5px] text-ink-700">{topFlag}</td>
                    <td className="py-3.5 pr-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 pr-6 text-ink-500">
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  <AnimatePresence initial={false}>
                    {isOpen && r.aiFlags?.length > 0 && (
                      <motion.tr
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-b border-ink-200"
                      >
                        <td colSpan={7} className="bg-ink-100/40 p-0">
                          <FlagExpand employee={r} flags={r.aiFlags} />
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function FlagExpand({ employee, flags }) {
  return (
    <div className="px-6 py-5 grid lg:grid-cols-[1fr_1.2fr] gap-6">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-3">Risk breakdown</div>
        <div className="space-y-2.5">
          {flags.map((f, i) => (
            <div key={i} className="bg-white border border-ink-200 rounded-lg p-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-md grid place-items-center shrink-0
                ${f.points >= 30 ? 'bg-bad-pale text-bad' : f.points >= 20 ? 'bg-warn-pale text-warn' : 'bg-info-pale text-info'}`}>
                <AlertTriangle size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium leading-tight">{f.title}</div>
                <div className="text-[11.5px] text-ink-500 mt-1">{f.detail}</div>
              </div>
              <div className={`font-mono text-[12.5px] font-semibold tabular-nums shrink-0
                ${f.points >= 30 ? 'text-bad' : f.points >= 20 ? 'text-warn' : 'text-info'}`}>
                +{f.points}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-3">Record metadata</div>
        <div className="grid grid-cols-2 gap-px bg-ink-200 rounded-lg overflow-hidden border border-ink-200">
          <Meta label="Employee ID"      value={employee.id} mono />
          <Meta label="Bank account"     value={employee.bankName ? `${employee.bankName} ${maskAccount(employee.bankAccount)}` : '-'} mono />
          <Meta label="Enrollment"       value={employee.enrollmentDate?.slice(0, 16).replace('T', ' ') || '-'} mono />
          <Meta label="Batch"            value={employee.enrollmentBatchId || '-'} mono />
          <Meta label="IP at enrollment" value={employee.ipAtEnrollment || '-'} mono />
          <Meta label="Last attendance"  value={employee.lastAttendance || 'never'} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button kind="danger"  size="sm" icon={<XCircle size={13} />}>Block payment</Button>
          <Button kind="warning" size="sm" icon={<Shield size={13} />}>Escalate</Button>
          <Button kind="success" size="sm" icon={<Check size={13} />}>Clear flag</Button>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, mono }) {
  return (
    <div className="bg-white p-3">
      <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold">{label}</div>
      <div className={`text-[13px] mt-1 text-ink-900 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
