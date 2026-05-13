import React from 'react';

export default function RiskGauge({ score }) {
  const angle = -135 + (score / 100) * 270;
  const color = score >= 70 ? '#DC2626' : score >= 40 ? '#D97706' : '#16A34A';
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-20 overflow-hidden">
        <svg viewBox="0 0 120 70" className="w-full h-full">
          {/* Background track */}
          <path
            d="M10 65 A50 50 0 0 1 110 65"
            fill="none"
            stroke="#E4E4E0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Green zone */}
          <path
            d="M10 65 A50 50 0 0 1 45 22"
            fill="none"
            stroke="#DCFCE7"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Amber zone */}
          <path
            d="M45 22 A50 50 0 0 1 75 22"
            fill="none"
            stroke="#FEF9C3"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Red zone */}
          <path
            d="M75 22 A50 50 0 0 1 110 65"
            fill="none"
            stroke="#FEE2E2"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Needle */}
          <g transform={`translate(60,65) rotate(${angle})`}>
            <line x1="0" y1="0" x2="0" y2="-38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill={color} />
          </g>
        </svg>
      </div>
      <div className="text-center -mt-2">
        <p className="font-display text-3xl font-bold" style={{ color }}>{score}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}
