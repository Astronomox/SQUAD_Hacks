import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, ShieldAlert, FileText, Camera, ChevronRight, LogOut } from 'lucide-react';
import { GHOST_EMPLOYEES } from '../../data/employees.js';

function VerifyAILogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#1A1A1A"/>
      <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke="#E8501A" strokeWidth="1.5" opacity="0.3"/>
      <polygon points="7,10 16,10 20,17.5 24,10 33,10 20,32" fill="#E8501A"/>
      <polygon points="13.5,10 20,23 26.5,10" fill="#1A1A1A" opacity="0.45"/>
      <circle cx="20" cy="32" r="2" fill="#FF8C5A" opacity="0.8"/>
      <rect x="3" y="3" width="4" height="1.5" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="3" y="3" width="1.5" height="4" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="33" y="3" width="4" height="1.5" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="35.5" y="3" width="1.5" height="4" rx="0.5" fill="#E8501A" opacity="0.5"/>
    </svg>
  );
}

const HR_NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/payroll',       icon: Upload,          label: 'Payroll Upload' },
  { to: '/investigation', icon: ShieldAlert,     label: 'Fraud Investigation', badge: true },
  { to: '/audit',         icon: FileText,        label: 'Audit Trail' },
];

export default function Sidebar({ onOpenVerify, fraudCount }) {
  const navigate = useNavigate();
  const flaggedCount = fraudCount !== null ? fraudCount : GHOST_EMPLOYEES.length;

  return (
    <aside className="w-60 shrink-0 bg-[#111111] flex flex-col overflow-hidden" style={{ height: '100vh', position: 'sticky', top: 0 }}>
      {/* Logo — fixed top */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.07] shrink-0">
        <VerifyAILogo size={36} />
        <div>
          <p className="text-white font-display font-bold text-[15px] leading-none">VerifyAI</p>
          <p className="text-white/30 text-[10px] mt-0.5 uppercase tracking-widest font-mono">Payroll Integrity</p>
        </div>
      </div>

      {/* Nav — scrollable middle */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-scroll min-h-0">
        <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">HR Admin</p>
        {HR_NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#E8501A]/15 text-[#E8501A] border-l-2 border-[#E8501A]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border-l-2 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-[#E8501A]' : ''} />
                <span className="flex-1">{label}</span>
                {badge && flaggedCount > 0 && (
                  <span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {flaggedCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-5">
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Employee</p>
          <button
            onClick={() => onOpenVerify?.()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.04] border-l-2 border-transparent transition-colors"
          >
            <Camera size={16} />
            <span className="flex-1 text-left">Verification Portal</span>
            <ChevronRight size={12} className="opacity-40" />
          </button>
        </div>
      </nav>

      {/* Footer — fixed bottom */}
      <div className="shrink-0 border-t border-white/[0.06]">
        {/* Squad branding */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#E8501A] flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-bold">S</span>
          </div>
          <span className="text-white/25 text-[11px] font-mono">Payments powered by Squad</span>
        </div>

        {/* User profile */}
        <div className="px-4 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8501A]/20 border border-[#E8501A]/30 flex items-center justify-center shrink-0">
            <span className="text-[#E8501A] text-xs font-bold">FA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-[13px] font-medium leading-tight">Funmi Adekoya</p>
            <p className="text-white/30 text-[11px]">HR Director · Kogi</p>
          </div>
          <button
            onClick={() => navigate('/', { state: { skipLanding: true } })}
            className="text-white/25 hover:text-white/60 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
