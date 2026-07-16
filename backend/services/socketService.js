import Notification from '../models/Notification.js';

let ioInstance = null;
const activeUsers = new Map(); // Maps userId -> socketId

export const initSocketService = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Map User to Socket Session
    socket.on('register_user', (userId) => {
      if (userId) {
        activeUsers.set(userId.toString(), socket.id);
        io.emit('online_users', Array.from(activeUsers.keys()));
        console.log(`User Registered on socket: ${userId} (${socket.id})`);
      }
    });

    // Real-Time Chat Channels
    socket.on('join_chat', (chatId) => {
      socket.join(chatId.toString());
      console.log(`Socket ${socket.id} joined channel: ${chatId}`);
    });

    socket.on('typing_indicator', ({ chatId, userId, isTyping }) => {
      socket.to(chatId.toString()).emit('typing_status', { userId, isTyping });
    });

    socket.on('send_message', ({ chatId, message }) => {
      socket.to(chatId.toString()).emit('receive_message', message);
    });

    // Socket Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          activeUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit('online_users', Array.from(activeUsers.keys()));
        console.log(`User Disconnected: ${disconnectedUserId}`);
      }
    });
  });
};

// Dispatch a smart notification to a connected user, writing to db and emitting socket
export const dispatchSmartNotification = async (userId, { title, message, type }) => {
  try {
    // Write notification record to database
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'general',
    });

    // Emit live socket event if user is currently online
    if (ioInstance) {
      const socketId = activeUsers.get(userId.toString());
      if (socketId) {
        ioInstance.to(socketId).emit('smart_notification', notification);
        console.log(`Socket notification dispatched to online user: ${userId}`);
      }
    }

    return notification;
  } catch (error) {
    console.error('Failed to dispatch smart notification:', error);
  }
};
