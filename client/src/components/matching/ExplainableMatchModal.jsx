import React from 'react';
import { X, CheckCircle, Info, Sparkles } from 'lucide-react';

const ExplainableMatchModal = ({ isOpen, onClose, matchScore, matchBreakdown, reasons, title = "Match Breakdown" }) => {
  if (!isOpen) return null;

  const breakdownItems = [
    { label: 'Skill Match (45%)', score: matchBreakdown?.skillScore || 80, color: 'bg-cyan-500' },
    { label: 'Role Match (20%)', score: matchBreakdown?.roleScore || 75, color: 'bg-indigo-500' },
    { label: 'Interest Match (15%)', score: matchBreakdown?.interestScore || 70, color: 'bg-purple-500' },
    { label: 'Availability (10%)', score: matchBreakdown?.availabilityScore || 90, color: 'bg-emerald-500' },
    { label: 'Experience (10%)', score: matchBreakdown?.experienceScore || 85, color: 'bg-blue-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-gray-700/80 p-6 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-extrabold text-xl text-white shadow-lg">
            {matchScore}%
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{title}</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-gray-400">Transparent & Explainable Weighted Scoring Engine</p>
          </div>
        </div>

        {/* Weighted Formula Visualizer */}
        <div className="space-y-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Category Score Breakdown</h4>
          {breakdownItems.map(item => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-white font-bold">{item.score}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`} 
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Natural Language Reasons */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
            <Info className="w-3.5 h-3.5" />
            <span>Why This Match?</span>
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-gray-300 bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-900/30">
                  <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">Scores match based on algorithm weights.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainableMatchModal;
