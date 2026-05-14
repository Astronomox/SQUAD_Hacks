import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import BottomNav from './BottomNav.jsx';
import VerificationModal from '../verification/VerificationModal.jsx';

export default function AppLayout() {
  const [verifyOpen,  setVerifyOpen]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-ink-100">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar onOpenVerify={() => setVerifyOpen(true)} />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 flex"
            >
              <Sidebar onOpenVerify={() => { setVerifyOpen(true); setSidebarOpen(false); }} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-[-40px] w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
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
