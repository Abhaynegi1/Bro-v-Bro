import { Server as SocketIOServer } from 'socket.io';
import { SOCKET_EVENTS, SocketAuthSchema } from '@bvb/shared';
import { roomManager } from './room-manager.js';

export function setupSocketServer(io: SocketIOServer) {
  io.use((socket, next) => {
    const authResult = SocketAuthSchema.safeParse(socket.handshake.auth);
    if (!authResult.success) {
      return next(new Error('INVALID_AUTH_PAYLOAD'));
    }

    const { roomCode, playerId, sessionToken } = authResult.data;
    const auth = roomManager.authenticateSocket(roomCode, playerId, sessionToken, socket.id);

    if (!auth) {
      return next(new Error('AUTHENTICATION_FAILED'));
    }

    // Attach verified metadata to socket
    socket.data.roomCode = roomCode;
    socket.data.playerId = playerId;
    socket.data.isHost = auth.isHost;

    next();
  });

  io.on('connection', (socket) => {
    const roomCode: string = socket.data.roomCode;
    const playerId: string = socket.data.playerId;
    const roomChannel = `room:${roomCode}`;

    // Join Socket.IO room channel
    socket.join(roomChannel);

    // Broadcast updated room state immediately to all clients in the room
    const currentRoom = roomManager.getRoom(roomCode);
    if (currentRoom) {
      io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, currentRoom);
    }

    // Handle Ready toggle
    socket.on(SOCKET_EVENTS.ROOM_READY_TOGGLE, () => {
      const updated = roomManager.toggleReady(roomCode, playerId);
      if (updated) {
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, updated);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      const disconnectResult = roomManager.handleSocketDisconnect(socket.id);
      if (disconnectResult) {
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, disconnectResult.room);
      }
    });
  });
}
