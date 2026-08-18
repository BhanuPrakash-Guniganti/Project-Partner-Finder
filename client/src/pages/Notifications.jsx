import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { 
  Bell, Check, UserPlus, CheckCircle2, Send, Sparkles, 
  MessageSquare, Users, FileText, Brain, ArrowRight, Trash2, CheckCheck 
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'projects' | 'messages' | 'connections'

  const [notifications, setNotifications] = useState([
    // TODAY
    {
      id: '1',
      group: 'today',
      category: 'connections',
      type: 'connection_request',
      title: 'New connection request',
      description: 'Alex Rivera wants to connect with you on PartnerFinder.',
      time: '10m ago',
      read: false,
      icon: UserPlus,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      link: '/candidates'
    },
    {
      id: '2',
      group: 'today',
      category: 'projects',
      type: 'project_accepted',
      title: 'Application Accepted!',
      description: 'Rahul accepted your application to join # AI Resume Analyzer.',
      time: '1h ago',
      read: false,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      link: '/teams'
    },
    {
      id: '3',
      group: 'today',
      category: 'messages',
      type: 'new_message',
      title: 'New message from Priya',
      description: '"The API endpoints are ready for integration!"',
      time: '3h ago',
      read: false,
      icon: MessageSquare,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      link: '/chat'
    },
    {
      id: '4',
      group: 'today',
      category: 'projects',
      type: 'project_invite',
      title: 'Project Invitation',
      description: 'Priya invited you to join # Campus Event Finder App as Lead UI/UX.',
      time: '5h ago',
      read: true,
      icon: Send,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      link: '/applications'
    },
    // YESTERDAY
    {
      id: '5',
      group: 'yesterday',
      category: 'projects',
      type: 'matching_project',
      title: '3 New projects match your skills',
      description: 'New projects requiring React, Node.js & MongoDB were published.',
      time: 'Yesterday',
      read: true,
      icon: Sparkles,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      link: '/projects'
    },
    {
      id: '6',
      group: 'yesterday',
      category: 'projects',
      type: 'member_joined',
      title: 'New team member joined',
      description: 'Bhanu joined team # AI Resume Analyzer as Full Stack Developer.',
      time: 'Yesterday',
      read: true,
      icon: Users,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      link: '/teams'
    },
    // EARLIER
    {
      id: '7',
      group: 'earlier',
      category: 'messages',
      type: 'resume_completed',
      title: 'Resume analysis completed',
      description: 'Your AI Resume Analysis is complete! Overall Match Score: 94%.',
      time: '3 days ago',
      read: true,
      icon: FileText,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      link: '/resume-analyzer'
    },
    {
      id: '8',
      group: 'earlier',
      category: 'connections',
      type: 'ai_recommendation',
      title: 'AI recommendation available',
      description: 'Grok AI engine generated 5 new compatible candidate recommendations.',
      time: '4 days ago',
      read: true,
      icon: Brain,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      link: '/recommendations'
    }
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showSuccess('All notifications marked as read');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    showSuccess('Notification history cleared');
  };

  const handleNotificationClick = (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    if (n.link) navigate(n.link);
  };

  // Filter notifications by activeTab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'projects') return n.category === 'projects';
    if (activeTab === 'messages') return n.category === 'messages';
    if (activeTab === 'connections') return n.category === 'connections';
    return true; // 'all'
  });

  const todayItems = filteredNotifications.filter(n => n.group === 'today');
  const yesterdayItems = filteredNotifications.filter(n => n.group === 'yesterday');
  const earlierItems = filteredNotifications.filter(n => n.group === 'earlier');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between w-full max-w-full overflow-hidden">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1 min-w-0">
        
        {/* Header Title & Mark All Read */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4 min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
              <Bell className="w-6 h-6 text-cyan-400 flex-shrink-0" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-black text-[11px] font-extrabold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400">Stay updated on team invites, connection requests & AI matches</p>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-cyan-300 hover:text-white flex items-center space-x-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar: All | Projects | Messages | Connections */}
        <div className="flex p-1 rounded-2xl bg-gray-900/80 border border-gray-800 max-w-md w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'projects'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Projects
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'messages'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Messages
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'connections'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Connections
          </button>
        </div>

        {/* Notification Grouped Sections */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up."
            description="No new notifications right now."
            actionText="Explore Projects"
            onAction={() => navigate('/projects')}
          />
        ) : (
          <div className="space-y-6">

            {/* GROUP 1: TODAY */}
            {todayItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Today</h3>
                <div className="space-y-2">
                  {todayItems.map(n => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 min-w-0 shadow-md ${
                          !n.read 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-cyan-500/5' 
                            : 'glass-panel border-gray-800 hover:bg-gray-900/60'
                        }`}
                      >
                        <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-md ${n.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-white text-sm truncate">{n.title}</h4>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" title="Unread" />
                              )}
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{n.description}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                          <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 hover:text-cyan-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GROUP 2: YESTERDAY */}
            {yesterdayItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Yesterday</h3>
                <div className="space-y-2">
                  {yesterdayItems.map(n => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 min-w-0 shadow-md ${
                          !n.read 
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-cyan-500/5' 
                            : 'glass-panel border-gray-800 hover:bg-gray-900/60'
                        }`}
                      >
                        <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-md ${n.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4 className="font-bold text-white text-sm truncate">{n.title}</h4>
                            <p className="text-xs text-gray-300 leading-relaxed">{n.description}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                          <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 hover:text-cyan-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GROUP 3: EARLIER */}
            {earlierItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Earlier</h3>
                <div className="space-y-2">
                  {earlierItems.map(n => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className="glass-panel p-4 rounded-2xl border border-gray-800 hover:bg-gray-900/60 cursor-pointer transition-all flex items-start justify-between gap-3 min-w-0 shadow-md"
                      >
                        <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-md ${n.iconBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4 className="font-bold text-white text-sm truncate">{n.title}</h4>
                            <p className="text-xs text-gray-300 leading-relaxed">{n.description}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                          <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 hover:text-cyan-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
