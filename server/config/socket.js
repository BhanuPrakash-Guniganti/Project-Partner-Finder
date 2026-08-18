const { Server } = require('socket.io');

let io;
// Multi-connection tracking: Map<userIdString, Set<socketId>>
const userSocketsMap = new Map();

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
    return true;
  }
  return false;
};

const getOnlineUserIds = () => Array.from(userSocketsMap.keys());

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Auto-register user room if userId passed in handshake query or auth
    const handshakeUserId = normalizeId(socket.handshake.query?.userId || socket.handshake.auth?.userId);
    if (handshakeUserId) {
      addSocketForUser(handshakeUserId, socket.id);
      socket.userId = handshakeUserId;
      socket.join(`user_${handshakeUserId}`);
      io.emit('online_users', getOnlineUserIds());
      console.log(`[Socket.IO] Handshake auto-registered user: ${handshakeUserId} (socket ${socket.id})`);
    }

    // Register user socket & join private room explicitly
    socket.on('user_connected', (rawUserId) => {
      const userId = normalizeId(rawUserId);
      if (userId) {
        addSocketForUser(userId, socket.id);
        socket.userId = userId;
        socket.join(`user_${userId}`);
        io.emit('online_users', getOnlineUserIds());
        console.log(`[Socket.IO] User registered via event: ${userId} (socket ${socket.id})`);
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

    // Typing Indicators
    socket.on('typing', (data) => {
      if (data.projectId) {
        const room = `project_${normalizeId(data.projectId)}`;
        socket.to(room).emit('user_typing', data);
      } else if (data.recipientId) {
        const room = `user_${normalizeId(data.recipientId)}`;
        socket.to(room).emit('user_typing', data);
      }
    });

    socket.on('stop_typing', (data) => {
      if (data.projectId) {
        const room = `project_${normalizeId(data.projectId)}`;
        socket.to(room).emit('user_stop_typing', data);
      } else if (data.recipientId) {
        const room = `user_${normalizeId(data.recipientId)}`;
        socket.to(room).emit('user_stop_typing', data);
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

const sendApplicationToUser = (userId, applicationData) => {
  if (!io) return;
  const cleanUserId = normalizeId(userId);
  if (cleanUserId) {
    io.to(`user_${cleanUserId}`).emit('new_application', applicationData);
  }
};

const emitApplicationStatusUpdate = (applicantId, statusUpdateData) => {
  if (!io) return;
  const cleanApplicantId = normalizeId(applicantId);
  if (cleanApplicantId) {
    io.to(`user_${cleanApplicantId}`).emit('application_status_updated', statusUpdateData);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitDirectMessage,
  emitGroupMessage,
  sendNotificationToUser,
  sendApplicationToUser,
  emitApplicationStatusUpdate,
  getOnlineUserIds,
  normalizeId
};
