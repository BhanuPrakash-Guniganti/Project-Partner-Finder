import React from 'react';

const MatchScoreBadge = ({ score, onClick, showLabel = true }) => {
  let colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (score < 60) {
    colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (score < 75) {
    colorClass = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 ${colorClass}`}
      title="Click to view explainable match breakdown"
    >
      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
      <span>{score}%</span>
      {showLabel && <span className="font-normal opacity-80">Match</span>}
    </button>
  );
};

export default MatchScoreBadge;
