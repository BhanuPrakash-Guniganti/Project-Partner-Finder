import React from 'react';
import AppIcon from './AppIcon';

const AppLogo = ({
  iconOnly = false,
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  if (iconOnly) {
    return <AppIcon size={size} className={className} />;
  }

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl'
  };

  const selectedTextSize = textSizeClasses[size] || textSizeClasses.md;

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <AppIcon size={size} />

      <div className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight text-white font-sans ${selectedTextSize}`}>
          Partner<span className="text-cyan-400">Finder</span>
        </span>
        {showSubtitle && (
          <span className="text-[8px] sm:text-[9px] text-cyan-400 font-semibold tracking-wider uppercase mt-0.5">
            Project & Skill Matching
          </span>
        )}
      </div>
    </div>
  );
};

export default AppLogo;
