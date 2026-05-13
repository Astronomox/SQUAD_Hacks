import React from 'react';
import { Check } from 'lucide-react';

const STEPS = ['Face Detected', 'Liveness Check', 'Match Verified'];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => {
        const done = currentStep > i;
        const active = currentStep === i;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                done    ? 'bg-[#16A34A]' :
                active  ? 'bg-[#E8501A]' :
                          'bg-[#E4E4E0]'
              }`}>
                {done ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <span className="text-[10px] text-[#B0B0B0] font-medium">{i + 1}</span>
                )}
              </div>
              <span className={`text-[10px] text-center leading-tight ${
                done ? 'text-[#16A34A]' : active ? 'text-[#E8501A]' : 'text-[#B0B0B0]'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-all ${
                currentStep > i ? 'bg-[#16A34A]' : 'bg-[#E4E4E0]'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
