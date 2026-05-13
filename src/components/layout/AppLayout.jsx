import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex bg-ink-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-28 lg:pb-0">
        <Outlet />
      </div>

      {/* Mobile/tablet glassmorphism bottom nav */}
      <BottomNav />
    </div>
  );
}
