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

    // Handle Start Match (Host starts the match series -> moves to game selection)
    socket.on(SOCKET_EVENTS.ROOM_START_MATCH, () => {
      const updated = roomManager.startMatch(roomCode, playerId);
      if (updated) {
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, updated);
      }
    });

    // Handle Game Selection (Authorized picker selects which mini-game to play)
    socket.on(SOCKET_EVENTS.GAME_SELECT, (payload: { gameId: string }) => {
      const result = roomManager.selectGame(roomCode, playerId, payload.gameId);
      if (result) {
        io.to(roomChannel).emit(SOCKET_EVENTS.GAME_START, {
          gameId: result.activeGame.gameId,
          state: result.activeGame.state,
        });
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, result.room);
      } else {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_GAME_SELECTION',
          message: 'Could not select game. Make sure it is your turn to pick.',
        });
      }
    });

    // Handle Game Move (Active player sends a turn/move)
    socket.on(SOCKET_EVENTS.GAME_MOVE, (movePayload: any) => {
      const result = roomManager.handleMove(roomCode, playerId, movePayload);
      if (result.success && result.room && result.activeGame) {
        // Broadcast updated game state
        io.to(roomChannel).emit(SOCKET_EVENTS.GAME_STATE, {
          gameId: result.activeGame.gameId,
          state: result.activeGame.state,
        });

        // Broadcast updated room state
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, result.room);

        // If game reached terminal condition, broadcast completion
        if (result.isFinished && result.result) {
          io.to(roomChannel).emit(SOCKET_EVENTS.GAME_COMPLETE, {
            gameId: result.activeGame.gameId,
            result: result.result,
            match: result.room.currentMatch,
          });

          if (result.room.status === 'MATCH_COMPLETE') {
            io.to(roomChannel).emit(SOCKET_EVENTS.MATCH_COMPLETE, {
              match: result.room.currentMatch,
            });
          }
        }
      } else {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: result.reason || 'INVALID_MOVE',
          message: 'The submitted move could not be processed.',
        });
      }
    });

    // Handle Next Round
    socket.on(SOCKET_EVENTS.ROUND_NEXT, () => {
      const updatedRoom = roomManager.nextRound(roomCode, playerId);
      if (updatedRoom) {
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, updatedRoom);
        if (updatedRoom.activeGame) {
          io.to(roomChannel).emit(SOCKET_EVENTS.GAME_START, updatedRoom.activeGame);
        }
      }
    });

    // Handle Rematch Request
    socket.on(SOCKET_EVENTS.REMATCH_REQUEST, () => {
      const updatedRoom = roomManager.rematch(roomCode, playerId);
      if (updatedRoom) {
        io.to(roomChannel).emit(SOCKET_EVENTS.ROOM_STATE, updatedRoom);
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
