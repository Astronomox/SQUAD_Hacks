import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import VerificationModal from '../verification/VerificationModal.jsx';

export default function AppLayout() {
  const [verifyOpen, setVerifyOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-ink-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar onOpenVerify={() => setVerifyOpen(true)} />
      </div>

      {/* Main content — only this scrolls */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-28 lg:pb-0">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav onOpenVerify={() => setVerifyOpen(true)} />

      {/* Verification modal — shared across admin portal */}
      <VerificationModal open={verifyOpen} onClose={() => setVerifyOpen(false)} />
    </div>
  );
}
