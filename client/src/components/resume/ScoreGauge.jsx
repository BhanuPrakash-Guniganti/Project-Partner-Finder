import React from 'react';

const ScoreGauge = ({ score = 82, label = "Overall Resume Score" }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#0284c7'; // cyan
  if (score >= 85) color = '#10b981'; // emerald
  else if (score >= 70) color = '#3b82f6'; // blue
  else color = '#f59e0b'; // amber

  return (
    <div className="flex flex-col items-center justify-center p-4 glass-panel rounded-2xl border border-gray-800">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-gray-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold text-white">{score}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400">out of 100</span>
        </div>
      </div>
      <span className="text-xs font-bold text-gray-300 mt-2 text-center">{label}</span>
    </div>
  );
};

export default ScoreGauge;
