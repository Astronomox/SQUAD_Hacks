import React from 'react';
import { Search, Bell, Menu, Download } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function Navbar({ title, subtitle, actions, onToggleSidebar }) {
  return (
    <header className="h-16 px-6 lg:px-8 bg-white border-b border-ink-200 flex items-center gap-4 shrink-0">
      <button onClick={onToggleSidebar} className="lg:hidden w-9 h-9 grid place-items-center rounded-lg hover:bg-ink-100 -ml-2">
        <Menu size={18} />
      </button>

      <div className="min-w-0">
        <h1 className="font-display font-bold text-[19px] leading-tight truncate text-ink-900">{title}</h1>
        {subtitle && <div className="text-[12.5px] text-ink-500 leading-tight mt-0.5 truncate">{subtitle}</div>}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {actions}

        <div className="hidden md:flex items-center h-10 w-[260px] px-3 rounded-lg border border-ink-200 bg-ink-100 text-ink-500 text-sm gap-2">
          <Search size={15} />
          <span className="text-[13px]">Search employee, ID, batch…</span>
          <kbd className="ml-auto text-[10.5px] bg-white border border-ink-200 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </div>

        <button className="relative w-10 h-10 grid place-items-center rounded-lg border border-ink-200 bg-white text-ink-700 hover:bg-ink-100 focus-ring">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
