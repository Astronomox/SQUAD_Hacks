import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { getSquadBalance, getSquadVirtualAccounts, getSquadTransactions } from '../../utils/aiService.js';

function fmt(n) {
  return new Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN', maximumFractionDigits:2 }).format(n);
}

export default function SquadStatus() {
  const [balance,  setBalance]  = useState(null);
  const [vas,      setVas]      = useState([]);
  const [txns,     setTxns]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [balRes, vaRes, txRes] = await Promise.allSettled([
        getSquadBalance(),
        getSquadVirtualAccounts(),
        getSquadTransactions(),
      ]);

      if (balRes.status === 'fulfilled') setBalance(balRes.value);
      if (vaRes.status === 'fulfilled')  setVas(vaRes.value?.data || []);
      if (txRes.status === 'fulfilled')  setTxns(txRes.value?.data?.slice(0, 5) || []);
      setLastSync(new Date().toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <motion.div
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      className="bg-white rounded-xl shadow-card border border-[#E4E4E0] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E4E4E0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#E8501A] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[#111111]">Squad API - Live Status</p>
            <p className="text-[10px] text-[#B0B0B0]">Merchant: SB9GB7333N {lastSync && `· Synced ${lastSync}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://sandbox.squadco.com/virtual-accounts" target="_blank" rel="noopener"
            className="flex items-center gap-1 text-[11px] text-[#737373] hover:text-[#E8501A] transition-colors">
            Dashboard <ExternalLink size={10} />
          </a>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#111111] border border-[#E4E4E0] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40">
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Balance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F4F4F2] rounded-lg p-3">
            <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-1">Ledger Balance</p>
            <p className="font-display font-bold text-lg text-[#111111]">
              {balance?.success ? fmt(balance.balance_naira) : '—'}
            </p>
            <p className="text-[10px] text-[#B0B0B0] mt-0.5">
              {balance?.success ? `${balance.balance_kobo?.toLocaleString()} kobo` : 'Backend offline'}
            </p>
          </div>
          <div className="bg-[#F4F4F2] rounded-lg p-3">
            <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-1">Virtual Accounts</p>
            <p className="font-display font-bold text-lg text-[#111111]">{vas.length}</p>
            <p className="text-[10px] text-[#B0B0B0] mt-0.5">Active on Squad sandbox</p>
          </div>
        </div>

        {/* Virtual accounts list */}
        {vas.length > 0 && (
          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-2">Active Virtual Accounts</p>
            <div className="space-y-1.5">
              {vas.slice(0, 3).map((va, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F4F4F2] rounded-lg px-3 py-2">
                  <div>
                    <p className="font-mono text-xs font-medium text-[#E8501A]">{va.virtual_account_number}</p>
                    <p className="text-[10px] text-[#B0B0B0]">{va.customer?.first_name} {va.customer?.last_name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    <span className="text-[10px] text-[#16A34A] font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {txns.length > 0 && (
          <div>
            <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-2">Recent Transactions</p>
            <div className="space-y-1.5">
              {txns.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F4F4F2] last:border-0">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-[#E8501A] truncate">{t.transaction_reference}</p>
                    <p className="text-[10px] text-[#B0B0B0]">{t.virtual_account_number}</p>
                  </div>
                  <p className="font-medium text-[#111111] shrink-0 ml-2">
                    {fmt(parseFloat(t.principal_amount || 0))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !balance?.success && vas.length === 0 && (
          <p className="text-xs text-[#B0B0B0] text-center py-2">
            Start the AI backend to see live Squad data
          </p>
        )}
      </div>
    </motion.div>
  );
}
