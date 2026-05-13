import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { EMPLOYEES } from '../data/employees.js';
import FlaggedList from '../components/fraud/FlaggedList.jsx';
import InvestigationPanel from '../components/fraud/InvestigationPanel.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function FraudInvestigation() {
  const flagged = EMPLOYEES.filter(e => e.riskScore >= 40);
  const [selected, setSelected] = useState(flagged[0] || null);
  const [showPanel, setShowPanel] = useState(false); // mobile: show list or panel

  const handleSelect = (emp) => {
    setSelected(emp);
    setShowPanel(true); // on mobile, switch to panel view
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="h-[calc(100vh-64px)] lg:h-[calc(100vh-0px)] flex flex-col"
    >
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 border-b border-[#E4E4E0] bg-white flex items-center gap-3">
        {/* Back button — mobile only, shown when viewing panel */}
        {showPanel && (
          <button
            onClick={() => setShowPanel(false)}
            className="lg:hidden flex items-center gap-1 text-sm text-[#737373] hover:text-[#111111] transition-colors mr-1"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        <div>
          <h1 className="font-display text-xl font-bold text-[#111111]">Fraud Investigation</h1>
          <p className="text-[#737373] text-sm mt-0.5">{flagged.length} employees flagged for review</p>
        </div>
      </div>

      {/* Body — desktop: side by side | mobile: one at a time */}
      <div className="flex flex-1 overflow-hidden">

        {/* List — hidden on mobile when panel is open */}
        <div className={`
          lg:flex lg:w-80 lg:shrink-0
          ${showPanel ? 'hidden' : 'flex w-full'}
          flex-col border-r border-[#E4E4E0]
        `}>
          <FlaggedList
            employees={flagged}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>

        {/* Panel — hidden on mobile when list is shown */}
        <div className={`
          lg:flex lg:flex-1
          ${showPanel ? 'flex flex-1' : 'hidden'}
          flex-col overflow-hidden
        `}>
          {selected ? (
            <InvestigationPanel employee={selected} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#B0B0B0] text-sm">
              Select an employee to investigate
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
