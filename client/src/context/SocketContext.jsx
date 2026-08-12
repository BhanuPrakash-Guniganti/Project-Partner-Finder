import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.MODE === 'production') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:5000';
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      const socketUrl = getSocketUrl();
      const newSocket = io(socketUrl, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('[Socket.IO] Connected to backend server:', newSocket.id);
        setIsConnected(true);
        newSocket.emit('user_connected', user._id);
      });

      newSocket.on('reconnect', () => {
        console.log('[Socket.IO] Reconnected to backend server');
        setIsConnected(true);
        newSocket.emit('user_connected', user._id);
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('[Socket.IO] Disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('[Socket.IO] Connection error:', error.message);
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users || []);
      });

      newSocket.on('new_notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
