import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';

export default function AppLayout() {
  return (
    <div className="h-screen flex overflow-hidden bg-ink-100">
      {/* Desktop sidebar — sticky, viewport height, never scrolls the page */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main content — only this area scrolls */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-28 lg:pb-0">
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
