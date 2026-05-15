import React, { useState, useEffect } from 'react';
import Spinner from '../components/ui/Spinner.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, AlertCircle, ShieldAlert, Users } from 'lucide-react';
import { EMPLOYEES } from '../data/employees.js';
import { scanPayroll } from '../utils/aiService.js';
import FlaggedList from '../components/fraud/FlaggedList.jsx';
import InvestigationPanel from '../components/fraud/InvestigationPanel.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function FraudInvestigation() {
  const [scanResult, setScanResult] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [showPanel,  setShowPanel]  = useState(false);

  useEffect(() => {
    const payload = EMPLOYEES.map(e => ({
      id: e.id, salaryAmount: e.salaryAmount,
      enrollmentBatchId: e.enrollmentBatchId, enrollmentDate: e.enrollmentDate,
      lastAttendance: e.lastAttendance, ipAtEnrollment: e.ipAtEnrollment,
      deviceFingerprint: e.deviceFingerprint, department: e.department,
    }));

    scanPayroll(payload)
      .then(result => {
        setScanResult(result);
        const flagged = result.results
          .filter(r => r.riskScore >= 40)
          .sort((a, b) => b.riskScore - a.riskScore);
        if (flagged.length > 0) {
          const emp = EMPLOYEES.find(e => e.id === flagged[0].id);
          setSelected({ ...emp, riskScore: flagged[0].riskScore, aiFlags: flagged[0].flags });
        }
      })
      .catch(err => {
        setError(err.message);
        const fallback = EMPLOYEES.filter(e => e.riskScore >= 40);
        if (fallback.length > 0) setSelected(fallback[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const flaggedEmployees = scanResult
    ? scanResult.results
        .filter(r => r.riskScore >= 40)
        .sort((a, b) => b.riskScore - a.riskScore)
        .map(r => {
          const emp = EMPLOYEES.find(e => e.id === r.id) || {};
          return { ...emp, riskScore: r.riskScore, status: r.status, aiFlags: r.flags };
        })
    : EMPLOYEES.filter(e => e.riskScore >= 40);

  const highRisk = flaggedEmployees.filter(e => e.riskScore >= 70).length;

  const handleSelect = (emp) => {
    setSelected(emp);
    setShowPanel(true);
    // On mobile scroll to top when panel opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      // KEY FIX: on mobile, let the page be a normal flow document (no h-full/overflow-hidden)
      // On desktop (lg+), switch to the split-pane flex layout
      className="flex flex-col lg:h-full lg:overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-4 lg:px-6 py-4 border-b border-[#E4E4E0] bg-white sticky top-0 z-10 flex items-center gap-3">
        {/* Mobile back button when panel is open */}
        <AnimatePresence>
          {showPanel && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={() => setShowPanel(false)}
              className="lg:hidden flex items-center gap-1 text-sm text-[#737373] hover:text-[#111111] transition-colors mr-1 shrink-0"
            >
              <ChevronLeft size={16} /> Back
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-bold text-[#111111]">Fraud Investigation</h1>
          <p className="text-[#737373] text-sm mt-0.5">
            {loading
              ? 'Running AI analysis…'
              : `${flaggedEmployees.length} flagged · ${highRisk} high risk`}
          </p>
        </div>

        {/* Stats pills — desktop only */}
        {!loading && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
              <ShieldAlert size={12} className="text-red-600" />
              <span className="text-xs font-medium text-red-600">{highRisk} High Risk</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
              <Users size={12} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-600">{flaggedEmployees.length} Flagged</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg shrink-0">
            <AlertCircle size={12} />
            <span className="hidden sm:inline">Local fallback</span>
          </div>
        )}
      </div>

      {/* ── Loading state ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-[#737373]">
          <Spinner size={28} />
          <div className="text-center">
            <p className="text-sm font-medium text-[#111111]">Running Isolation Forest</p>
            <p className="text-xs text-[#B0B0B0] mt-1">Analysing {EMPLOYEES.length} employee records…</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── MOBILE LAYOUT — stacked, normal scroll ──────────────────── */}
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              {!showPanel ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  <FlaggedList
                    employees={flaggedEmployees}
                    selected={selected}
                    onSelect={handleSelect}
                    mobile
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.18 }}
                >
                  {selected
                    ? <InvestigationPanel employee={selected} />
                    : (
                      <div className="flex items-center justify-center py-20 text-[#B0B0B0] text-sm">
                        Select an employee
                      </div>
                    )
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── DESKTOP LAYOUT — fixed height split pane ────────────────── */}
          <div className="hidden lg:flex flex-1 overflow-hidden">
            <div className="w-80 shrink-0 border-r border-[#E4E4E0] flex flex-col overflow-hidden">
              <FlaggedList
                employees={flaggedEmployees}
                selected={selected}
                onSelect={(emp) => { setSelected(emp); setShowPanel(true); }}
              />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {selected
                ? <InvestigationPanel employee={selected} />
                : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#B0B0B0]">
                    <ShieldAlert size={32} className="text-[#E4E4E0]" />
                    <p className="text-sm">Select an employee to investigate</p>
                  </div>
                )
              }
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
