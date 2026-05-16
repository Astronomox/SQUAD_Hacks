import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, ShieldAlert, Camera, LogOut, Send } from 'lucide-react';

const NAV = [
  { to: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/payroll',       label: 'Payroll',   icon: Upload },
  { to: '/release',       label: 'Release',   icon: Send },
  { to: '/investigation', label: 'Fraud',     icon: ShieldAlert },
  { to: '/verify',        label: 'Verify',    icon: Camera },
];

export default function BottomNav({ onOpenVerify }) {
  const navigate = useNavigate();

  return (
    <nav
      className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      style={{ width: 'calc(100% - 32px)', maxWidth: 480 }}
    >
      <div
        className="flex items-center justify-around px-2 py-2 rounded-2xl"
        style={{
          background: 'rgba(20, 20, 20, 0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          to === '/verify' ? (
            <button
              key={to}
              onClick={() => onOpenVerify?.()}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] text-white/50 hover:text-white/80"
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-none tracking-wide text-white/40">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] ${
                  isActive
                    ? 'bg-[#E8501A]/20 text-[#FF6B35]'
                    : 'text-white/50 hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    {isActive && (
                      <span className="absolute -inset-1.5 rounded-lg -z-10" style={{ background: 'rgba(232,80,26,0.15)' }} />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium leading-none tracking-wide ${isActive ? 'text-[#FF6B35]' : 'text-white/40'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          )
        ))}

        <button
          onClick={() => navigate('/', { state: { skipLanding: true } })}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[48px] text-white/50 hover:text-[#DC2626] hover:bg-[#DC2626]/10"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="text-[10px] font-medium leading-none tracking-wide text-white/40">Logout</span>
        </button>
      </div>
    </nav>
  );
}