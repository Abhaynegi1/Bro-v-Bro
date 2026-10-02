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

    const broadcastRoomAndGame = (code: string) => {
      const room = roomManager.getInternalRoom(code);
      if (!room) return;

      const playerA = room.players.playerA;
      const playerB = room.players.playerB;

      if (playerA?.socketId) {
        const roomA = roomManager.sanitizeRoom(room, playerA.id);
        io.to(playerA.socketId).emit(SOCKET_EVENTS.ROOM_STATE, roomA);
        if (roomA.activeGame) {
          io.to(playerA.socketId).emit(SOCKET_EVENTS.GAME_STATE, roomA.activeGame);
        }
      }

      if (playerB?.socketId) {
        const roomB = roomManager.sanitizeRoom(room, playerB.id);
        io.to(playerB.socketId).emit(SOCKET_EVENTS.ROOM_STATE, roomB);
        if (roomB.activeGame) {
          io.to(playerB.socketId).emit(SOCKET_EVENTS.GAME_STATE, roomB.activeGame);
        }
      }
    };

    const broadcastGameStart = (code: string) => {
      const room = roomManager.getInternalRoom(code);
      if (!room || !room.activeGame) return;

      const playerA = room.players.playerA;
      const playerB = room.players.playerB;

      if (playerA?.socketId) {
        const roomA = roomManager.sanitizeRoom(room, playerA.id);
        io.to(playerA.socketId).emit(SOCKET_EVENTS.GAME_START, roomA.activeGame);
        io.to(playerA.socketId).emit(SOCKET_EVENTS.ROOM_STATE, roomA);
      }

      if (playerB?.socketId) {
        const roomB = roomManager.sanitizeRoom(room, playerB.id);
        io.to(playerB.socketId).emit(SOCKET_EVENTS.GAME_START, roomB.activeGame);
        io.to(playerB.socketId).emit(SOCKET_EVENTS.ROOM_STATE, roomB);
      }
    };

    // Broadcast updated room state immediately on connect
    broadcastRoomAndGame(roomCode);

    // Handle Ready toggle
    socket.on(SOCKET_EVENTS.ROOM_READY_TOGGLE, () => {
      const updated = roomManager.toggleReady(roomCode, playerId);
      if (updated) {
        broadcastRoomAndGame(roomCode);
      }
    });

    // Handle Start Match (Host starts the match series -> moves to game selection)
    socket.on(SOCKET_EVENTS.ROOM_START_MATCH, () => {
      const updated = roomManager.startMatch(roomCode, playerId);
      if (updated) {
        broadcastRoomAndGame(roomCode);
      }
    });

    // Handle Game Selection (Authorized picker selects which mini-game to play)
    socket.on(SOCKET_EVENTS.GAME_SELECT, (payload: { gameId: string }) => {
      const result = roomManager.selectGame(roomCode, playerId, payload.gameId);
      if (result) {
        if (result.activeGame) {
          broadcastGameStart(roomCode);
        } else {
          broadcastRoomAndGame(roomCode);
        }
      } else {
        socket.emit(SOCKET_EVENTS.ERROR, {
          code: 'INVALID_GAME_SELECTION',
          message: 'Could not select game. Make sure it is your turn to pick and game is not already drafted.',
        });
      }
    });

    // Handle Game Move (Active player sends a turn/move)
    socket.on(SOCKET_EVENTS.GAME_MOVE, (movePayload: any) => {
      const result = roomManager.handleMove(roomCode, playerId, movePayload);
      if (result.success && result.room && result.activeGame) {
        broadcastRoomAndGame(roomCode);

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
        if (updatedRoom.activeGame) {
          broadcastGameStart(roomCode);
        } else {
          broadcastRoomAndGame(roomCode);
        }
      }
    });

    // Handle Rematch Request
    socket.on(SOCKET_EVENTS.REMATCH_REQUEST, () => {
      const updatedRoom = roomManager.rematch(roomCode, playerId);
      if (updatedRoom) {
        broadcastRoomAndGame(roomCode);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      const disconnectResult = roomManager.handleSocketDisconnect(socket.id);
      if (disconnectResult) {
        broadcastRoomAndGame(roomCode);
      }
    });
  });
}
