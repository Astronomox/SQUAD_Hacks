import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, Lock, TrendingDown, Users, CheckCircle, ChevronRight } from 'lucide-react';

// ─── Logo Component ────────────────────────────────────────────────────────────
export function VerifyAILogo({ size = 40, className = '' }) {
  const s = size;
  const h = s;
  return (
    <svg width={s} height={h} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="40" height="40" rx="9" fill="#111111"/>
      {/* Outer diamond frame */}
      <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke="#E8501A" strokeWidth="1.5" opacity="0.3"/>
      {/* V mark — geometric angled form */}
      <polygon points="7,10 16,10 20,17.5 24,10 33,10 20,32" fill="#E8501A"/>
      {/* Inner negative cut */}
      <polygon points="13.5,10 20,23 26.5,10" fill="#111111" opacity="0.45"/>
      {/* Apex dot */}
      <circle cx="20" cy="32" r="2" fill="#FF8C5A" opacity="0.8"/>
      {/* Corner marks */}
      <rect x="3" y="3" width="4" height="1.5" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="3" y="3" width="1.5" height="4" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="33" y="3" width="4" height="1.5" rx="0.5" fill="#E8501A" opacity="0.5"/>
      <rect x="35.5" y="3" width="1.5" height="4" rx="0.5" fill="#E8501A" opacity="0.5"/>
    </svg>
  );
}

// ─── Stats ticker ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '₦200B+', label: 'Lost annually to ghost workers' },
  { value: '37%',    label: 'Of ministries have undetected fraud' },
  { value: '8s',     label: 'AI scan time for 1,200 employees' },
  { value: '15',     label: 'Ghost workers caught in first pilot' },
  { value: '₦4.2M',  label: 'Leakage prevented — first cycle' },
];

// ─── Animated number ──────────────────────────────────────────────────────────
function AnimStat({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.08 }}
      className="flex flex-col gap-0.5"
    >
      <span className="font-display text-2xl font-800 text-[#E8501A] leading-none">{stat.value}</span>
      <span className="text-[11px] text-white/40 leading-tight">{stat.label}</span>
    </motion.div>
  );
}

// ─── Login form ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [portal,     setPortal]     = useState('hr');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);
  const [showLanding, setShowLanding] = useState(!location.state?.skipLanding);

  const handleHRLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    setLoading(false);
    navigate('/dashboard');
  };

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    navigate('/verify', { state: { employeeId: employeeId.trim().toUpperCase() } });
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex bg-[#0A0A0A]"
    >
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background geometry */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#111111]" />
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8501A" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
          {/* Glow */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#E8501A] opacity-[0.06] blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-[#E8501A] opacity-[0.04] blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <VerifyAILogo size={40} />
            <span className="text-white font-display font-700 text-xl tracking-tight">VerifyAI</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="inline-flex items-center gap-2 bg-[#E8501A]/10 border border-[#E8501A]/20 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8501A] animate-pulse" />
              <span className="text-[#E8501A] text-[11px] font-medium tracking-wide uppercase">SquadHacks 3.0 · Challenge 01</span>
            </div>
            <h1 className="text-white font-display text-[40px] xl:text-[48px] font-800 leading-[1.05] tracking-tight mb-6">
              Every Naira<br />reaches a<br /><span className="text-[#E8501A]">living worker.</span>
            </h1>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-xs">
              AI-powered payroll integrity. Ghost workers detected before a single Naira is disbursed.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
            {STATS.slice(0, 4).map((s, i) => <AnimStat key={i} stat={s} index={i} />)}
          </div>
          <div className="flex items-center gap-2 text-white/25 text-xs">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect width="12" height="12" rx="2" fill="#E8501A" opacity="0.3"/><text x="6" y="9" textAnchor="middle" fill="#E8501A" fontSize="7" fontWeight="bold">S</text></svg>
            Payments powered by Squad API
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F4F4F2]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <VerifyAILogo size={36} />
            <span className="font-display font-bold text-xl text-[#111]">VerifyAI</span>
          </div>

          <h2 className="font-display text-[28px] font-bold text-[#111111] leading-tight mb-1">Welcome back</h2>
          <p className="text-[#8A8A8A] text-sm mb-8">Sign in to your portal to continue</p>

          {/* Portal toggle */}
          <div className="flex gap-1 bg-[#EBEBEB] rounded-xl p-1 mb-8">
            {[
              { id: 'hr',       label: 'HR Admin' },
              { id: 'employee', label: 'Employee Verify' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPortal(p.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  portal === p.id
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-[#8A8A8A] hover:text-[#111111]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {portal === 'hr' ? (
              <motion.form
                key="hr"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                onSubmit={handleHRLogin}
                className="space-y-4"
              >
                <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="admin@verifyai.ng" />
                <div>
                  <label className="block text-[13px] font-medium text-[#3D3D3D] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-[#E4E4E0] bg-white text-[#111111] placeholder:text-[#C0C0C0] focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#737373] transition-colors"
                      tabIndex={-1}
                    >
                      {showPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <SubmitBtn loading={loading} label="Sign In" />
                <p className="text-center text-xs text-[#B0B0B0] pt-1">Demo: admin@verifyai.ng / demo1234</p>
              </motion.form>
            ) : (
              <motion.form
                key="emp"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                onSubmit={handleEmployeeLogin}
                className="space-y-4"
              >
                <Field label="Employee ID" type="text" value={employeeId} onChange={setEmployeeId} placeholder="EMP-00042" mono />
                <SubmitBtn loading={loading} label="Verify My Identity" />
                <p className="text-center text-xs text-[#B0B0B0] pt-1">Try: EMP-00001 · EMP-00042 · EMP-00089</p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Field({ label, type, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#3D3D3D] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border border-[#E4E4E0] bg-white text-[#111111] placeholder:text-[#C0C0C0] focus:outline-none focus:border-[#E8501A] focus:ring-2 focus:ring-[#E8501A]/10 text-sm transition-all ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 bg-[#111111] hover:bg-[#1A1A1A] disabled:opacity-60 text-white rounded-xl font-medium text-sm transition-all duration-200 group mt-2"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </>
      )}
    </button>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onEnter }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % STATS.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <VerifyAILogo size={36} />
          <span className="font-display font-bold text-lg tracking-tight">VerifyAI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-white/40 text-xs font-mono">SquadHacks 3.0</span>
          <button
            onClick={onEnter}
            className="flex items-center gap-2 bg-[#E8501A] hover:bg-[#FF6B35] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Open App <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(232,80,26,0.08) 0%, transparent 70%)' }} />
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
            <defs>
              <pattern id="hgrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#E8501A" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hgrid)"/>
          </svg>
          {/* Diagonal accent */}
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#E8501A]/20 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">


          {/* Big logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <VerifyAILogo size={96} />
              {/* Orbit ring */}
              <div className="absolute inset-[-16px] rounded-[20px] border border-[#E8501A]/15 animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-[-28px] rounded-[28px] border border-[#E8501A]/08 animate-[spin_20s_linear_infinite_reverse]" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="font-display text-5xl sm:text-6xl lg:text-[80px] font-800 leading-[1.0] tracking-tight mb-6"
          >
            Every Naira reaches<br />
            <span className="text-[#E8501A]">a living worker.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered payroll integrity that detects ghost workers before a single Naira is disbursed. 
            Isolation Forest anomaly detection + Squad API escrow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={onEnter}
              className="flex items-center gap-2 bg-[#E8501A] hover:bg-[#FF6B35] text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-all hover:shadow-[0_0_32px_rgba(232,80,26,0.4)] group"
            >
              Launch App <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="https://github.com/Astronomox/SQUAD_Hacks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              GitHub <ChevronRight size={14} />
            </a>
          </motion.div>
        </div>


      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#E8501A] text-xs tracking-widest uppercase mb-3">How it works</p>
            <h2 className="font-display text-3xl lg:text-5xl font-800 leading-tight">
              AI verifies. Squad disburses.<br />
              <span className="text-white/40">Nothing leaks.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5 text-[#E8501A]" />,
                step: '01',
                title: 'Isolation Forest Scan',
                desc: '200 estimators. 6 behavioural features. 8-second scan. Ghost workers surface automatically.',
                tag: 'AI · ML'
              },
              {
                icon: <Lock className="w-5 h-5 text-[#E8501A]" />,
                step: '02',
                title: 'Squad Escrow Lock',
                desc: 'Real Squad Virtual Account created. Payroll funds ring-fenced. Nothing moves without AI clearance.',
                tag: 'Squad API'
              },
              {
                icon: <Shield className="w-5 h-5 text-[#E8501A]" />,
                step: '03',
                title: 'Liveness + Disburse',
                desc: '3-step facial liveness check. Blocks spoofing. Squad Transfer fires only for verified employees.',
                tag: 'Computer Vision'
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-[#E8501A]/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#E8501A]/10 flex items-center justify-center group-hover:bg-[#E8501A]/20 transition-colors">
                    {f.icon}
                  </div>
                  <span className="font-mono text-[10px] text-white/20">{f.step}</span>
                </div>
                <span className="inline-block text-[10px] text-[#E8501A]/70 bg-[#E8501A]/10 px-2 py-0.5 rounded-full font-medium mb-3">{f.tag}</span>
                <h3 className="font-display font-bold text-base text-white mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact numbers */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: '₦200B+', l: 'Annual loss to ghost workers' },
              { n: '15',     l: 'Ghost workers in pilot cycle' },
              { n: '₦4.2M',  l: 'Leakage prevented, cycle 1' },
              { n: '36',     l: 'States ready for deployment' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="font-display text-4xl font-800 text-[#E8501A] mb-2">{s.n}</div>
                <div className="text-white/40 text-xs leading-tight">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <VerifyAILogo size={56} className="mx-auto mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl font-800 mb-4">
              Built by Team Synthex<br />
              <span className="text-white/40">for SquadHacks 3.0</span>
            </h2>
            
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-2 bg-[#E8501A] hover:bg-[#FF6B35] text-white font-medium px-8 py-4 rounded-xl text-sm transition-all hover:shadow-[0_0_40px_rgba(232,80,26,0.35)] group"
            >
              Launch VerifyAI <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <VerifyAILogo size={24} />
          <span className="text-white/30 text-xs">VerifyAI · Team Synthex · SquadHacks 3.0</span>
        </div>
        <div className="flex items-center gap-4 text-white/20 text-xs">
          <a href="https://github.com/Astronomox/SQUAD_Hacks" target="_blank" rel="noopener" className="hover:text-white/50 transition-colors">GitHub</a>
          <a href="https://verifyai-rho.vercel.app" className="hover:text-white/50 transition-colors">Live Demo</a>
          <span>Powered by Squad API</span>
        </div>
      </footer>
    </div>
  );
}
