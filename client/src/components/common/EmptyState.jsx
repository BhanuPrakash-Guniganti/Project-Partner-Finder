import React from 'react';
import { FolderSearch, Sparkles, Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = "No results found",
  description = "We couldn't find anything matching your criteria.",
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900/30 border border-gray-800/80 rounded-2xl space-y-4 my-4 max-w-lg mx-auto w-full">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 flex-shrink-0">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1 min-w-0">
        <h4 className="text-base font-bold text-white leading-tight">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-transform hover:scale-105"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
