const { Server } = require('socket.io');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Register user socket
    socket.on('user_connected', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        socket.userId = userId.toString();
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`[Socket.IO] User registered: ${userId}`);
      }
    });

    // Join Project Chat Room
    socket.on('join_project_room', (projectId) => {
      const room = `project_${projectId}`;
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
    });

    // Leave Project Chat Room
    socket.on('leave_project_room', (projectId) => {
      const room = `project_${projectId}`;
      socket.leave(room);
      console.log(`[Socket.IO] Socket ${socket.id} left room ${room}`);
    });

    // Handle Direct Message
    socket.on('send_direct_message', (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId.toString());
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_direct_message', data);
      }
    });

    // Handle Group Project Message
    socket.on('send_group_message', (data) => {
      const room = `project_${data.projectId}`;
      socket.to(room).emit('receive_group_message', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

const sendNotificationToUser = (userId, notificationData) => {
  const socketId = onlineUsers.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit('new_notification', notificationData);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendNotificationToUser,
  onlineUsers
};
