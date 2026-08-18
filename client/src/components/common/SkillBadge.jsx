import React from 'react';

const SkillBadge = ({ skill, variant = 'cyan', level, onRemove, onClick }) => {
  const variantStyles = {
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800 hover:border-cyan-500',
    indigo: 'bg-indigo-950/60 text-indigo-300 border-indigo-800 hover:border-indigo-500',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800 hover:border-purple-500',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:border-emerald-500',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800 hover:border-amber-500'
  };

  const selectedStyle = variantStyles[variant] || variantStyles.cyan;

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${selectedStyle} ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    >
      <span>{skill}</span>
      {level && (
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-900 text-gray-300 font-mono">
          {level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(skill); }}
          className="ml-1 text-gray-400 hover:text-red-400 font-bold"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
