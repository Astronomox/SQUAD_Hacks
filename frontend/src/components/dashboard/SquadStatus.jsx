import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { getSquadBalance, getSquadVirtualAccounts, getSquadTransactions } from '../../utils/aiService.js';

function fmt(n) {
  const num = parseFloat(n) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(num);
}

// Squad sandbox returns data in different shapes depending on endpoint.
// This safely extracts an array from any response shape.
function extractRows(res) {
  if (!res) return [];
  const d = res.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.rows)) return d.rows;
  if (Array.isArray(d?.transactions)) return d.transactions;
  if (Array.isArray(d?.virtual_accounts)) return d.virtual_accounts;
  return [];
}

// Squad returns transaction amounts variously as principal_amount, amount, amount_paid
function getTxnAmount(t) {
  const raw = t?.principal_amount ?? t?.amount_paid ?? t?.amount ?? 0;
  // Squad amounts are in kobo — convert to naira
  const num = parseFloat(raw) || 0;
  // If value > 10000 it's likely already in kobo (Squad sandbox quirk)
  return num > 10000 ? num / 100 : num;
}

export default function SquadStatus() {
  const [balance,  setBalance]  = useState(null);
  const [vas,      setVas]      = useState([]);
  const [txns,     setTxns]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [online,   setOnline]   = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [errors,   setErrors]   = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    const errs = [];

    try {
      const [balRes, vaRes, txRes] = await Promise.allSettled([
        getSquadBalance(),
        getSquadVirtualAccounts(),
        getSquadTransactions(),
      ]);

      // Balance
      if (balRes.status === 'fulfilled') {
        setBalance(balRes.value);
        setOnline(true);
      } else {
        errs.push('Balance: ' + balRes.reason?.message);
        setOnline(false);
      }

      // Virtual accounts
      if (vaRes.status === 'fulfilled') {
        setVas(extractRows(vaRes.value));
      } else {
        errs.push('VAs: ' + vaRes.reason?.message);
      }

      // Transactions
      if (txRes.status === 'fulfilled') {
        setTxns(extractRows(txRes.value).slice(0, 5));
      } else {
        errs.push('Txns: ' + txRes.reason?.message);
      }

      setLastSync(
        new Date().toLocaleTimeString('en-NG', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      );
    } catch (e) {
      errs.push(e.message);
      setOnline(false);
    }

    setErrors(errs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const balanceNaira = balance?.balance_naira ?? (balance?.data?.balance ?? 0) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-card border border-[#E4E4E0] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E4E4E0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#E8501A] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[#111111]">Squad API — Live Status</p>
            <p className="text-[10px] text-[#B0B0B0]">
              Merchant: SB9GB7333N
              {lastSync && ` · Synced ${lastSync}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Online indicator */}
          <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
            online ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {online
              ? <><Wifi size={9} /> Live</>
              : <><WifiOff size={9} /> Offline</>
            }
          </span>
          <a
            href="https://sandbox.squadco.com/virtual-accounts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#737373] hover:text-[#E8501A] transition-colors"
          >
            Dashboard <ExternalLink size={10} />
          </a>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#111111] border border-[#E4E4E0] px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-[#F4F4F2] rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Balance row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F4F4F2] rounded-lg p-3">
                <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-1">
                  Ledger Balance
                </p>
                <p className="font-display font-bold text-lg text-[#111111]">
                  {online ? fmt(balanceNaira) : '—'}
                </p>
                <p className="text-[10px] text-[#B0B0B0] mt-0.5">
                  {online
                    ? `${Math.round(balanceNaira * 100).toLocaleString()} kobo`
                    : 'Backend offline'}
                </p>
              </div>
              <div className="bg-[#F4F4F2] rounded-lg p-3">
                <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-1">
                  Virtual Accounts
                </p>
                <p className="font-display font-bold text-lg text-[#111111]">{vas.length}</p>
                <p className="text-[10px] text-[#B0B0B0] mt-0.5">Active on Squad sandbox</p>
              </div>
            </div>

            {/* Virtual accounts list */}
            {vas.length > 0 && (
              <div>
                <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-2">
                  Active Virtual Accounts
                </p>
                <div className="space-y-1.5">
                  {vas.slice(0, 3).map((va, i) => (
                    <div
                      key={va.virtual_account_number ?? i}
                      className="flex items-center justify-between bg-[#F4F4F2] rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="font-mono text-xs font-medium text-[#E8501A]">
                          {va.virtual_account_number ?? '—'}
                        </p>
                        <p className="text-[10px] text-[#B0B0B0]">
                          {va.customer?.first_name ?? va.first_name ?? ''}{' '}
                          {va.customer?.last_name  ?? va.last_name  ?? ''}
                        </p>
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
                <p className="text-[10px] text-[#737373] uppercase tracking-wide font-medium mb-2">
                  Recent Transactions
                </p>
                <div className="space-y-1.5">
                  {txns.map((t, i) => (
                    <div
                      key={t.transaction_reference ?? t.id ?? i}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-[#F4F4F2] last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-[#E8501A] truncate">
                          {t.transaction_reference ?? t.reference ?? '—'}
                        </p>
                        <p className="text-[10px] text-[#B0B0B0]">
                          {t.virtual_account_number ?? t.customer_identifier ?? ''}
                        </p>
                      </div>
                      <p className="font-medium text-[#111111] shrink-0 ml-2">
                        {fmt(getTxnAmount(t))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty / offline state */}
            {!online && errors.length > 0 && (
              <div className="bg-red-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-medium text-red-600 mb-1">Backend errors</p>
                {errors.map((e, i) => (
                  <p key={i} className="text-[10px] text-red-400 font-mono truncate">{e}</p>
                ))}
              </div>
            )}

            {online && vas.length === 0 && txns.length === 0 && (
              <p className="text-xs text-[#B0B0B0] text-center py-2">
                No virtual accounts yet — run a payroll cycle to create one.
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
