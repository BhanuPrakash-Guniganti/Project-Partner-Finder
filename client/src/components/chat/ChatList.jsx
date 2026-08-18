import React from 'react';

const ChatList = ({ chats = [], activeChatId, onSelectChat, type = 'direct', onlineUsers = [] }) => {
  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-gray-400">
        No conversation contacts available.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800/60 overflow-y-auto min-w-0 flex-1">
      {chats.map(item => {
        const itemId = item._id || item.id;
        const isSelected = activeChatId === itemId;

        if (type === 'project') {
          const title = item.projectId?.title || item.title || 'Project Group Chat';

          return (
            <div
              key={itemId}
              onClick={() => onSelectChat(item)}
              className={`p-3.5 hover:bg-gray-900/60 cursor-pointer transition-all flex items-center justify-between min-w-0 ${
                isSelected ? 'bg-cyan-950/40 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                  #
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate"># {title}</h4>
                  <p className="text-[11px] text-gray-400 truncate">Project Group Broadcast</p>
                </div>
              </div>
            </div>
          );
        }

        const isOnline = onlineUsers.includes(item._id);

        return (
          <div
            key={itemId}
            onClick={() => onSelectChat(item)}
            className={`p-3.5 hover:bg-gray-900/60 cursor-pointer transition-all flex items-center justify-between min-w-0 ${
              isSelected ? 'bg-cyan-950/40 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-cyan-700/30 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    item.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-gray-900 ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                <p className="text-[11px] text-gray-400 truncate">{isOnline ? '● Online' : '○ Offline'}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
