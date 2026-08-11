import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && user._id) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5000';
      const newSocket = io(socketUrl, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('[Socket.IO] Connected to backend server');
        newSocket.emit('user_connected', user._id);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
