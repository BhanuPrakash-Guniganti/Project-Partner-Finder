import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Compass, MessageSquare, User } from 'lucide-react';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Discover', path: '/projects', icon: Compass },
    { name: 'Chats', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0b0f19]/95 backdrop-blur-md border-t border-gray-800/80 px-4 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-xl">
      <div className="flex items-center justify-between max-w-md mx-auto h-[52px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            location.pathname === item.path || 
            (item.path === '/projects' && (location.pathname.startsWith('/projects') || location.pathname.startsWith('/candidates')));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-colors ${
                isActive ? 'text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]'}`} />
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'text-cyan-400 font-semibold' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
