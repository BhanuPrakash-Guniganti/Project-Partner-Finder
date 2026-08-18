import React from 'react';
import AppLogo from './AppLogo';

const Footer = () => {
  return (
    <footer className="hidden md:block border-t border-gray-800 bg-[#070a12] py-6 mt-12 text-xs text-gray-400 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left w-full min-w-0">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 min-w-0 w-full md:w-auto">
          <AppLogo size="sm" showSubtitle={false} />
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="text-gray-400 leading-snug">Skill-Based Team Collaboration & AI Matching</span>
        </div>
        <div className="flex items-center justify-center space-x-4 flex-shrink-0">
          <span className="text-gray-400 text-center">Built with React, Node, Express, MongoDB & Grok AI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
