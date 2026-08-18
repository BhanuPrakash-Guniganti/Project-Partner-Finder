import React from 'react';
import { ArrowRight } from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
  if (!notification) return null;

  const Icon = notification.icon;

  return (
    <div
      onClick={() => onClick && onClick(notification)}
      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 min-w-0 shadow-md ${
        !notification.read 
          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-cyan-500/5' 
          : 'glass-panel border-gray-800 hover:bg-gray-900/60'
      }`}
    >
      <div className="flex items-start space-x-3.5 min-w-0 flex-1">
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-md ${notification.iconBg || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-white text-sm truncate">{notification.title}</h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" title="Unread" />
            )}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{notification.description}</p>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
        <span className="text-[10px] text-gray-500 font-mono">{notification.time}</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-500 hover:text-cyan-400" />
      </div>
    </div>
  );
};

export default NotificationItem;
