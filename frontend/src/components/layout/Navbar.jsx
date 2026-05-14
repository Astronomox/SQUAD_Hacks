import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

function VerifyAILogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#111111"/>
      <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke="#E8501A" strokeWidth="1.5" opacity="0.3"/>
      <polygon points="7,10 16,10 20,17.5 24,10 33,10 20,32" fill="#E8501A"/>
      <polygon points="13.5,10 20,23 26.5,10" fill="#111111" opacity="0.45"/>
      <circle cx="20" cy="32" r="2" fill="#FF8C5A" opacity="0.8"/>
      <rect x="3" y="3" width="4" height="1.5" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="3" y="3" width="1.5" height="4" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="33" y="3" width="4" height="1.5" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="35.5" y="3" width="1.5" height="4" rx="0.5" fill="#E8501A" opacity="0.5"/>
    </svg>
  );
}

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    '/dashboard':     'HR Dashboard',
    '/payroll':       'Payroll Upload',
    '/investigation': 'Fraud Investigation',
    '/audit':         'Audit Trail',
  };
  const title = titles[location.pathname] || 'VerifyAI';

  return (
    <header className="h-14 bg-white border-b border-[#E4E4E0] flex items-center px-4 lg:px-6 gap-3 shrink-0">

      <div className="flex items-center gap-2.5 lg:hidden">
        <VerifyAILogo size={28} />
        <span className="font-display font-bold text-[#111111] text-base">VerifyAI</span>
      </div>

      <span className="hidden lg:block font-display font-semibold text-[#111111] text-[15px]">{title}</span>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-[#F4F4F2] rounded-lg px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span className="text-xs text-[#4A4A4A] font-medium">admin@verifyai.ng</span>
        </div>
        <button
          onClick={() => navigate('/', { state: { skipLanding: true } })}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-colors text-[#8A8A8A]"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
