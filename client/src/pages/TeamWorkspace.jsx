import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { 
  fetchProjectById, fetchTeamByProjectId, fetchTasks, createTask, 
  updateTask, deleteTask, fetchMilestones, createMilestone, 
  fetchResources, createResource, fetchProjectMessages, sendMessageApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  Briefcase, Layout, CheckSquare, Flag, Link as LinkIcon, 
  Users, MessageSquare, Plus, Send, Clock, Check, CheckCheck, AlertCircle, 
  Paperclip, Smile, Image as ImageIcon, Reply, Copy, Trash2, MoreVertical, 
  ArrowLeft, ShieldCheck, X, Search 
} from 'lucide-react';

import ProjectChatDetailsModal from '../components/chat/ProjectChatDetailsModal';

const TeamWorkspace = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const messagesEndRef = useRef(null);

  const [activeTab, setActiveTab] = useState('chat'); // Default to Live Team Chat for project group chat focus
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [resources, setResources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Chat Enhancement States
  const [replyingTo, setReplyingTo] = useState(null);
  const [emojiBarOpen, setEmojiBarOpen] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMessageAction, setSelectedMessageAction] = useState(null);
  const [chatMoreMenuOpen, setChatMoreMenuOpen] = useState(false);
  const [chatDetailsModalOpen, setChatDetailsModalOpen] = useState(false);

  // Task & Resource Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');

  const [resModalOpen, setResModalOpen] = useState(false);
  const [resName, setResName] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState('GitHub');

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    if (socket && projectId) {
      socket.emit('join_project_room', projectId);

      const handleGroupMsg = (data) => {
        const msgProjId = typeof data.projectId === 'object' ? data.projectId?._id : data.projectId;
        if (msgProjId === projectId) {
          setMessages(prev => {
            if (data._id && prev.some(m => m._id === data._id)) return prev;
            return [...prev, data];
          });
        }
      };

      const handleTyping = (data) => {
        if (data.projectId === projectId && data.userName !== user?.name) {
          setTypingUser(`${data.userName} is typing...`);
          setTimeout(() => setTypingUser(''), 3000);
        }
      };

      socket.on('receive_group_message', handleGroupMsg);
      socket.on('user_typing', handleTyping);

      return () => {
        socket.emit('leave_project_room', projectId);
        socket.off('receive_group_message', handleGroupMsg);
        socket.off('user_typing', handleTyping);
      };
    }
  }, [socket, projectId, user]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const [projRes, teamRes, tasksRes, mileRes, resRes, msgRes] = await Promise.all([
        fetchProjectById(projectId),
        fetchTeamByProjectId(projectId),
        fetchTasks(projectId),
        fetchMilestones(projectId),
        fetchResources(projectId),
        fetchProjectMessages(projectId)
      ]);
      setProject(projRes.data);
      setTeam(teamRes.data);
      setTasks(tasksRes.data || []);
      setMilestones(mileRes.data || []);
      setResources(resRes.data || []);
      
      // Real project group messages
      setMessages(msgRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && projectId && user) {
      socket.emit('typing', { projectId, userName: user.name });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    let msgContent = newMessage.trim();
    if (replyingTo) {
      msgContent = `[Replying to ${replyingTo.senderId?.name || 'Message'}: "${replyingTo.content}"]\n${msgContent}`;
    }

    setIsSending(true);
    try {
      const res = await sendMessageApi({
        projectId,
        content: msgContent
      });

      setMessages(prev => {
        if (res.data._id && prev.some(m => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
      setNewMessage('');
      setReplyingTo(null);
      setEmojiBarOpen(false);
    } catch (err) {
      console.error(err);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await createTask({
        projectId,
        title: taskTitle,
        description: taskDesc,
        assignedTo: taskAssignedTo || null,
        priority: taskPriority
      });
      setTasks([res.data, ...tasks]);
      setTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      showSuccess('Task created successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
      showSuccess(`Task status updated to ${newStatus}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const res = await createResource({
        projectId,
        name: resName,
        url: resUrl,
        type: resType
      });
      setResources([res.data, ...resources]);
      setResModalOpen(false);
      setResName('');
      setResUrl('');
      showSuccess('Resource link saved!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add resource.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  const teamMemberCount = team?.members?.length || 0;
  const onlineCount = Math.min(teamMemberCount || 1, 3); // Active online count

  const tabs = [
    { id: 'chat', name: 'Project Group Chat', icon: MessageSquare },
    { id: 'overview', name: 'Overview', icon: Layout },
    { id: 'tasks', name: 'Kanban Tasks', icon: CheckSquare, badge: tasks.length },
    { id: 'resources', name: 'Resources', icon: LinkIcon, badge: resources.length },
    { id: 'team', name: 'Team Roster', icon: Users, badge: `${teamMemberCount}/${project?.teamSize || 4}` }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 w-full space-y-4 flex-1 min-w-0">
        
        {/* Workspace Banner */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-gray-800 space-y-3 shadow-xl">
          <div className="flex justify-between items-center min-w-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <button
                onClick={() => navigate('/projects')}
                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-cyan-400 font-semibold text-xs flex items-center space-x-1 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">Workspace</span>
                <h1 className="text-base sm:text-2xl font-extrabold text-white truncate">{project?.title}</h1>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex-shrink-0">
              ● {onlineCount} Online
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pt-2 border-t border-gray-800 no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md font-bold'
                      : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{tab.name}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded bg-gray-800 text-[10px] text-gray-300 font-mono">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB: PROJECT GROUP CHAT */}
        {activeTab === 'chat' && (
          <div className="glass-panel rounded-3xl border border-gray-800 flex flex-col h-[75vh] sm:h-[650px] shadow-2xl overflow-hidden relative">
            
            {/* CHAT HEADER */}
            <div className="p-3.5 sm:p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 min-w-0">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-extrabold text-base shadow-md flex-shrink-0">
                  #
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-white text-sm sm:text-base truncate"># {project?.title || 'Project Group Chat'}</h2>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                    <span>{teamMemberCount} members</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">● {onlineCount} online</span>
                  </div>
                </div>
              </div>

              {/* More Menu Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setChatMoreMenuOpen(!chatMoreMenuOpen)}
                  className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {chatMoreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-2xl py-1.5 border border-gray-800 z-50 animate-fadeIn text-xs">
                    <button
                      onClick={() => { setActiveTab('team'); setChatMoreMenuOpen(false); }}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                    >
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>View Team Roster</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('overview'); setChatMoreMenuOpen(false); }}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-gray-300 hover:text-white hover:bg-gray-800/60 text-left"
                    >
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      <span>Project Details</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CHAT MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/40 min-w-0 w-full flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-gray-400">
                  <MessageSquare className="w-10 h-10 text-cyan-400/40 mb-1 animate-pulse" />
                  <p className="text-sm font-semibold text-gray-200">No messages yet. Start the conversation!</p>
                  <p className="text-xs text-gray-500 max-w-xs">Send project updates, questions, or ideas to collaborate with your team in real time.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id || msg.senderId?.name === 'You';
                  const senderName = isMe ? 'You' : (msg.senderId?.name || 'Teammate');
                  const avatarUrl = msg.senderId?.avatar;

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} min-w-0 w-full group`}
                    >
                      {/* Member Avatar */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-sm mt-1">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
                        ) : (
                          senderName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Message Bubble Container */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 max-w-[82%] sm:max-w-md`}>
                        
                        {/* Sender Name for Incoming Messages */}
                        {!isMe && (
                          <span className="text-[10px] font-bold text-cyan-400 mb-0.5 px-1">{senderName}</span>
                        )}

                        {/* Message Bubble */}
                        <div
                          onClick={() => setSelectedMessageAction(selectedMessageAction === msg._id ? null : msg._id)}
                          className={`p-3 rounded-2xl text-xs shadow-md transition-all relative cursor-pointer ${
                            isMe 
                              ? 'bg-cyan-600 text-white rounded-tr-none' 
                              : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700/80'
                          }`}
                        >
                          <p className="break-words leading-relaxed">{msg.content}</p>

                          {/* Timestamp & Read Ticks */}
                          <div className={`flex items-center justify-end space-x-1 text-[9px] mt-1 font-mono ${isMe ? 'text-cyan-200' : 'text-gray-400'}`}>
                            <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '7:35 PM'}</span>
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
                  <span className="font-bold text-white">Replying to {replyingTo.senderId?.name || 'Message'}:</span> "{replyingTo.content}"
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-3.5 h-3.5" />
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
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 bg-gray-900/90 flex items-center gap-2 w-full min-w-0">
              
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => showSuccess('Attachment upload feature ready!')}
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
                className="flex-1 min-w-0 bg-gray-950 border border-gray-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isSending}
                className="gradient-btn px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-white text-xs shadow-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>

          </div>
        )}

        {/* OTHER TABS (Overview, Tasks, Resources, Team) */}
        {activeTab === 'overview' && (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Project Overview & Mission</h3>
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project?.description}</p>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Kanban Task Board</h3>
              <button onClick={() => setTaskModalOpen(true)} className="gradient-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['To Do', 'In Progress', 'Review', 'Completed'].map(colStatus => {
                const colTasks = tasks.filter(t => t.status === colStatus);
                return (
                  <div key={colStatus} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3 bg-gray-950/40">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <span className="text-xs font-bold text-cyan-300">{colStatus}</span>
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 font-bold">{colTasks.length}</span>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {colTasks.map(task => (
                        <div key={task._id} className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-2 text-xs">
                          <h4 className="font-bold text-white text-xs">{task.title}</h4>
                          <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">{task.assignedTo?.name || 'Unassigned'}</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                              className="bg-gray-800 text-cyan-300 rounded px-1.5 py-0.5 text-[10px]"
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Review">Review</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <span>Project Resources & Shared Links</span>
              </h3>
              <button 
                onClick={() => setResModalOpen(true)} 
                className="gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center space-x-1 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>

            {resources.length === 0 ? (
              <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 text-center space-y-2">
                <LinkIcon className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">No resources shared yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Share GitHub repositories, Figma links, documentation, and cloud resources with your project team.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {resources.map((res) => (
                  <a
                    key={res._id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-4 rounded-2xl border border-gray-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {res.type || 'Link'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs truncate group-hover:text-cyan-300">{res.name}</h4>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{res.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEAM ROSTER TAB */}
        {activeTab === 'team' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Project Team Roster ({teamMemberCount} of {project?.teamSize || 4} Positions Filled)</span>
              </h3>
            </div>

            {/* Creator / Owner Banner */}
            <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-cyan-700/30 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/30 text-sm overflow-hidden">
                  {project?.ownerId?.avatar ? (
                    <img src={project.ownerId.avatar} alt="Owner" className="w-full h-full object-cover" />
                  ) : (
                    project?.ownerId?.name?.charAt(0)?.toUpperCase() || 'O'
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>{project?.ownerId?.name || 'Project Owner'}</span>
                    <span className="px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-bold">
                      Admin / Creator
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-400">
                    {project?.creator?.participation !== false 
                      ? `Project Creator & ${project?.creator?.role || 'Project Lead'}`
                      : 'Project Creator (Management Only)'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            {team?.members && team.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.members.map((m, idx) => {
                  const memUser = m.userId || {};
                  return (
                    <div key={idx} className="glass-card p-4 rounded-2xl border border-gray-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-700/40 text-indigo-300 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                          {memUser.avatar ? (
                            <img src={memUser.avatar} alt="Member" className="w-full h-full object-cover" />
                          ) : (
                            memUser.name?.charAt(0)?.toUpperCase() || 'M'
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center space-x-1.5">
                            <span>{memUser.name || 'Team Member'}</span>
                            {m.isOwner && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                Creator
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-cyan-400 truncate">{m.role || 'Developer'}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/chat', { state: { recipient: memUser } })}
                        className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-cyan-400 hover:text-white"
                        title="Send Direct Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 text-center space-y-1">
                <div className="text-xs text-gray-300 font-medium">No team members currently in working team roster.</div>
                <div className="text-[11px] text-gray-500">Applications can be reviewed on the project details page.</div>
              </div>
            )}
          </div>
        )}

        {/* CREATE TASK MODAL */}
        {taskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Create Kanban Task</h3>
                <button onClick={() => setTaskModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Build Auth Middleware"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Task details and acceptance criteria..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Assign To</label>
                    <select
                      value={taskAssignedTo}
                      onChange={(e) => setTaskAssignedTo(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="">Unassigned</option>
                      {team?.members?.map((m) => (
                        <option key={m.userId?._id || m._id} value={m.userId?._id || m.userId}>
                          {m.userId?.name || 'Member'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(false)}
                    className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD RESOURCE MODAL */}
        {resModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Add Shared Resource</h3>
                <button onClick={() => setResModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Resource Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Figma UI Designs"
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">URL / Link *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={resUrl}
                    onChange={(e) => setResUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Resource Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="GitHub">GitHub</option>
                    <option value="Figma">Figma</option>
                    <option value="Notion">Notion / Docs</option>
                    <option value="API">API Endpoint</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setResModalOpen(false)}
                    className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md"
                  >
                    Save Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default TeamWorkspace;
