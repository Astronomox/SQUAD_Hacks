import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import BottomNav from './BottomNav.jsx';
import VerificationModal from '../verification/VerificationModal.jsx';

export default function AppLayout() {
  const [verifyOpen,  setVerifyOpen]  = useState(false);
  const [fraudCount,  setFraudCount]  = useState(null); // null = use local fallback

  return (
    <div className="h-screen flex overflow-hidden bg-ink-100">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar onOpenVerify={() => setVerifyOpen(true)} fraudCount={fraudCount} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto pb-28 lg:pb-0">
          <Outlet />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav onOpenVerify={() => setVerifyOpen(true)} />

      {/* Verification modal */}
      <VerificationModal open={verifyOpen} onClose={() => setVerifyOpen(false)} />
    </div>
  );
}
