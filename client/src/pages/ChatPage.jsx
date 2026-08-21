import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmptyState from '../components/common/EmptyState';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { fetchUserTeams, fetchDirectMessages, fetchProjectMessages, sendMessageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  MessageSquare, Send, Users, User, Hash, Loader2, Search, 
  ArrowLeft, Check, CheckCheck, Sparkles, Paperclip, Smile, 
  Reply, Copy, Trash2, MoreVertical, ShieldAlert, Image as ImageIcon 
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'projects' | 'direct'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const [teams, setTeams] = useState([]);
  const [directContacts, setDirectContacts] = useState([]);
  
  const [chatType, setChatType] = useState(null); // 'direct' | 'project' | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Direct Messaging Enhancements
  const [replyingTo, setReplyingTo] = useState(null);
  const [emojiBarOpen, setEmojiBarOpen] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [selectedMessageAction, setSelectedMessageAction] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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

      // Collect unique contacts across all user teams
      const members = [];
      loadedTeams.forEach(t => {
        t.members?.forEach(m => {
          if (m.userId && m.userId._id !== user._id) {
            if (!members.some(x => x._id === m.userId._id)) {
              members.push(m.userId);
            }
          }
        });
      });
      setDirectContacts(members);

      // Parameters from navigation state or URL query
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
        const foundUser = members.find(m => m._id === paramUserId);
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
    setReplyingTo(null);
    setEmojiBarOpen(false);
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

  const appendMessageDeduplicated = (newMsg) => {
    setMessages(prev => {
      if (newMsg._id && prev.some(m => m._id === newMsg._id)) {
        return prev;
      }
      return [...prev, newMsg];
    });
  };

  // Socket Real-time Listener for Direct & Group Messages
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

      const handleTyping = (data) => {
        if (selectedUser && data.senderId === selectedUser._id) {
          setTypingUser(`${selectedUser.name} is typing...`);
          setTimeout(() => setTypingUser(''), 3000);
        }
      };

      socket.on('receive_direct_message', handleDirectMsg);
      socket.on('receive_group_message', handleGroupMsg);
      socket.on('user_typing', handleTyping);

      return () => {
        socket.off('receive_direct_message', handleDirectMsg);
        socket.off('receive_group_message', handleGroupMsg);
        socket.off('user_typing', handleTyping);
      };
    }
  }, [socket, chatType, selectedUser, selectedProject, user]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && selectedUser && user) {
      socket.emit('typing', { recipientId: selectedUser._id, senderId: user._id });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    let messageText = newMessage.trim();
    if (replyingTo) {
      messageText = `[Replying to ${replyingTo.senderId?.name || 'Message'}: "${replyingTo.content}"]\n${messageText}`;
    }

    setIsSending(true);

    try {
      if (chatType === 'direct' && selectedUser) {
        const res = await sendMessageApi({
          recipientId: selectedUser._id,
          content: messageText
        });
        appendMessageDeduplicated(res.data);
        setNewMessage('');
        setReplyingTo(null);
        setEmojiBarOpen(false);
      } else if (chatType === 'project' && selectedProject) {
        const projId = selectedProject._id || selectedProject;
        const res = await sendMessageApi({
          projectId: projId,
          content: messageText
        });
        appendMessageDeduplicated(res.data);
        setNewMessage('');
        setReplyingTo(null);
        setEmojiBarOpen(false);
      }
    } catch (err) {
      console.error('[Chat Send Error]', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleCopyMessage = (msg) => {
    navigator.clipboard.writeText(msg.content);
    showSuccess('Message copied to clipboard!');
    setSelectedMessageAction(null);
  };

  const handleDeleteOwnMessage = (msgId) => {
    setMessages(prev => prev.filter(m => m._id !== msgId));
    showSuccess('Message deleted');
    setSelectedMessageAction(null);
  };

  // Filter project chats & direct chats based on search
  const filteredProjectChats = teams.filter(t => {
    const title = t.projectId?.title || '';
    if (!searchQuery) return true;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredDirectChats = directContacts.filter(c => {
    const name = c.name || '';
    if (!searchQuery) return true;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const showActiveChatWindow = Boolean(chatType && (selectedUser || selectedProject));

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-20 md:pb-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] w-full min-w-0 flex-1 flex flex-col justify-between">
        
        {/* Dedicated Mobile Chat Container */}
        <div className="glass-panel rounded-3xl border border-gray-800 flex flex-col h-[78vh] sm:h-[680px] shadow-2xl w-full max-w-full overflow-hidden">
          
          {/* STATE 1: CHATS LIST SCREEN */}
          {!showActiveChatWindow ? (
            <div className="flex-1 flex flex-col h-full min-w-0 w-full overflow-hidden">
              
              {/* Header: Title & Search Toggle */}
              <div className="p-4 sm:p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/60">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <span>Collaboration Direct Messages</span>
                  </h1>
                </div>

                <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className="p-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              {/* Collapsible Search Field */}
              {showSearchInput && (
                <div className="px-4 py-2 bg-gray-900/90 border-b border-gray-800 animate-fadeIn">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search contacts or messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* Tabs Bar: All | Projects | Direct */}
              <div className="flex px-4 pt-3 pb-2 border-b border-gray-800/80 gap-2 bg-gray-900/30">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setActiveTab('direct')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'direct'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Direct ({filteredDirectChats.length})
                </button>

                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeTab === 'projects'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Projects ({filteredProjectChats.length})
                </button>
              </div>

              {/* Chat Conversation Items Scroll List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60 min-w-0">
                
                {loading ? (
                  <SkeletonLoader count={5} type="list" />
                ) : (
                  <>
                    {/* SECTION: DIRECT MESSAGES */}
                    {(activeTab === 'all' || activeTab === 'direct') && (
                      <>
                        {filteredDirectChats.map(contact => {
                          const isOnline = onlineUsers.includes(contact._id);

                          return (
                            <div
                              key={contact._id}
                              onClick={() => selectUserForChat(contact)}
                              className="p-4 hover:bg-gray-900/60 cursor-pointer transition-all flex items-center justify-between min-w-0"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="relative flex-shrink-0">
                                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
                                    {contact.avatar ? (
                                      <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                      contact.name?.charAt(0)?.toUpperCase() || 'U'
                                    )}
                                  </div>
                                  <span
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                                      isOnline ? 'bg-emerald-500' : 'bg-gray-500'
                                    }`}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm truncate">{contact.name}</h3>
                                    <span className="text-[10px] text-gray-500 font-mono">7:42 PM</span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate mt-0.5">
                                    Let's review the software architecture & code repo!
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* SECTION: PROJECT CHATS */}
                    {(activeTab === 'all' || activeTab === 'projects') && (
                      <>
                        {filteredProjectChats.map(teamObj => {
                          const proj = teamObj.projectId || {};
                          const projId = proj._id || proj;
                          const projTitle = proj.title || 'Project Team Chat';

                          return (
                            <div
                              key={teamObj._id || projId}
                              onClick={() => selectProjectForChat(proj)}
                              className="p-4 hover:bg-gray-900/60 cursor-pointer transition-all flex items-center justify-between min-w-0"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="w-11 h-11 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-md">
                                  #
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-white text-sm truncate"># {projTitle}</h3>
                                    <span className="text-[10px] text-gray-500 font-mono">2m</span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate mt-0.5">
                                    Project Team Broadcast
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* EMPTY TAB STATE */}
                    {((activeTab === 'projects' && filteredProjectChats.length === 0) ||
                      (activeTab === 'direct' && filteredDirectChats.length === 0) ||
                      (activeTab === 'all' && filteredProjectChats.length === 0 && filteredDirectChats.length === 0)) && (
                      <EmptyState
                        icon={MessageSquare}
                        title="No direct chat conversations"
                        description="Discover teammates or apply to open projects to start direct collaboration."
                        actionText="Discover Teammates"
                        onAction={() => navigate('/candidates')}
                      />
                    )}
                  </>
                )}

              </div>
            </div>
          ) : (
            /* STATE 2: ACTIVE DIRECT MESSAGING THREAD VIEW */
            <div className="flex-1 flex flex-col h-full min-w-0 w-full overflow-hidden">
              
              {/* Top Header: Back, Avatar, Name, Online Status & More Menu */}
              <div className="p-3 sm:p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 min-w-0">
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={clearChatSelection}
                    className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-cyan-400 font-semibold text-xs flex items-center space-x-1 flex-shrink-0 hover:bg-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                  </button>

                  {chatType === 'direct' && selectedUser ? (
                    <div className="flex items-center space-x-2.5 truncate min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-cyan-700/40 text-cyan-300 font-bold flex items-center justify-center text-xs overflow-hidden border border-cyan-500/30">
                          {selectedUser.avatar ? (
                            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                          ) : (
                            selectedUser.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-gray-900 ${
                            onlineUsers.includes(selectedUser._id) ? 'bg-emerald-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-bold text-white text-sm truncate">{selectedUser.name}</h2>
                        <span className="text-[10px] text-emerald-400 block font-medium">
                          {onlineUsers.includes(selectedUser._id) ? '● Online' : '○ Offline'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2.5 truncate min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        #
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-white text-sm truncate"># {selectedProject?.title || 'Project Group Chat'}</h2>
                        <span className="text-[10px] text-cyan-400">Team Broadcast</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* More Menu Dropdown */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {moreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 glass-panel rounded-2xl shadow-2xl py-1.5 border border-gray-800 z-50 animate-fadeIn text-xs">
                      {selectedUser && (
                        <button
                          onClick={() => navigate(`/candidates/${selectedUser._id}`)}
                          className="w-full flex items-center space-x-2 px-3.5 py-2 text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                        >
                          <User className="w-4 h-4 text-cyan-400" />
                          <span>View Profile</span>
                        </button>
                      )}
                      <button
                        onClick={() => { setMessages([]); setMoreMenuOpen(false); showSuccess('Chat history cleared'); }}
                        className="w-full flex items-center space-x-2 px-3.5 py-2 text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                        <span>Clear History</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Thread Container */}
              <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-950/40 my-1 min-w-0 w-full">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    No direct messages yet. Send the first message!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    const senderName = isMe ? 'You' : (selectedUser?.name || 'Teammate');

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} min-w-0 w-full group`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-sm mt-1">
                          {isMe ? (
                            user?.avatar ? <img src={user.avatar} alt="You" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || 'Y'
                          ) : (
                            selectedUser?.avatar ? <img src={selectedUser.avatar} alt={senderName} className="w-full h-full object-cover" /> : senderName.charAt(0)
                          )}
                        </div>

                        {/* Bubble Container */}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 max-w-[82%] sm:max-w-md`}>
                          
                          <div
                            onClick={() => setSelectedMessageAction(selectedMessageAction === msg._id ? null : msg._id)}
                            className={`p-3 rounded-2xl text-xs shadow-md transition-all relative cursor-pointer ${
                              isMe 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700/80'
                            }`}
                          >
                            <p className="break-words leading-relaxed">{msg.content}</p>

                            {/* Timestamp & Read Ticks */}
                            <div className={`flex items-center justify-end space-x-1 text-[9px] mt-1 font-mono ${isMe ? 'text-cyan-200' : 'text-gray-400'}`}>
                              <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:42 PM'}</span>
                              {isMe && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                            </div>
                          </div>

                          {/* Message Context Action Menu */}
                          {selectedMessageAction === msg._id && (
                            <div className="flex gap-2 mt-1 px-1 text-[10px] font-semibold animate-fadeIn">
                              <button onClick={() => setReplyingTo(msg)} className="px-2 py-0.5 rounded bg-gray-800 text-cyan-300 hover:text-white flex items-center space-x-1">
                                <Reply className="w-3 h-3" />
                                <span>Reply</span>
                              </button>
                              <button onClick={() => handleCopyMessage(msg)} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 hover:text-white flex items-center space-x-1">
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                              {isMe && (
                                <button onClick={() => handleDeleteOwnMessage(msg._id)} className="px-2 py-0.5 rounded bg-red-950 text-red-400 hover:text-red-300 flex items-center space-x-1">
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {typingUser && (
                  <div className="flex items-center space-x-2 text-xs text-cyan-400 italic animate-pulse pt-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>{typingUser}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* REPLY PREVIEW BAR */}
              {replyingTo && (
                <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex justify-between items-center text-xs text-cyan-300 animate-fadeIn">
                  <div className="truncate">
                    <span className="font-bold text-white">Replying:</span> "{replyingTo.content}"
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white p-1">
                    <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </div>
              )}

              {/* EMOJI BAR PICKER TOGGLE */}
              {emojiBarOpen && (
                <div className="p-2.5 bg-gray-900 border-t border-gray-800 flex gap-3 text-lg justify-around animate-fadeIn">
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

              {/* MESSAGE INPUT BAR */}
              <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-gray-900/90 flex items-center gap-2 w-full min-w-0">
                
                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => showSuccess('Attachment file picker ready!')}
                  className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                  title="Attach file or image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setEmojiBarOpen(!emojiBarOpen)}
                  className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0"
                  title="Add Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  disabled={isSending}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleInputChange}
                  className="flex-1 min-w-0 bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isSending}
                  className="gradient-btn px-5 rounded-2xl font-bold text-white text-xs shadow-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>

              </form>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatPage;
