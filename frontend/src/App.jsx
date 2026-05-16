import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoginPage             from './pages/LoginPage.jsx';
import HRDashboard           from './pages/HRDashboard.jsx';
import PayrollUpload         from './pages/PayrollUpload.jsx';
import EmployeeVerification  from './pages/EmployeeVerification.jsx';
import FraudInvestigation    from './pages/FraudInvestigation.jsx';
import EmployeeManagement from './pages/EmployeeManagement.jsx';
import AuditTrail            from './pages/AuditTrail.jsx';
import AppLayout             from './components/layout/AppLayout.jsx';

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"        element={<LoginPage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/verify"  element={<EmployeeVerification />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard"      element={<HRDashboard />} />
          <Route path="/payroll"        element={<PayrollUpload />} />
          <Route path="/investigation"  element={<FraudInvestigation />} />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/audit"          element={<AuditTrail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
