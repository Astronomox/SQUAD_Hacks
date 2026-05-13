import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import StatsBar from '../components/dashboard/StatsBar.jsx';
import DepartmentChart from '../components/dashboard/DepartmentChart.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import PayrollCyclesTable from '../components/dashboard/PayrollCyclesTable.jsx';
import { EMPLOYEES, BLOCKED_EMPLOYEES, FLAGGED_EMPLOYEES, VERIFIED_EMPLOYEES } from '../data/employees.js';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function HRDashboard() {
  const navigate = useNavigate();

  const stats = {
    totalEmployees: EMPLOYEES.length,
    verified:       VERIFIED_EMPLOYEES.length,
    flagged:        FLAGGED_EMPLOYEES.length,
    blocked:        BLOCKED_EMPLOYEES.length,
    leakage:        BLOCKED_EMPLOYEES.reduce((s, e) => s + e.salaryAmount, 0),
  };

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
          <h1 className="font-display text-xl lg:text-2xl font-bold text-ink-900">Dashboard</h1>
          <p className="text-ink-500 text-sm mt-0.5">May 2025 — Kogi State</p>
        </div>
        <button
          onClick={() => navigate('/payroll')}
          className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Payroll</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>

      {/* Stats — 2 cols on mobile, 5 on desktop */}
      <StatsBar stats={stats} />

      {/* Chart + Feed — stack on tablet/mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-card p-4 lg:p-5">
          <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Verification by Department</h2>
          <DepartmentChart />
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 lg:p-5">
          <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Live Activity</h2>
          <ActivityFeed />
        </div>
      </div>

      {/* Recent cycles — scrollable on mobile */}
      <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
        <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Recent Payroll Cycles</h2>
        <div className="overflow-x-auto">
          <PayrollCyclesTable />
        </div>
      </div>
    </motion.div>
  );
}
