import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerificationResult({ state }) {
  const isSuccess = state === 'success';

  return (
    <div className="flex flex-col items-center text-center py-4 space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
      >
        {isSuccess ? (
          <CheckCircle className="w-16 h-16 text-[#16A34A]" />
        ) : (
          <motion.div
            animate={{ x: [0, -10, 10, -8, 8, -4, 4, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <XCircle className="w-16 h-16 text-[#DC2626]" />
          </motion.div>
        )}
      </motion.div>

      <div>
        <h3 className={`font-display text-lg font-bold ${isSuccess ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
          {isSuccess ? 'Identity Verified' : 'Verification Failed'}
        </h3>
        <p className="text-[#737373] text-sm mt-1">
          {isSuccess
            ? 'Your salary of ₦185,000 has been unlocked'
            : 'We could not confirm your identity'}
        </p>
      </div>

      {isSuccess ? (
        <div className="w-full bg-[#DCFCE7] rounded-xl p-4 space-y-2 text-left">
          <div className="flex justify-between text-xs">
            <span className="text-[#737373]">Squad Reference</span>
            <span className="font-mono text-[#E8501A] font-medium">SQ-2025-VRF-04421</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#737373]">Trust Score</span>
            <span className="text-[#16A34A] font-medium">94/100</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#737373]">Processing time</span>
            <span className="text-[#3D3D3D]">Within 2 hours</span>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#FEE2E2] rounded-xl p-4 space-y-1 text-left">
          <p className="text-[#DC2626] text-xs font-medium">Next steps</p>
          <p className="text-[#737373] text-xs">Please visit your HR office with your staff ID card</p>
          <p className="text-[#737373] text-xs mt-2">Support: <span className="font-mono">0800-VERIFY-1</span></p>
        </div>
      )}
    </div>
  );
}
