import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const items = Array.from({ length: count });

  if (type === 'user') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="w-28 h-4 bg-gray-800 rounded" />
                <div className="w-36 h-3 bg-gray-800/60 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-800/60 rounded" />
              <div className="w-4/5 h-3 bg-gray-800/60 rounded" />
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="w-16 h-5 bg-gray-800/80 rounded-md" />
              <div className="w-16 h-5 bg-gray-800/80 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'messages') {
    return (
      <div className="space-y-3 w-full p-2 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className={`flex items-start space-x-2.5 ${i % 2 === 0 ? '' : 'flex-row-reverse space-x-reverse'}`}>
            <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0" />
            <div className="p-3 rounded-2xl bg-gray-800/60 w-48 space-y-1.5">
              <div className="w-3/4 h-3 bg-gray-800 rounded" />
              <div className="w-1/2 h-2.5 bg-gray-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="w-44 h-6 bg-gray-800 rounded-lg" />
              <div className="w-32 h-4 bg-gray-800/60 rounded" />
              <div className="w-24 h-3 bg-gray-800/60 rounded" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-2">
              <div className="w-12 h-3 bg-gray-800 rounded" />
              <div className="w-8 h-6 bg-gray-800/80 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'resume') {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto" />
          <div className="w-48 h-5 bg-gray-800 mx-auto rounded" />
          <div className="w-64 h-3 bg-gray-800/60 mx-auto rounded" />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="glass-card rounded-3xl p-5 border border-gray-800 space-y-4 animate-pulse">
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
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {items.map((_, i) => (
        <div key={i} className="p-4 rounded-2xl border border-gray-800 bg-gray-900/40 flex items-center space-x-3 animate-pulse">
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
