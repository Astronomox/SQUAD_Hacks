import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const DOT_POSITIONS = [
  { x: 50, y: 35 }, { x: 38, y: 40 }, { x: 62, y: 40 },
  { x: 32, y: 50 }, { x: 68, y: 50 }, { x: 35, y: 60 },
  { x: 65, y: 60 }, { x: 42, y: 68 }, { x: 58, y: 68 },
  { x: 50, y: 72 }, { x: 44, y: 45 }, { x: 56, y: 45 },
  { x: 46, y: 55 }, { x: 54, y: 55 }, { x: 50, y: 58 },
];

const MESSAGES = [
  'Position your face in the frame…',
  'Blink once slowly…',
  'Turn slightly left…',
  '✓ Identity confirmed',
];

export default function LivenessCamera({ currentStep, onStepComplete }) {
  useEffect(() => {
    if (currentStep >= 3) return;
    const timer = setTimeout(() => onStepComplete(currentStep + 1), 2200);
    return () => clearTimeout(timer);
  }, [currentStep, onStepComplete]);

  const done = currentStep >= 3;

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-square bg-[#0A0A0A] rounded-2xl overflow-hidden">

        {/* Outer scanning ring */}
        {!done && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-52 h-52 rounded-full"
              style={{
                border: '2px solid transparent',
                borderTopColor: '#E8501A',
                borderRightColor: '#E8501A44',
              }}
            />
          </div>
        )}

        {/* Success ring */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-52 h-52 rounded-full border-2 border-[#16A34A]"
            />
          </div>
        )}

        {/* Face oval outline */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-36 h-44 rounded-full border-2 transition-colors duration-500"
            style={{ borderColor: done ? '#16A34A' : 'rgba(232,80,26,0.4)' }}
          />
        </div>

        {/* Face mesh dots — appear at step 1 */}
        {currentStep >= 1 && DOT_POSITIONS.map((dot, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
            transition={{ delay: i * 0.04, duration: 1.8, repeat: Infinity }}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: 'translate(-50%,-50%)',
              background: done ? '#16A34A' : '#22C55E',
            }}
          />
        ))}

        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            className="h-full bg-[#E8501A]"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Status label */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <p className={`text-xs font-medium ${done ? 'text-[#4ADE80]' : 'text-white'}`}>
              {MESSAGES[Math.min(currentStep, 3)]}
            </p>
          </motion.div>
        </div>

        {/* Step counter */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded-full">
            {Math.min(currentStep + 1, 3)}/3
          </span>
        </div>
      </div>
    </div>
  );
}
