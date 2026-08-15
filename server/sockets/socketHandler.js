const jwt = require('jsonwebtoken');
const User = require('../models/User');

const presence = {}; // { boardId: [{ userId, name, socketId }] }
const socketToBoard = {}; // { socketId: boardId }
const userSocketMap = {}; // { userId: [socketId] }

function initSocket(io) {
  // Handshake authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name email avatarColor');
        if (user) {
          socket.user = user;
          return next();
        }
      }
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      // Still allow connection, but without authenticated user context
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket.io ready - Client connected:', socket.id);

    // Join a Board room
    socket.on('join_board', (payload) => {
      // Support either a simple string boardId or an object payload
      const boardId = typeof payload === 'object' ? payload.boardId : payload;
      const userPayload = typeof payload === 'object' ? payload.user : null;
      
      const activeUser = socket.user || userPayload;

      socket.join(`board_${boardId}`);
      socketToBoard[socket.id] = boardId;

      if (activeUser) {
        if (!presence[boardId]) {
          presence[boardId] = [];
        }

        // Avoid duplicate entry on same socket
        const exists = presence[boardId].some((u) => u.socketId === socket.id);
        if (!exists) {
          presence[boardId].push({
            userId: activeUser._id,
            name: activeUser.name,
            socketId: socket.id,
          });
        }

        // Broadcast updated presence list to everyone in the room
        io.to(`board_${boardId}`).emit('user_presence', presence[boardId]);
      }
    });

    // Identify user for direct notification routing
    socket.on('identify', (userId) => {
      if (userId) {
        socket.userId = userId;
        if (!userSocketMap[userId]) {
          userSocketMap[userId] = [];
        }
        if (!userSocketMap[userId].includes(socket.id)) {
          userSocketMap[userId].push(socket.id);
        }
        console.log(`Socket identified user ${userId} for socket ${socket.id}`);
      }
    });

    // Leave a Board room
    socket.on('leave_board', (payload) => {
      const boardId = typeof payload === 'object' ? payload.boardId : payload;
      socket.leave(`board_${boardId}`);
      
      delete socketToBoard[socket.id];
      removeUserFromPresence(io, boardId, socket.id);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      const boardId = socketToBoard[socket.id];
      if (boardId) {
        removeUserFromPresence(io, boardId, socket.id);
        delete socketToBoard[socket.id];
      }
      
      // Clean up in-memory socket maps
      if (socket.userId && userSocketMap[socket.userId]) {
        userSocketMap[socket.userId] = userSocketMap[socket.userId].filter((id) => id !== socket.id);
        if (userSocketMap[socket.userId].length === 0) {
          delete userSocketMap[socket.userId];
        }
      }
      console.log('Client disconnected:', socket.id);
    });
  });
}

// Helper to remove disconnected/leaving user from presence list
function removeUserFromPresence(io, boardId, socketId) {
  if (presence[boardId]) {
    presence[boardId] = presence[boardId].filter((u) => u.socketId !== socketId);
    
    // Broadcast updated presence
    io.to(`board_${boardId}`).emit('user_presence', presence[boardId]);

    // Clean up empty board arrays
    if (presence[boardId].length === 0) {
      delete presence[boardId];
    }
  }
}

function emitToUser(io, userId, event, data) {
  if (!io || !userId) return;
  const socketIds = userSocketMap[userId.toString()];
  if (socketIds && socketIds.length > 0) {
    socketIds.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
}

initSocket.emitToUser = emitToUser;
module.exports = initSocket;
