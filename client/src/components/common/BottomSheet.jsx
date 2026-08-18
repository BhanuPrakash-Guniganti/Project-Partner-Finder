import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop Click to Close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Drawer */}
      <div className="glass-panel w-full max-h-[85vh] rounded-t-3xl border-t border-gray-800 p-5 space-y-4 shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Drag Handle Top Indicator */}
        <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto flex-shrink-0" />

        {/* Title & Close Row */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-shrink-0">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto min-w-0 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
