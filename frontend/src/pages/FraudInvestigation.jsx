import React, { useState, useEffect } from 'react';
import Spinner from '../components/ui/Spinner.jsx';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle } from 'lucide-react';
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

  // Fetch real AI scores on mount
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
        // Pre-select highest risk employee
        const flagged = result.results
          .filter(r => r.riskScore >= 40)
          .sort((a, b) => b.riskScore - a.riskScore);
        if (flagged.length > 0) {
          const emp = EMPLOYEES.find(e => e.id === flagged[0].id);
          const aiFlags = flagged[0].flags;
          setSelected({ ...emp, riskScore: flagged[0].riskScore, aiFlags });
        }
      })
      .catch(err => {
        setError(err.message);
        // Fallback to local data
        const fallback = EMPLOYEES.filter(e => e.riskScore >= 40);
        if (fallback.length > 0) setSelected(fallback[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge AI scores into employee records
  const flaggedEmployees = scanResult
    ? scanResult.results
        .filter(r => r.riskScore >= 40)
        .sort((a, b) => b.riskScore - a.riskScore)
        .map(r => {
          const emp = EMPLOYEES.find(e => e.id === r.id) || {};
          return { ...emp, riskScore: r.riskScore, status: r.status, aiFlags: r.flags };
        })
    : EMPLOYEES.filter(e => e.riskScore >= 40);

  const handleSelect = (emp) => {
    setSelected(emp);
    setShowPanel(true);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="px-4 lg:px-6 py-4 border-b border-[#E4E4E0] bg-white flex items-center gap-3">
        {showPanel && (
          <button
            onClick={() => setShowPanel(false)}
            className="lg:hidden flex items-center gap-1 text-sm text-[#737373] hover:text-[#111111] transition-colors mr-1"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-[#111111]">Fraud Investigation</h1>
          <p className="text-[#737373] text-sm mt-0.5">
            {loading ? 'Running AI analysis…' : `${flaggedEmployees.length} employees flagged by AI`}
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <AlertCircle size={12} /> Using local fallback — start AI backend for live scores
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-3 text-[#737373]">
          <Spinner size={24} />
          <span className="text-sm">Running Isolation Forest analysis on {EMPLOYEES.length} records…</span>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className={`lg:flex lg:w-80 lg:shrink-0 ${showPanel ? 'hidden' : 'flex w-full'} flex-col border-r border-[#E4E4E0]`}>
            <FlaggedList employees={flaggedEmployees} selected={selected} onSelect={handleSelect} />
          </div>
          <div className={`lg:flex lg:flex-1 ${showPanel ? 'flex flex-1' : 'hidden'} flex-col overflow-hidden`}>
            {selected
              ? <InvestigationPanel employee={selected} />
              : <div className="flex-1 flex items-center justify-center text-[#B0B0B0] text-sm">Select an employee</div>
            }
          </div>
        </div>
      )}
    </motion.div>
  );
}
