import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Wifi, WifiOff } from 'lucide-react';
import StatsBar from '../components/dashboard/StatsBar.jsx';
import DepartmentChart from '../components/dashboard/DepartmentChart.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import PayrollCyclesTable from '../components/dashboard/PayrollCyclesTable.jsx';
import SquadStatus from '../components/dashboard/SquadStatus.jsx';
import PayrollRelease from '../components/payroll/PayrollRelease.jsx';
import { EMPLOYEES, BLOCKED_EMPLOYEES, FLAGGED_EMPLOYEES, VERIFIED_EMPLOYEES } from '../data/employees.js';
import { analyzePayroll } from '../utils/aiService.js';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function HRDashboard() {
  const navigate = useNavigate();
  const [aiOnline,   setAiOnline]   = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [checking,   setChecking]   = useState(true);

  // Build stats — from scan results if available, else from local data
  const stats = scanResult
    ? {
        totalEmployees: scanResult.total         ?? EMPLOYEES.length,
        verified:       scanResult.verifiedCount  ?? VERIFIED_EMPLOYEES.length,
        flagged:        scanResult.flaggedCount    ?? FLAGGED_EMPLOYEES.length,
        blocked:        scanResult.blockedCount    ?? BLOCKED_EMPLOYEES.length,
        leakage:        BLOCKED_EMPLOYEES.reduce((s, e) => s + (e.salaryAmount || 0), 0),
      }
    : {
        totalEmployees: EMPLOYEES.length,
        verified:       VERIFIED_EMPLOYEES.length,
        flagged:        FLAGGED_EMPLOYEES.length,
        blocked:        BLOCKED_EMPLOYEES.length,
        leakage:        BLOCKED_EMPLOYEES.reduce((s, e) => s + (e.salaryAmount || 0), 0),
      };

  useEffect(() => {
    // Check if AI backend is alive and run a quick scan
    async function init() {
      try {
        const res = await fetch('http://localhost:8000/health', { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          setAiOnline(true);
          // Run scan in background to get live stats
          analyzePayroll(EMPLOYEES.slice(0, 50))
            .then(r => { if (r?.total) setScanResult(r); })
            .catch(() => {});
        }
      } catch {
        setAiOnline(false);
      } finally {
        setChecking(false);
      }
    }
    init();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="p-6 space-y-6"
    >
      {/* ─── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">HR Dashboard</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-ink-500 text-sm">May 2025 payroll cycle — Kogi State</p>
            {!checking && (
              <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                aiOnline ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F4F4F2] text-[#737373]'
              }`}>
                {aiOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                {aiOnline ? 'AI Engine Online' : 'AI Engine Offline'}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/payroll')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Payroll
        </button>
      </div>

      {/* ─── Stats bar ────────────────────────────────────────────────── */}
      <StatsBar stats={stats} />

      {/* ─── Charts + Activity ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-card p-5">
          <h2 className="font-display font-bold text-sm text-ink-900 mb-4">
            Verification Status by Department
          </h2>
          <DepartmentChart scanResult={scanResult} />
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Live Activity</h2>
          <ActivityFeed scanResult={scanResult} />
        </div>
      </div>

      {/* ─── Payroll Release panel ────────────────────────────────────── */}
      <PayrollRelease />

      {/* ─── Squad Status ─────────────────────────────────────────────── */}
      <SquadStatus />

      {/* ─── Payroll cycles table ─────────────────────────────────────── */}
      <PayrollCyclesTable scanResult={scanResult} />
    </motion.div>
  );
}
