import React from 'react';
import { Sparkles, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-[#070a12] py-8 mt-16 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-bold">
            <Sparkles className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-gray-200">Project Partner Finder</span>
          <span className="text-gray-600">|</span>
          <span>Skill-Based Team Collaboration & AI Matching</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span>Built with React, Node, Express, MongoDB & Grok AI</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
