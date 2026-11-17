// server/socket.js
// Real-time layer: one open connection per browser tab.
// The REST routes still SAVE messages; this file only DELIVERS them live.
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Room from './models/Room.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN },
  });

  // Like requireAuth, but for the socket connection: no valid token, no connection
  io.use((socket, next) => {
    try {
      const { userId } = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      socket.userId = userId;
      next();
    } catch {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    // The browser opened a room: put this connection in that room's group
    socket.on('room:join', async (roomId) => {
      try {
        if (mongoose.isValidObjectId(roomId) && (await Room.exists({ _id: roomId }))) {
          socket.join(roomId);
        }
      } catch (err) {
        console.error('room:join failed:', err.message);
      }
    });

    // The browser left the room
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
    });
  });
}

// Routes call this to send events. It stays null in tests (no server is started),
// which is why routes write getIO()?.to(...) with ?.
export const getIO = () => io;
