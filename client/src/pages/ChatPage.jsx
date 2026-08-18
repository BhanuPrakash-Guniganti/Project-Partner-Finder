import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { fetchUserTeams, fetchDirectMessages, fetchProjectMessages, sendMessageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Send, Users, User, Hash, Loader2 } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const [teams, setTeams] = useState([]);
  const [chatType, setChatType] = useState(null); // 'direct' | 'project' | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [location.key, location.search, location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const res = await fetchUserTeams();
      const loadedTeams = res.data || [];
      setTeams(loadedTeams);

      // Collect unique members across all user teams
      const allMembers = [];
      loadedTeams.forEach(t => {
        t.members?.forEach(m => {
          if (m.userId && m.userId._id !== user._id) {
            if (!allMembers.some(x => x._id === m.userId._id)) {
              allMembers.push(m.userId);
            }
          }
        });
      });

      // Explicit parameters from navigation state or URL query
      const isReset = location.state?.resetChat === true;
      const stateRecipient = location.state?.recipient;
      const stateProjectId = location.state?.projectId;
      const paramUserId = searchParams.get('userId');
      const paramProjectId = searchParams.get('projectId');

      if (isReset) {
        clearChatSelection();
      } else if (stateRecipient && stateRecipient._id !== user._id) {
        selectUserForChat(stateRecipient);
      } else if (stateProjectId) {
        const foundProj = loadedTeams.find(t => t.projectId?._id === stateProjectId || t.projectId === stateProjectId);
        if (foundProj) {
          selectProjectForChat(foundProj.projectId);
        } else {
          clearChatSelection();
        }
      } else if (paramUserId) {
        const foundUser = allMembers.find(m => m._id === paramUserId);
        if (foundUser) {
          selectUserForChat(foundUser);
        } else {
          clearChatSelection();
        }
      } else if (paramProjectId) {
        const foundProj = loadedTeams.find(t => t.projectId?._id === paramProjectId || t.projectId === paramProjectId);
        if (foundProj) {
          selectProjectForChat(foundProj.projectId);
        } else {
          clearChatSelection();
        }
      } else {
        clearChatSelection();
      }
    } catch (err) {
      console.error('[Chat Initial Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const clearChatSelection = () => {
    setChatType(null);
    setSelectedUser(null);
    setSelectedProject(null);
    setMessages([]);
  };

  const selectUserForChat = async (recipientUser) => {
    setChatType('direct');
    setSelectedUser(recipientUser);
    setSelectedProject(null);
    setMessagesLoading(true);
    try {
      const res = await fetchDirectMessages(recipientUser._id);
      setMessages(res.data || []);
    } catch (err) {
      console.error('[Fetch Direct Messages Error]', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const selectProjectForChat = async (projectObj) => {
    const projId = projectObj._id || projectObj;
    setChatType('project');
    setSelectedProject(projectObj);
    setSelectedUser(null);
    setMessagesLoading(true);

    if (socket) {
      socket.emit('join_project_room', projId);
    }

    try {
      const res = await fetchProjectMessages(projId);
      setMessages(res.data || []);
    } catch (err) {
      console.error('[Fetch Project Messages Error]', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Helper to safely append a message with strict _id deduplication
  const appendMessageDeduplicated = (newMsg) => {
    setMessages(prev => {
      if (newMsg._id && prev.some(m => m._id === newMsg._id)) {
        return prev;
      }
      return [...prev, newMsg];
    });
  };

  // Socket Real-time Listener for Direct & Group Messages with explicit cleanup
  useEffect(() => {
    if (socket) {
      const handleDirectMsg = (data) => {
        if (chatType !== 'direct' || !selectedUser) return;
        const senderIdStr = typeof data.senderId === 'object' ? data.senderId?._id : data.senderId;
        const recipientIdStr = typeof data.recipientId === 'object' ? data.recipientId?._id : data.recipientId;

        const isCurrentConversation = (
          senderIdStr === selectedUser._id || 
          (senderIdStr === user?._id && recipientIdStr === selectedUser._id)
        );

        if (isCurrentConversation) {
          appendMessageDeduplicated(data);
        }
      };

      const handleGroupMsg = (data) => {
        if (chatType !== 'project' || !selectedProject) return;
        const currentProjId = selectedProject._id || selectedProject;
        const msgProjId = typeof data.projectId === 'object' ? data.projectId?._id : data.projectId;
        if (msgProjId === currentProjId) {
          appendMessageDeduplicated(data);
        }
      };

      socket.on('receive_direct_message', handleDirectMsg);
      socket.on('receive_group_message', handleGroupMsg);

      return () => {
        socket.off('receive_direct_message', handleDirectMsg);
        socket.off('receive_group_message', handleGroupMsg);
      };
    }
  }, [socket, chatType, selectedUser, selectedProject, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setIsSending(true);

    try {
      if (chatType === 'direct' && selectedUser) {
        const res = await sendMessageApi({
          recipientId: selectedUser._id,
          content: messageText
        });
        appendMessageDeduplicated(res.data);
        setNewMessage('');
      } else if (chatType === 'project' && selectedProject) {
        const projId = selectedProject._id || selectedProject;
        const res = await sendMessageApi({
          projectId: projId,
          content: messageText
        });
        appendMessageDeduplicated(res.data);
        setNewMessage('');
      }
    } catch (err) {
      console.error('[Chat Send Error]', err);
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-w-0 flex-1">
        <div className="glass-panel p-3 sm:p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row min-h-[550px] md:h-[650px] gap-4 shadow-2xl w-full max-w-full overflow-hidden">
          
          {/* Contacts & Project Teams Sidebar */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 pb-3 md:pb-0 pr-0 md:pr-4 flex flex-col justify-between max-h-[220px] md:max-h-full md:h-full space-y-3 min-w-0 flex-shrink-0">
            
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Section 1: Project Team Group Chats */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5 px-1">
                  <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Project Team Chats</span>
                </h3>

                {teams.length === 0 ? (
                  <div className="text-[11px] text-gray-500 p-2 text-center bg-gray-900/40 rounded-lg">
                    No active team projects yet.
                  </div>
                ) : (
                  teams.map(teamObj => {
                    const proj = teamObj.projectId || {};
                    const projId = proj._id || proj;
                    const projTitle = proj.title || 'Project Team';
                    const isSelected = chatType === 'project' && (selectedProject?._id === projId || selectedProject === projId);

                    return (
                      <div
                        key={teamObj._id || projId}
                        onClick={() => selectProjectForChat(proj)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs min-w-0 ${
                          isSelected 
                            ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-700 font-semibold shadow-md' 
                            : 'hover:bg-gray-900/80 text-gray-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            #
                          </div>
                          <span className="truncate">{projTitle}</span>
                        </div>
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono flex-shrink-0 ml-1">Team</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Section 2: Direct 1-on-1 Teammates */}
              <div className="space-y-2 pt-2 border-t border-gray-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5 px-1">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Direct Teammates</span>
                </h3>

                {contactList.length === 0 ? (
                  <div className="text-[11px] text-gray-500 p-2 text-center bg-gray-900/40 rounded-lg">
                    No direct teammate contacts found.
                  </div>
                ) : (
                  contactList.map(contact => {
                    const isOnline = onlineUsers.includes(contact._id);
                    const isSelected = chatType === 'direct' && selectedUser?._id === contact._id;
                    return (
                      <div
                        key={contact._id}
                        onClick={() => selectUserForChat(contact)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center space-x-3 text-xs min-w-0 ${
                          isSelected 
                            ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-700 font-semibold shadow-md' 
                            : 'hover:bg-gray-900/80 text-gray-300 border border-transparent'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-cyan-700/30 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/30 text-xs">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              contact.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-gray-900 ${
                            isOnline ? 'bg-emerald-500' : 'bg-gray-600'
                          }`}></span>
                        </div>
                        <div className="truncate min-w-0">
                          <div className="font-semibold text-white truncate">{contact.name}</div>
                          <div className="text-[10px] text-gray-400">{isOnline ? 'Online' : 'Offline'}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Clear Selection Button */}
            {(selectedUser || selectedProject) && (
              <button
                onClick={clearChatSelection}
                className="w-full py-1.5 sm:py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-[11px] sm:text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Active Chat Conversation Panel */}
          <div className="flex-1 flex flex-col justify-between h-full min-w-0 w-full overflow-hidden">
            {chatType === 'direct' && selectedUser ? (
              <>
                {/* Direct Messaging Header */}
                <div className="p-3 border-b border-gray-800 font-bold text-xs sm:text-sm text-white flex items-center justify-between min-w-0">
                  <div className="flex items-center space-x-2.5 truncate min-w-0">
                    <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">Direct Chat: <span className="text-cyan-300">{selectedUser.name}</span></span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800 font-mono flex-shrink-0 ml-1">
                    1-on-1
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 sm:p-4 bg-gray-950/40 rounded-xl border border-gray-800/80 my-2 min-w-0 w-full">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
                      Loading direct messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">
                      No direct messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                      return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 w-full`}>
                          <div className={`p-3 rounded-xl max-w-[85%] sm:max-w-sm text-xs shadow-md ${
                            isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                          }`}>
                            <p className="break-words">{msg.content}</p>
                          </div>
                          {msg.createdAt && (
                            <span className="text-[9px] text-gray-500 mt-1 px-1 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSend} className="flex gap-2 pt-1 w-full min-w-0">
                  <input
                    type="text"
                    disabled={isSending}
                    placeholder={isSending ? "Sending message..." : `Type message to ${selectedUser.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-w-0 w-full bg-gray-900 border border-gray-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                  <button disabled={isSending} type="submit" className="gradient-btn px-4 sm:px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50">
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : chatType === 'project' && selectedProject ? (
              <>
                {/* Project Group Messaging Header */}
                <div className="p-3 border-b border-gray-800 font-bold text-xs sm:text-sm text-white flex items-center justify-between min-w-0">
                  <div className="flex items-center space-x-2.5 truncate min-w-0">
                    <Hash className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">Project Group Chat: <span className="text-cyan-300">{selectedProject.title || 'Project'}</span></span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800 font-mono flex-shrink-0 ml-1">
                    Team Chat
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 sm:p-4 bg-gray-950/40 rounded-xl border border-gray-800/80 my-2 min-w-0 w-full">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
                      Loading team messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">
                      No team group messages yet. Start collaborating!
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                      const senderName = msg.senderId?.name || 'Teammate';
                      return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 w-full`}>
                          {!isMe && (
                            <span className="text-[10px] text-cyan-400 font-bold mb-0.5 px-1">{senderName}</span>
                          )}
                          <div className={`p-3 rounded-xl max-w-[85%] sm:max-w-sm text-xs shadow-md ${
                            isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                          }`}>
                            <p className="break-words">{msg.content}</p>
                          </div>
                          {msg.createdAt && (
                            <span className="text-[9px] text-gray-500 mt-1 px-1 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSend} className="flex gap-2 pt-1 w-full min-w-0">
                  <input
                    type="text"
                    disabled={isSending}
                    placeholder={isSending ? "Sending broadcast..." : `Broadcast message to ${selectedProject.title || 'Project'}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-w-0 w-full bg-gray-900 border border-gray-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                  <button disabled={isSending} type="submit" className="gradient-btn px-4 sm:px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50">
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : (
              /* General Default Chat Landing Page View */
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6 space-y-4 bg-gray-950/20 rounded-xl border border-gray-800/60 min-w-0 w-full">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 flex-shrink-0">
                  <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1 max-w-md min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white">General Chat & Messaging Hub</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Select a project team or a teammate from the sidebar to start a conversation.
                  </p>
                </div>
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
