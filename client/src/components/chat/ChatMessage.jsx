import React from 'react';
import { CheckCheck } from 'lucide-react';

const ChatMessage = ({ message, isMe, senderName, avatarUrl, onSelectAction }) => {
  return (
    <div
      onClick={onSelectAction}
      className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} min-w-0 w-full group cursor-pointer`}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-sm mt-1">
        {avatarUrl ? (
          <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
        ) : (
          senderName?.charAt(0)?.toUpperCase() || 'U'
        )}
      </div>

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 max-w-[82%] sm:max-w-md`}>
        {!isMe && senderName && (
          <span className="text-[10px] font-bold text-cyan-400 mb-0.5 px-1">{senderName}</span>
        )}

        <div
          className={`p-3 rounded-2xl text-xs shadow-md transition-all relative ${
            isMe 
              ? 'bg-cyan-600 text-white rounded-br-none' 
              : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700/80'
          }`}
        >
          <p className="break-words leading-relaxed">{message.content}</p>

          <div className={`flex items-center justify-end space-x-1 text-[9px] mt-1 font-mono ${isMe ? 'text-cyan-200' : 'text-gray-400'}`}>
            <span>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:42 PM'}</span>
            {isMe && <CheckCheck className="w-3 h-3 text-cyan-200" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
