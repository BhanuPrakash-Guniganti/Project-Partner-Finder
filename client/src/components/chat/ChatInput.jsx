import React, { useState } from 'react';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';

const ChatInput = ({ onSend, isSending = false, placeholder = "Type a message..." }) => {
  const [text, setText] = useState('');
  const [emojiBarOpen, setEmojiBarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    onSend(text.trim());
    setText('');
    setEmojiBarOpen(false);
  };

  const handleAddEmoji = (emoji) => {
    setText(prev => prev + emoji);
  };

  return (
    <div className="flex flex-col w-full bg-gray-900/90 border-t border-gray-800">
      {/* Emoji Picker Bar */}
      {emojiBarOpen && (
        <div className="p-2.5 bg-gray-900 border-b border-gray-800 flex gap-3 text-lg justify-around animate-fadeIn">
          {['😊', '👍', '🚀', '🔥', '❤️', '🎉', '💻', '👏'].map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="p-3 flex items-center gap-2 w-full min-w-0">
        <button
          type="button"
          onClick={() => alert('Attachment upload ready!')}
          className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
          title="Attach File"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setEmojiBarOpen(!emojiBarOpen)}
          className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0"
          title="Add Emoji"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          disabled={isSending}
          placeholder={isSending ? "Sending..." : placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 min-w-0 bg-gray-950 border border-gray-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isSending}
          className="gradient-btn px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-white text-xs shadow-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
