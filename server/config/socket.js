const { Server } = require('socket.io');

let io;
// Multi-connection tracking: Map<userIdString, Set<socketId>>
const userSocketsMap = new Map();

// Helper to normalize any ID (String, ObjectId, or populated Object) into a clean string
const normalizeId = (id) => {
  if (!id) return null;
  if (typeof id === 'string') return id;
  if (id._id) return id._id.toString();
  if (typeof id.toString === 'function') return id.toString();
  return String(id);
};

const addSocketForUser = (userId, socketId) => {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId) return;
  if (!userSocketsMap.has(cleanUserId)) {
    userSocketsMap.set(cleanUserId, new Set());
  }
  userSocketsMap.get(cleanUserId).add(socketId);
};

const removeSocketForUser = (userId, socketId) => {
  const cleanUserId = normalizeId(userId);
  if (!cleanUserId || !userSocketsMap.has(cleanUserId)) return false;
  const sockets = userSocketsMap.get(cleanUserId);
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSocketsMap.delete(cleanUserId);
    return true; // User has no remaining active socket connections
  }
  return false;
};

const getOnlineUserIds = () => Array.from(userSocketsMap.keys());

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Register user socket & join private room
    socket.on('user_connected', (rawUserId) => {
      const userId = normalizeId(rawUserId);
      if (userId) {
        addSocketForUser(userId, socket.id);
        socket.userId = userId;
        socket.join(`user_${userId}`);
        io.emit('online_users', getOnlineUserIds());
        console.log(`[Socket.IO] User registered: ${userId} (socket ${socket.id})`);
      }
    });

    // Join Project Chat Room
    socket.on('join_project_room', (rawProjectId) => {
      const projectId = normalizeId(rawProjectId);
      if (projectId) {
        const room = `project_${projectId}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave Project Chat Room
    socket.on('leave_project_room', (rawProjectId) => {
      const projectId = normalizeId(rawProjectId);
      if (projectId) {
        const room = `project_${projectId}`;
        socket.leave(room);
        console.log(`[Socket.IO] Socket ${socket.id} left room ${room}`);
      }
    });

    // Handle Direct Message socket emission backup from client
    socket.on('send_direct_message', (data) => {
      const recipientId = normalizeId(data.recipientId);
      if (recipientId) {
        io.to(`user_${recipientId}`).emit('receive_direct_message', data);
      }
    });

    // Handle Group Project Message
    socket.on('send_group_message', (data) => {
      const projectId = normalizeId(data.projectId);
      if (projectId) {
        const room = `project_${projectId}`;
        socket.to(room).emit('receive_group_message', data);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        const wentOffline = removeSocketForUser(socket.userId, socket.id);
        if (wentOffline) {
          io.emit('online_users', getOnlineUserIds());
        }
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

const emitDirectMessage = (recipientId, messageData) => {
  if (!io) return;
  const cleanRecipientId = normalizeId(recipientId);
  if (cleanRecipientId) {
    io.to(`user_${cleanRecipientId}`).emit('receive_direct_message', messageData);
  }
};

const emitGroupMessage = (projectId, messageData) => {
  if (!io) return;
  const cleanProjectId = normalizeId(projectId);
  if (cleanProjectId) {
    io.to(`project_${cleanProjectId}`).emit('receive_group_message', messageData);
  }
};

const sendNotificationToUser = (userId, notificationData) => {
  if (!io) return;
  const cleanUserId = normalizeId(userId);
  if (cleanUserId) {
    io.to(`user_${cleanUserId}`).emit('new_notification', notificationData);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitDirectMessage,
  emitGroupMessage,
  sendNotificationToUser,
  getOnlineUserIds,
  normalizeId
};
