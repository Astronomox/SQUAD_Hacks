import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingDown, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [portal, setPortal] = useState('hr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHRLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    navigate('/dashboard');
  };

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate('/verify');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#111111] flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#E8501A] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-display text-xl font-700">VerifyAI</span>
        </div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white font-display text-4xl font-bold leading-tight mb-6"
          >
            Every Naira reaches a living worker.
          </motion.h1>

          <div className="space-y-3">
            {[
              { icon: TrendingDown, text: '₦200B+ lost annually to ghost workers' },
              { icon: Users, text: '37% of ministries have undetected fraud' },
              { icon: CheckCircle, text: 'VerifyAI catches fraud before payment' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3"
              >
                <item.icon className="w-4 h-4 text-[#E8501A] shrink-0" />
                <span className="text-gray-300 text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E8501A]" />
          <span className="text-gray-500 text-xs">Powered by Squad API</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#F4F4F2] p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#E8501A] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-[#111111]">VerifyAI</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-[#111111] mb-1">Welcome back</h2>
          <p className="text-[#737373] text-sm mb-6">Sign in to your portal</p>

          {/* Portal toggle */}
          <div className="flex gap-1 bg-white rounded-lg p-1 mb-6 shadow-card border border-[#E4E4E0]">
            {['hr', 'employee'].map((p) => (
              <button
                key={p}
                onClick={() => setPortal(p)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  portal === p
                    ? 'bg-[#E8501A] text-white shadow-sm'
                    : 'text-[#737373] hover:text-[#111111]'
                }`}
              >
                {p === 'hr' ? 'HR Admin' : 'Employee Verify'}
              </button>
            ))}
          </div>

          {portal === 'hr' ? (
            <form onSubmit={handleHRLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@verifyai.ng"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E4E4E0] bg-white text-[#111111] placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E4E4E0] bg-white text-[#111111] placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-xs text-[#B0B0B0]">Demo: admin@verifyai.ng / demo1234</p>
            </form>
          ) : (
            <form onSubmit={handleEmployeeLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D3D3D] mb-1">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  placeholder="EMP-00042"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E4E4E0] bg-white text-[#111111] placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
              >
                {loading ? 'Looking up...' : 'Verify My Identity'}
              </button>
              <p className="text-center text-xs text-[#B0B0B0]">Demo Employee ID: EMP-00042</p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
