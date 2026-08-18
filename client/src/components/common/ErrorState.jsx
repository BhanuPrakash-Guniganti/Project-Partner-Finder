import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, ShieldAlert, FileX, Bot, MessageSquare } from 'lucide-react';

const ErrorState = ({
  type = 'network',
  title,
  message,
  onRetry,
  retryText = 'Try Again'
}) => {
  let Icon = WifiOff;
  let defaultTitle = 'Network Error';
  let defaultMessage = 'Unable to connect to the server. Please check your connection and try again.';

  if (type === 'server') {
    Icon = ServerCrash;
    defaultTitle = 'Server Unavailable';
    defaultMessage = 'Our servers are experiencing heavy load. Please try again in a few moments.';
  } else if (type === 'auth') {
    Icon = ShieldAlert;
    defaultTitle = 'Authentication Error';
    defaultMessage = 'Your session has expired. Please log in again to continue.';
  } else if (type === 'upload') {
    Icon = FileX;
    defaultTitle = 'Upload Failed';
    defaultMessage = 'Failed to upload your resume file. Please ensure it is a PDF under 10MB.';
  } else if (type === 'ai') {
    Icon = Bot;
    defaultTitle = 'AI Analysis Error';
    defaultMessage = 'The Grok AI matching engine was unable to analyze this item. Click retry below.';
  } else if (type === 'message') {
    Icon = MessageSquare;
    defaultTitle = 'Message Not Sent';
    defaultMessage = 'Failed to send message over WebSockets. Click retry to resend.';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center glass-panel border border-red-900/60 bg-red-950/20 rounded-3xl space-y-4 my-4 max-w-md mx-auto w-full shadow-2xl animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10 flex-shrink-0">
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 min-w-0">
        <h4 className="text-base font-bold text-white leading-tight">{title || defaultTitle}</h4>
        <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">{message || defaultMessage}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="py-2.5 px-5 rounded-2xl bg-red-900/60 hover:bg-red-800/80 border border-red-700 text-xs font-bold text-white flex items-center space-x-2 transition-transform hover:scale-105 shadow-md"
        >
          <RefreshCw className="w-4 h-4 text-red-200" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
