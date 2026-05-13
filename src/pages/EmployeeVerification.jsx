import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import LivenessCamera from '../components/verification/LivenessCamera.jsx';
import StepIndicator from '../components/verification/StepIndicator.jsx';
import VerificationResult from '../components/verification/VerificationResult.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export default function EmployeeVerification() {
  const [demoState, setDemoState] = useState('scanning'); // scanning | success | failure
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#F4F4F2] flex flex-col items-center justify-center p-4"
    >
      {/* Demo toggle */}
      <div className="flex gap-2 mb-6">
        {['scanning', 'success', 'failure'].map(s => (
          <button
            key={s}
            onClick={() => { setDemoState(s); setCurrentStep(0); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              demoState === s
                ? 'bg-[#E8501A] text-white border-[#E8501A]'
                : 'bg-white text-[#737373] border-[#E4E4E0]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="bg-[#111111] px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8501A] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-display font-bold text-sm">VerifyAI</p>
            <p className="text-gray-400 text-xs">Salary Verification</p>
          </div>
        </div>

        {/* Employee info */}
        <div className="px-6 py-4 border-b border-[#E4E4E0]">
          <p className="text-[#737373] text-xs mb-0.5">May 2025 — Ministry of Education</p>
          <p className="font-display font-bold text-[#111111]">Adaeze Okonkwo</p>
          <p className="text-[#E8501A] font-mono text-sm font-medium">₦185,000</p>
        </div>

        <div className="p-6 space-y-5">
          {demoState === 'scanning' ? (
            <>
              <LivenessCamera currentStep={currentStep} onStepComplete={setCurrentStep} />
              <StepIndicator currentStep={currentStep} />
            </>
          ) : (
            <VerificationResult state={demoState} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
