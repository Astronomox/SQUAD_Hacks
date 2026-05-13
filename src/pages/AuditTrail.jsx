import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { CHAIN_HEAD } from '../data/auditLog.js';
import { useAuditLog } from '../hooks/useAuditLog.js';
import AuditFilters from '../components/audit/AuditFilters.jsx';
import AuditTable from '../components/audit/AuditTable.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function AuditTrail() {
  const auditLog = useAuditLog();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="p-4 lg:p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#111111]">Audit Trail</h1>
          <p className="text-[#737373] text-sm mt-0.5">
            {auditLog.list.length} of {auditLog.total} records · Immutable
          </p>
        </div>
      </div>

      {/* Immutability banner */}
      <div className="bg-[#111111] rounded-xl px-4 lg:px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Lock className="w-4 h-4 text-[#E8501A] shrink-0" />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium">Cryptographically sealed audit chain</p>
            <p className="text-gray-500 text-xs font-mono mt-0.5 truncate">Chain head: {CHAIN_HEAD}</p>
          </div>
        </div>
        <button className="shrink-0 px-3 py-1.5 border border-[#E8501A] text-[#E8501A] rounded-lg text-xs font-medium hover:bg-[#E8501A] hover:text-white transition-colors">
          Verify Chain
        </button>
      </div>

      {/* Filters wired to the hook */}
      <AuditFilters auditLog={auditLog} />

      {/* Table receives filtered list from hook */}
      <AuditTable rows={auditLog.list} />
    </motion.div>
  );
}
