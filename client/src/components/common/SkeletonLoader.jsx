import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 border border-gray-800 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="w-20 h-5 bg-gray-800 rounded-full" />
              <div className="w-12 h-5 bg-gray-800 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-5 bg-gray-800 rounded-lg" />
              <div className="w-full h-3 bg-gray-800/60 rounded" />
              <div className="w-5/6 h-3 bg-gray-800/60 rounded" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="w-14 h-6 bg-gray-800/80 rounded-md" />
              <div className="w-14 h-6 bg-gray-800/80 rounded-md" />
              <div className="w-14 h-6 bg-gray-800/80 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {items.map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 flex items-center space-x-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="w-32 h-4 bg-gray-800 rounded" />
            <div className="w-48 h-3 bg-gray-800/60 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
