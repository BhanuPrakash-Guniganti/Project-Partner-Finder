import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { fetchNotifications, markAllNotificationsRead } from '../../services/api';
import AppLogo from './AppLogo';
import AppIcon from './AppIcon';
import { 
  Briefcase, Users, FileText, Bell, MessageSquare, 
  Sparkles, ShieldAlert, LogOut, User, Menu, X, PlusCircle, Check, Send,
  Sun, Moon, Monitor, Settings, Home, Compass, HelpCircle, ChevronRight 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setNotifDropdownOpen(false);
    setThemeDropdownOpen(false);
    setProfileDropdownOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
        setThemeDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notif) => {
        setNotifications(prev => {
          if (notif._id && prev.some(n => n._id === notif._id)) {
            return prev;
          }
          return [notif, ...prev];
        });
        setUnreadCount(prev => prev + 1);
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [socket]);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
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

  // Complete Mobile Drawer Navigation Menu
  const mobileMenuItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Discover', path: '/candidates', icon: Compass },
    { name: 'My Projects', path: '/projects', icon: Briefcase },
    { name: 'My Teams', path: '/teams', icon: Users },
    { name: 'Chats', path: '/chat', icon: MessageSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText },
    { name: 'AI Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/help', icon: HelpCircle }
  ];

  const desktopNavLinks = [
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Compass },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Resume AI', path: '/resume-analyzer', icon: FileText },
    { name: 'My Teams', path: '/teams', icon: Users },
    { name: 'Chat', path: '/chat', icon: MessageSquare }
  ];

  return (
    <nav ref={navRef} className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 bg-[#0b0f19]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Mobile Hamburger Icon & Official Brand Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors md:hidden"
              aria-label="Open mobile slide-out menu"
            >
              <Menu className="w-6 h-6 text-cyan-400" />
            </button>

            <Link to={user ? "/dashboard" : "/"} className="flex items-center group flex-shrink-0">
              <AppLogo size="md" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1.5 flex-1 justify-center max-w-4xl px-2">
            {user && desktopNavLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  state={link.path === '/chat' ? { resetChat: true } : undefined}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-cyan-400" />
              )}
            </button>

            {user ? (
              <>
                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-[10px] font-bold text-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Circle Avatar */}
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/50 text-white flex items-center justify-center font-bold text-xs shadow-md overflow-hidden flex-shrink-0"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors">
                  Log In
                </Link>
                <Link to="/register" className="gradient-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE SLIDE-OUT DRAWER WITH TRANSLUCENT BACKDROP */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel Container */}
          <div className="relative w-80 max-w-[85vw] bg-[#0b0f19] border-r border-gray-800 h-full flex flex-col justify-between shadow-2xl z-10 overflow-hidden animate-slideRight">
            
            {/* DRAWER TOP HEADER */}
            <div className="p-4 border-b border-gray-800/80 bg-gray-900/60 space-y-4">
              
              {/* Logo & Close Button */}
              <div className="flex justify-between items-center">
                <AppLogo size="sm" showSubtitle={false} />

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* User Profile Card */}
              {user && (
                <div className="p-3 rounded-2xl bg-gray-950 border border-gray-800/80 flex items-center space-x-3 shadow-md">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border border-cyan-400/40 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-xs truncate">{user.name}</h3>
                    <p className="text-[10px] text-cyan-400 truncate">{user.role || 'Full Stack Developer'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* DRAWER NAVIGATION MENU ITEMS */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-gray-800/40">
              <div className="space-y-1 pb-2">
                {mobileMenuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                          : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge ? (
                        <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* DRAWER BOTTOM: LOGOUT */}
            <div className="p-3 border-t border-gray-800/80 bg-gray-950/80">
              {user ? (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    logout();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-xs font-bold text-red-300 flex items-center justify-center space-x-2 transition-colors shadow-lg"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-bold text-gray-300 bg-gray-900 rounded-xl border border-gray-800"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="gradient-btn flex-1 py-2.5 text-center text-xs font-bold text-white rounded-xl shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
