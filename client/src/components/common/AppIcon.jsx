import React from 'react';

const AppIcon = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <img
      src="/partnerfinder-icon.png"
      alt="PartnerFinder"
      className={`${selectedSize} object-contain flex-shrink-0 transition-transform ${className}`}
      loading="eager"
    />
  );
};

export default AppIcon;
