import React, { useEffect, useState } from 'react';
import Spinner from '../components/ui/Spinner.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import StatsBar from '../components/dashboard/StatsBar.jsx';
import DepartmentChart from '../components/dashboard/DepartmentChart.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import PayrollCyclesTable from '../components/dashboard/PayrollCyclesTable.jsx';
import SquadStatus from '../components/dashboard/SquadStatus.jsx';
import { EMPLOYEES } from '../data/employees.js';
import { scanPayroll, checkHealth } from '../utils/aiService.js';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function HRDashboard() {
  const navigate = useNavigate();
  const [stats,         setStats]         = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [scanResult,    setScanResult]    = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const payload = EMPLOYEES.map(e => ({
      id: e.id, salaryAmount: e.salaryAmount,
      enrollmentBatchId: e.enrollmentBatchId, enrollmentDate: e.enrollmentDate,
      lastAttendance: e.lastAttendance, ipAtEnrollment: e.ipAtEnrollment,
      deviceFingerprint: e.deviceFingerprint, department: e.department,
    }));

    checkHealth()
      .then(() => {
        setBackendOnline(true);
        return scanPayroll(payload);
      })
      .then(result => {
        setScanResult(result);
        const verified = result.results.filter(r => r.status === 'verified');
        const flagged  = result.results.filter(r => r.status === 'flagged');
        const blocked  = result.results.filter(r => r.status === 'blocked');
        setStats({
          totalEmployees: result.total,
          verified:       verified.length,
          flagged:        flagged.length,
          blocked:        blocked.length,
          leakage:        result.leakagePrevented,
        });
      })
      .catch(() => {
        // Backend offline — derive stats from local data only as last resort
        setStats({
          totalEmployees: EMPLOYEES.length,
          verified:       EMPLOYEES.filter(e => e.status === 'verified').length,
          flagged:        EMPLOYEES.filter(e => e.status === 'flagged').length,
          blocked:        EMPLOYEES.filter(e => e.status === 'blocked').length,
          leakage:        EMPLOYEES.filter(e => e._pattern).reduce((s, e) => s + e.salaryAmount, 0),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="p-4 lg:p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-bold text-ink-900">Dashboard</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-ink-500 text-sm">May 2025 - Kogi State</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
              backendOnline ? 'bg-ok-pale text-ok' : 'bg-warn-pale text-warn'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-ok' : 'bg-warn'}`} />
              {backendOnline ? 'AI Engine Online' : 'AI Engine Offline'}
            </span>
          </div>
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

      {loading ? (
        <div className="flex items-center gap-2 text-ink-500 text-sm py-4">
          <Spinner size={24} />
          Running AI scan - fetching live stats...
        </div>
      ) : (
        <StatsBar stats={stats} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-card p-4 lg:p-5">
          <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Verification by Department</h2>
          <DepartmentChart scanResult={scanResult} />
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 lg:p-5">
          <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Live Activity</h2>
          <ActivityFeed scanResult={scanResult} />
        </div>
      </div>

      <SquadStatus />

      <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
        <h2 className="font-display font-bold text-sm text-ink-900 mb-4">Recent Payroll Cycles</h2>
        <div className="overflow-x-auto">
          <PayrollCyclesTable scanResult={scanResult} />
        </div>
      </div>
    </motion.div>
  );
}
