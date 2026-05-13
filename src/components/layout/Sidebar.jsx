import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, ShieldAlert, FileText, Settings, LogOut, Camera, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { to: '/dashboard',     label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/payroll',       label: 'Payroll Upload',    icon: Upload },
  { to: '/investigation', label: 'Fraud Investigation', icon: ShieldAlert, badge: 12 },
  { to: '/audit',         label: 'Audit Trail',       icon: FileText },
];

function Logo({ size = 36 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-lg grid place-items-center font-display font-extrabold text-white shrink-0"
        style={{
          width: size, height: size, fontSize: size * 0.5,
          background: 'linear-gradient(135deg, #E8501A 0%, #FF6B35 100%)',
          boxShadow: '0 6px 14px rgba(232,80,26,.35)',
        }}
      >V</div>
      <div className="leading-none">
        <div className="font-display font-bold text-[15px] text-white">VerifyAI</div>
        <div className="text-[10px] text-sidebar-text/60 mt-1 tracking-[0.12em] font-mono">PAYROLL INTEGRITY</div>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed = false }) {
  const navigate = useNavigate();
  return (
    <aside className={clsx('bg-sidebar text-sidebar-text flex flex-col shrink-0 sidebar-scroll', collapsed ? 'w-[68px]' : 'w-[240px]')}>
      <div className="h-16 px-5 flex items-center border-b border-white/5">
        {collapsed ? <div className="w-9 h-9 rounded-lg bg-brand grid place-items-center font-display font-extrabold text-white">V</div> : <Logo />}
      </div>

      <nav className="p-3 flex flex-col gap-1">
        {!collapsed && <div className="px-3 pt-2 pb-1.5 text-[10.5px] tracking-[0.12em] uppercase text-sidebar-text/40 font-semibold">HR Admin</div>}
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group relative flex items-center gap-3 h-10 rounded-lg text-sm transition focus-ring',
                collapsed ? 'justify-center' : 'px-3',
                isActive
                  ? 'bg-white/5 text-white font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-brand'
                  : 'text-sidebar-text/80 hover:bg-sidebar-hover hover:text-white'
              )
            }
          >
            <Icon size={18} strokeWidth={1.8} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left">{label}</span>}
            {!collapsed && badge && (
              <span className="text-[10.5px] font-mono bg-brand/20 text-brand-hover rounded-md px-1.5 py-0.5">{badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <>
          <div className="px-3 pt-3 pb-1.5 text-[10.5px] tracking-[0.12em] uppercase text-sidebar-text/40 font-semibold">Employee</div>
          <nav className="p-3 pt-0">
            <button
              onClick={() => navigate('/verify')}
              className="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition focus-ring text-sidebar-text/80 hover:bg-sidebar-hover hover:text-white"
            >
              <Camera size={18} strokeWidth={1.8} className="shrink-0" />
              <span className="flex-1 text-left">Verification Portal</span>
              <ChevronRight size={14} className="opacity-50" />
            </button>
          </nav>
        </>
      )}

      <div className="mt-auto">
        {!collapsed && (
          <div className="px-5 py-3 flex items-center gap-2 text-[10.5px] text-sidebar-text/40 font-mono border-t border-white/5">
            <span
              className="inline-grid place-items-center rounded-[3px] font-bold font-display text-brand-hover"
              style={{ width: 13, height: 13, fontSize: 9, background: '#000' }}
            >S</span>
            Payments powered by Squad
          </div>
        )}
        <div className="p-3 border-t border-white/5">
          <div className={clsx('flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-hover', collapsed && 'justify-center')}>
            <div className="w-9 h-9 rounded-full bg-brand-pale text-brand-dark grid place-items-center font-display font-bold text-[13px]">FA</div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">Funmi Adekoya</div>
                  <div className="text-[11px] text-sidebar-text/50 truncate">HR Director · Kogi</div>
                </div>
                <button
                  title="Sign out"
                  onClick={() => navigate('/login')}
                  className="p-1.5 rounded text-sidebar-text/50 hover:bg-white/5 hover:text-white focus-ring"
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
