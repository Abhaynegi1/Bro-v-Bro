import type { FastifyInstance } from 'fastify';
import type { Server as SocketIOServer } from 'socket.io';
import { CreateRoomSchema, JoinRoomSchema, RoomCodeParamSchema, SOCKET_EVENTS } from '@bvb/shared';
import { roomManager } from './room-manager.js';

export function registerRoutes(app: FastifyInstance, io: SocketIOServer) {
  // Health check
  app.get('/api/health', async () => {
    return { status: 'ok', timestamp: Date.now() };
  });

  // Create room
  app.post('/api/rooms', async (request, reply) => {
    const parseResult = CreateRoomSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: parseResult.error.flatten(),
      });
    }

    const { hostName, targetWins } = parseResult.data;
    const result = roomManager.createRoom(hostName, targetWins);

    return reply.status(201).send({
      roomId: result.room.id,
      roomCode: result.room.code,
      playerId: result.playerId,
      sessionToken: result.sessionToken,
      room: result.room,
    });
  });

  // Pre-flight check / get room info
  app.get('/api/rooms/:code', async (request, reply) => {
    const paramResult = RoomCodeParamSchema.safeParse(request.params);
    if (!paramResult.success) {
      return reply.status(400).send({ error: 'INVALID_ROOM_CODE' });
    }

    const room = roomManager.getRoom(paramResult.data.code);
    if (!room) {
      return reply.status(404).send({ error: 'ROOM_NOT_FOUND', message: 'Room does not exist or has expired.' });
    }

    return reply.send({
      code: room.code,
      status: room.status,
      hostName: room.players.playerA?.name || null,
      isJoinable: room.players.playerB === null && room.status !== 'CLOSED',
    });
  });

  // Join room
  app.post('/api/rooms/:code/join', async (request, reply) => {
    const paramResult = RoomCodeParamSchema.safeParse(request.params);
    if (!paramResult.success) {
      return reply.status(400).send({ error: 'INVALID_ROOM_CODE' });
    }

    const bodyResult = JoinRoomSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        details: bodyResult.error.flatten(),
      });
    }

    const code = paramResult.data.code;
    const { guestName } = bodyResult.data;

    try {
      const result = roomManager.joinRoom(code, guestName);

      // Broadcast updated room state to all connected sockets in that room
      io.to(`room:${code}`).emit(SOCKET_EVENTS.ROOM_STATE, result.room);
      io.to(`room:${code}`).emit(SOCKET_EVENTS.ROOM_PLAYER_JOINED, {
        name: guestName,
        playerId: result.playerId,
      });

      return reply.status(200).send({
        roomId: result.room.id,
        roomCode: result.room.code,
        playerId: result.playerId,
        sessionToken: result.sessionToken,
        room: result.room,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      if (message === 'ROOM_NOT_FOUND') {
        return reply.status(404).send({ error: 'ROOM_NOT_FOUND', message: 'Room not found.' });
      }
      if (message === 'ROOM_FULL') {
        return reply.status(409).send({ error: 'ROOM_FULL', message: 'This room already has 2 players.' });
      }
      return reply.status(500).send({ error: 'SERVER_ERROR', message });
    }
  });
}
