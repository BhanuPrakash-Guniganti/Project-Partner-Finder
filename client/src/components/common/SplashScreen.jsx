import React from 'react';
import AppIcon from './AppIcon';

const SplashScreen = ({ text = "Loading PartnerFinder..." }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f19] flex flex-col items-center justify-center space-y-6 text-center p-4">
      <div className="relative">
        <AppIcon size="xl" className="shadow-2xl shadow-cyan-500/30 animate-pulse" />
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-ping" />
      </div>

      <div className="space-y-1 max-w-xs">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight gradient-text">PartnerFinder</h1>
        <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Project & Skill Matching</p>
      </div>

      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
        <span className="ml-1 font-mono text-[11px] text-gray-500">{text}</span>
      </div>
    </div>
  );
};

export default SplashScreen;
