import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchNotifications, markAllNotificationsRead } from '../../services/api';
import { 
  Briefcase, Users, FileText, Bell, MessageSquare, 
  Sparkles, ShieldAlert, LogOut, User, Menu, X, PlusCircle, Check
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Resume AI', path: '/resume-analyzer', icon: FileText, badge: 'Grok AI' },
    { name: 'My Teams', path: '/teams', icon: Users },
    { name: 'Chat', path: '/chat', icon: MessageSquare }
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 bg-[#0b0f19]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-sans tracking-tight gradient-text">
                PartnerFinder
              </span>
              <span className="text-[10px] block text-cyan-400 font-semibold tracking-wider uppercase -mt-1">
                Project & Skill Matching
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {user && navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Right Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/projects/new"
                  className="gradient-btn flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white shadow-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Project</span>
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 relative transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-[10px] font-bold text-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl py-2 border border-gray-800 z-50">
                      <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                        <span className="text-sm font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-cyan-400 hover:underline flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-800/50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-400">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n._id}
                              onClick={() => {
                                setNotifDropdownOpen(false);
                                if (n.link) navigate(n.link);
                              }}
                              className={`p-3 text-xs cursor-pointer transition-colors ${n.isRead ? 'opacity-60 hover:opacity-90' : 'bg-cyan-950/30 text-white font-medium'}`}
                            >
                              <div className="font-semibold text-cyan-300 mb-0.5">{n.title}</div>
                              <p className="text-gray-300">{n.message}</p>
                              <span className="text-[10px] text-gray-500 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="flex items-center space-x-2 border-l border-gray-800 pl-3">
                  <Link to="/profile" className="flex items-center space-x-2 text-sm text-gray-200 hover:text-cyan-400 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <span className="font-semibold">{user.name}</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-900/20" title="Admin Dashboard">
                      <ShieldAlert className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="gradient-btn px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && user && (
        <div className="md:hidden glass-panel border-b border-gray-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:bg-gray-800"
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 text-sm text-cyan-300 font-semibold">
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
            <button onClick={logout} className="text-sm text-red-400 font-semibold">Log Out</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
