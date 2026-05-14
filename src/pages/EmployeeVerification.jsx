import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Search } from 'lucide-react';
import LivenessCamera from '../components/verification/LivenessCamera.jsx';
import StepIndicator from '../components/verification/StepIndicator.jsx';
import VerificationResult from '../components/verification/VerificationResult.jsx';
import { useVerification } from '../hooks/useVerification.js';
import { EMPLOYEES } from '../data/employees.js';
import { formatNaira } from '../utils/formatters.js';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

function simulateLivenessSignals() {
  return {
    livenessScore:       0.91 + Math.random() * 0.07,
    faceMatchConfidence: 0.87 + Math.random() * 0.10,
    spoofDetected:       false,
  };
}

export default function EmployeeVerification() {
  const [inputId,    setInputId]    = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [lookupErr,  setLookupErr]  = useState('');

  const { step, result, disbursement, loading, error, employee, completeStep, submitVerification, reset }
    = useVerification(employeeId);

  // When all 3 steps complete, submit to backend
  useEffect(() => {
    if (step >= 3 && !result && !loading && employeeId) {
      submitVerification(simulateLivenessSignals());
    }
  }, [step, result, loading, employeeId, submitVerification]);

  const handleLookup = (e) => {
    e.preventDefault();
    const found = EMPLOYEES.find(emp => emp.id.toLowerCase() === inputId.trim().toLowerCase());
    if (!found) {
      setLookupErr('Employee ID not found. Try EMP-00001 to EMP-00200.');
      return;
    }
    setLookupErr('');
    setEmployeeId(found.id);
    reset();
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#F4F4F2] flex flex-col items-center justify-center p-4"
    >
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

        {/* Employee ID lookup */}
        {!employeeId ? (
          <div className="p-6 space-y-4">
            <p className="text-[#737373] text-sm">Enter your Employee ID to begin verification</p>
            <form onSubmit={handleLookup} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0B0]" />
                <input
                  value={inputId}
                  onChange={e => setInputId(e.target.value)}
                  placeholder="EMP-00042"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E4E4E0] font-mono text-sm focus:outline-none focus:border-[#E8501A]"
                />
              </div>
              {lookupErr && <p className="text-xs text-[#DC2626]">{lookupErr}</p>}
              <button type="submit"
                className="w-full py-2.5 bg-[#E8501A] hover:bg-[#FF6B35] text-white rounded-lg font-medium text-sm transition-colors">
                Look up my record
              </button>
              <p className="text-center text-[10px] text-[#B0B0B0]">
                Try: EMP-00001 · EMP-00042 · EMP-00089
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Employee info from real data */}
            {employee && (
              <div className="px-6 py-4 border-b border-[#E4E4E0]">
                <p className="text-[#737373] text-xs mb-0.5">
                  May 2025 — {employee.department}
                </p>
                <p className="font-display font-bold text-[#111111]">{employee.fullName}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[#E8501A] font-mono text-sm font-medium">{formatNaira(employee.salaryAmount)}</p>
                  <p className="text-[10px] text-[#B0B0B0] font-mono">{employee.id}</p>
                </div>
              </div>
            )}

            <div className="p-6 space-y-5">
              {(error) && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {!result ? (
                <>
                  <LivenessCamera currentStep={step} onStepComplete={completeStep} />
                  <StepIndicator currentStep={step} />
                  {loading && <p className="text-center text-xs text-[#737373]">Verifying with AI backend…</p>}
                </>
              ) : (
                <>
                  <VerificationResult
                    state={result.status === 'passed' ? 'success' : result.status === 'review' ? 'review' : 'failure'}
                    trustScore={result.trustScore}
                    txnRef={disbursement?.txnRef}
                    squadResponse={disbursement}
                    salaryAmount={employee?.salaryAmount}
                  />
                  <button
                    onClick={() => { reset(); setEmployeeId(null); setInputId(''); }}
                    className="w-full py-2 border border-[#E4E4E0] rounded-lg text-xs text-[#737373] hover:bg-[#F4F4F2] transition-colors"
                  >
                    Verify another employee
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
