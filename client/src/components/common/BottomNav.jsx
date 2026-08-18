import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, MessageSquare, User, Sparkles } from 'lucide-react';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: Home
    },
    {
      name: 'Discover',
      path: '/projects',
      icon: Compass
    },
    {
      name: 'Chats',
      path: '/chat',
      icon: MessageSquare
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User
    }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden glass-panel border-t border-gray-800/80 bg-[#0b0f19]/95 backdrop-blur-lg px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/projects' && location.pathname.startsWith('/projects'));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight whitespace-nowrap ${isActive ? 'text-cyan-400 font-semibold' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
