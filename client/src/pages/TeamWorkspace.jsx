import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { 
  fetchProjectById, fetchTeamByProjectId, fetchTasks, createTask, 
  updateTask, deleteTask, fetchMilestones, createMilestone, 
  fetchResources, createResource, fetchProjectMessages, sendMessageApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Briefcase, Layout, CheckSquare, Flag, Link as LinkIcon, 
  Users, MessageSquare, Plus, Send, Clock, Check, AlertCircle 
} from 'lucide-react';

const TeamWorkspace = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [resources, setResources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // New Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');

  // New Resource Modal State
  const [resModalOpen, setResModalOpen] = useState(false);
  const [resName, setResName] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState('GitHub');

  useEffect(() => {
    loadWorkspaceData();
  }, [projectId]);

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

      socket.on('receive_group_message', handleGroupMsg);

      return () => {
        socket.emit('leave_project_room', projectId);
        socket.off('receive_group_message', handleGroupMsg);
      };
    }
  }, [socket, projectId]);

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
      setMessages(msgRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add resource.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgContent = newMessage.trim();

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
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Layout },
    { id: 'tasks', name: 'Kanban Tasks', icon: CheckSquare, badge: tasks.length },
    { id: 'milestones', name: 'Milestones', icon: Flag, badge: milestones.length },
    { id: 'resources', name: 'Resources', icon: LinkIcon, badge: resources.length },
    { id: 'team', name: 'Team Roster', icon: Users, badge: team?.members?.length },
    { id: 'chat', name: 'Live Team Chat', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        
        {/* Workspace Banner */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Team Collaboration Workspace</span>
              <h1 className="text-2xl font-extrabold text-white">{project?.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{project?.category} • {team?.members?.length} Active Members</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded bg-gray-800 text-[10px] text-gray-300">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Project Description</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{project?.description}</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Progress Summary</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Task Completion</span>
                    <span className="text-cyan-400 font-bold">
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full" 
                      style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KANBAN TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Kanban Task Board</h3>
              <button
                onClick={() => setTaskModalOpen(true)}
                className="gradient-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['To Do', 'In Progress', 'Review', 'Completed'].map(colStatus => {
                const colTasks = tasks.filter(t => t.status === colStatus);
                return (
                  <div key={colStatus} className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3 bg-gray-950/40">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                      <span className="text-xs font-bold text-cyan-300">{colStatus}</span>
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 font-bold">{colTasks.length}</span>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {colTasks.map(task => (
                        <div key={task._id} className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-2 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {task.priority}
                          </span>
                          <h4 className="font-bold text-white text-xs">{task.title}</h4>
                          {task.description && <p className="text-[11px] text-gray-400">{task.description}</p>}

                          {/* Quick Status Shift Controls */}
                          <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">{task.assignedTo?.name || 'Unassigned'}</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                              className="bg-gray-800 text-cyan-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
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

        {/* TAB 3: MILESTONES */}
        {activeTab === 'milestones' && (
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-base font-bold text-white">Project Milestones</h3>
              <div className="space-y-3">
                {milestones.map(m => (
                  <div key={m._id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white text-sm">{m.title}</span>
                      <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">{m.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Shared Project Resources</h3>
              <button
                onClick={() => setResModalOpen(true)}
                className="gradient-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource Link</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map(res => (
                <a
                  key={res._id}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card p-4 rounded-xl border border-gray-800 flex justify-between items-center hover:border-cyan-500/40"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400">{res.type}</span>
                    <h4 className="font-bold text-white text-sm">{res.name}</h4>
                    <span className="text-xs text-gray-500 truncate block max-w-xs">{res.url}</span>
                  </div>
                  <LinkIcon className="w-4 h-4 text-cyan-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TEAM ROSTER */}
        {activeTab === 'team' && (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white">Team Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {team?.members?.map(m => (
                <div key={m.userId?._id || m._id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center space-x-3 text-xs">
                  <div className="w-10 h-10 rounded-full bg-cyan-700/30 text-cyan-300 font-bold flex items-center justify-center">
                    {m.userId?.avatar ? (
                      <img src={m.userId.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      m.userId?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white">{m.userId?.name}</div>
                    <div className="text-cyan-400">{m.role} {m.isOwner && '(Project Lead)'}</div>
                    <div className="text-gray-500 text-[10px]">{m.userId?.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LIVE TEAM CHAT */}
        {activeTab === 'chat' && (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col h-[550px]">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>Real-time Project Chat Room</span>
            </h3>

            {/* Messages Scrollbox */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-950/60 rounded-xl border border-gray-800">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-gray-500 mb-0.5">{msg.senderId?.name || 'Member'}</div>
                    <div className={`p-3 rounded-xl max-w-xs sm:max-w-md text-xs ${
                      isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message to the team..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="gradient-btn px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Create Task Modal */}
        {taskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Task Title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <textarea
                  rows="2"
                  placeholder="Task Description"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-white"
                />
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
                <select
                  value={taskAssignedTo}
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="">Unassigned</option>
                  {team?.members?.map(m => (
                    <option key={m.userId?._id} value={m.userId?._id}>{m.userId?.name}</option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-lg">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Resource Modal */}
        {resModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Add Shared Resource Link</h3>
              <form onSubmit={handleAddResource} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Resource Name (e.g. GitHub Repo)"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="url"
                  required
                  placeholder="Resource URL (https://...)"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Google Drive">Google Drive</option>
                  <option value="Research Paper">Research Paper</option>
                  <option value="API">API</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setResModalOpen(false)} className="px-4 py-2 bg-gray-800 text-xs font-semibold text-gray-300 rounded-lg">Cancel</button>
                  <button type="submit" className="gradient-btn px-5 py-2 text-xs font-bold text-white rounded-lg">Save Resource</button>
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
