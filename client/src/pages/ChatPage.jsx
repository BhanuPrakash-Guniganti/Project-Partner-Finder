import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { fetchUserTeams, fetchDirectMessages, sendMessageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Send, Users, User } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [teams, setTeams] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, [location.key, location.state]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await fetchUserTeams();
      setTeams(res.data || []);
      
      // Collect members from all teams for 1-on-1 direct messaging
      const allMembers = [];
      (res.data || []).forEach(t => {
        t.members?.forEach(m => {
          if (m.userId && m.userId._id !== user._id) {
            if (!allMembers.some(x => x._id === m.userId._id)) {
              allMembers.push(m.userId);
            }
          }
        });
      });

      // Explicit recipient resolution from state or search query
      const stateRecipient = location.state?.recipient;
      const targetUserId = location.state?.recipientId || searchParams.get('userId');

      if (location.state?.resetChat) {
        setSelectedUser(null);
        setMessages([]);
      } else if (stateRecipient && stateRecipient._id !== user._id) {
        selectUserForChat(stateRecipient);
      } else if (targetUserId) {
        const found = allMembers.find(m => m._id === targetUserId);
        if (found) {
          selectUserForChat(found);
        }
      } else {
        setSelectedUser(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectUserForChat = async (recipientUser) => {
    setSelectedUser(recipientUser);
    try {
      const res = await fetchDirectMessages(recipientUser._id);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to safely append a message without creating duplicate entries
  const appendMessageDeduplicated = (newMsg) => {
    setMessages(prev => {
      if (newMsg._id && prev.some(m => m._id === newMsg._id)) {
        return prev;
      }
      return [...prev, newMsg];
    });
  };

  useEffect(() => {
    if (socket) {
      const handleDirectMsg = (data) => {
        const senderIdStr = typeof data.senderId === 'object' ? data.senderId?._id : data.senderId;
        const recipientIdStr = typeof data.recipientId === 'object' ? data.recipientId?._id : data.recipientId;

        // Check if message belongs to current active conversation
        const isCurrentConversation = selectedUser && (
          senderIdStr === selectedUser._id || 
          (senderIdStr === user?._id && recipientIdStr === selectedUser._id)
        );

        if (isCurrentConversation) {
          appendMessageDeduplicated(data);
        }
      };

      socket.on('receive_direct_message', handleDirectMsg);
      return () => socket.off('receive_direct_message', handleDirectMsg);
    }
  }, [socket, selectedUser, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage.trim();

    try {
      const res = await sendMessageApi({
        recipientId: selectedUser._id,
        content: messageText
      });

      appendMessageDeduplicated(res.data);
      setNewMessage('');
    } catch (err) {
      console.error('[Chat Send Error]', err);
    }
  };

  // Extract unique contact list
  const contactList = [];
  teams.forEach(t => {
    t.members?.forEach(m => {
      if (m.userId && m.userId._id !== user._id) {
        if (!contactList.some(x => x._id === m.userId._id)) {
          contactList.push(m.userId);
        }
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row h-[600px] gap-4">
          
          {/* Contacts Sidebar */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 pr-0 md:pr-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Teammates Chat List</span>
            </h3>

            <div className="space-y-1 overflow-y-auto max-h-[500px]">
              {contactList.length === 0 ? (
                <div className="text-xs text-gray-500 p-4 text-center">No team contacts yet.</div>
              ) : (
                contactList.map(contact => {
                  const isOnline = onlineUsers.includes(contact._id);
                  const isSelected = selectedUser?._id === contact._id;
                  return (
                    <div
                      key={contact._id}
                      onClick={() => selectUserForChat(contact)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center space-x-3 text-xs ${
                        isSelected ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800' : 'hover:bg-gray-900 text-gray-300'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-cyan-700/30 text-cyan-300 font-bold flex items-center justify-center">
                          {contact.avatar ? (
                            <img src={contact.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            contact.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-gray-900 ${
                          isOnline ? 'bg-emerald-500' : 'bg-gray-600'
                        }`}></span>
                      </div>
                      <div>
                        <div className="font-bold text-white">{contact.name}</div>
                        <div className="text-[10px] text-gray-500">{isOnline ? 'Online' : 'Offline'}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Direct Messages Chat Window */}
          <div className="flex-1 flex flex-col justify-between">
            {selectedUser ? (
              <>
                <div className="p-3 border-b border-gray-800 font-bold text-sm text-white flex items-center space-x-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Chatting with {selectedUser.name}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-950/40 rounded-xl border border-gray-800/80 my-2">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-xl max-w-xs text-xs ${
                          isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type direct message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button type="submit" className="gradient-btn px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 bg-gray-950/20 rounded-xl border border-gray-800/60">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white">Direct Messaging Hub</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  Select a teammate from your contact list on the left to view or start a 1-on-1 conversation.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatPage;
