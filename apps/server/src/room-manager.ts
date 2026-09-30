import { customAlphabet } from 'nanoid';
import type { RoomState, RoomStatus, PlayerSlot, MatchState } from '@bvb/shared';

// 5-character readable code excluding 0, O, 1, I, L
const generateReadableCode = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 5);
const generateSecretToken = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);
const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 16);

export interface InternalPlayerSlot extends PlayerSlot {
  sessionToken: string;
  socketId: string | null;
}

export interface InternalRoom {
  id: string;
  code: string;
  status: RoomStatus;
  players: {
    playerA: InternalPlayerSlot | null;
    playerB: InternalPlayerSlot | null;
  };
  currentMatch: MatchState | null;
  createdAt: number;
  updatedAt: number;
}

export class RoomManager {
  private roomsByCode = new Map<string, InternalRoom>();
  private socketToPlayer = new Map<string, { code: string; playerId: string }>();

  public createRoom(hostName: string, targetWins: number = 3): {
    room: RoomState;
    playerId: string;
    sessionToken: string;
  } {
    let code: string;
    do {
      code = generateReadableCode();
    } while (this.roomsByCode.has(code));

    const roomId = `room_${generateId()}`;
    const playerId = `p_${generateId()}`;
    const sessionToken = `sec_${generateSecretToken()}`;
    const now = Date.now();

    const hostSlot: InternalPlayerSlot = {
      id: playerId,
      name: hostName,
      isHost: true,
      isReady: true, // Host is ready by default
      isConnected: false,
      lastSeenAt: now,
      sessionToken,
      socketId: null,
    };

    const initialMatch: MatchState = {
      id: `match_${generateId()}`,
      seriesCondition: { type: 'FIRST_TO_N', targetPoints: targetWins },
      scores: { playerA: 0, playerB: 0 },
      rounds: [],
      currentRoundNumber: 1,
      activeGameId: null,
      status: 'IN_PROGRESS',
      seriesWinnerId: null,
    };

    const room: InternalRoom = {
      id: roomId,
      code,
      status: 'WAITING',
      players: {
        playerA: hostSlot,
        playerB: null,
      },
      currentMatch: initialMatch,
      createdAt: now,
      updatedAt: now,
    };

    this.roomsByCode.set(code, room);

    return {
      room: this.sanitizeRoom(room),
      playerId,
      sessionToken,
    };
  }

  public getRoom(code: string): RoomState | null {
    const internal = this.roomsByCode.get(code.toUpperCase());
    return internal ? this.sanitizeRoom(internal) : null;
  }

  public getInternalRoom(code: string): InternalRoom | null {
    return this.roomsByCode.get(code.toUpperCase()) || null;
  }

  public joinRoom(code: string, guestName: string): {
    room: RoomState;
    playerId: string;
    sessionToken: string;
  } {
    const formattedCode = code.toUpperCase();
    const room = this.roomsByCode.get(formattedCode);

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.players.playerB !== null) {
      throw new Error('ROOM_FULL');
    }

    if (room.status === 'CLOSED') {
      throw new Error('ROOM_CLOSED');
    }

    const playerId = `p_${generateId()}`;
    const sessionToken = `sec_${generateSecretToken()}`;
    const now = Date.now();

    const guestSlot: InternalPlayerSlot = {
      id: playerId,
      name: guestName,
      isHost: false,
      isReady: true, // Auto-ready upon joining
      isConnected: false,
      lastSeenAt: now,
      sessionToken,
      socketId: null,
    };

    room.players.playerB = guestSlot;
    room.status = 'READY';
    room.updatedAt = now;

    return {
      room: this.sanitizeRoom(room),
      playerId,
      sessionToken,
    };
  }

  public authenticateSocket(
    code: string,
    playerId: string,
    sessionToken: string,
    socketId: string
  ): { internalRoom: InternalRoom; isHost: boolean } | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room) return null;

    let targetPlayer: InternalPlayerSlot | null = null;
    let isHost = false;

    if (room.players.playerA?.id === playerId) {
      targetPlayer = room.players.playerA;
      isHost = true;
    } else if (room.players.playerB?.id === playerId) {
      targetPlayer = room.players.playerB;
      isHost = false;
    }

    if (!targetPlayer || targetPlayer.sessionToken !== sessionToken) {
      return null;
    }

    targetPlayer.isConnected = true;
    targetPlayer.socketId = socketId;
    targetPlayer.lastSeenAt = Date.now();

    this.socketToPlayer.set(socketId, { code: room.code, playerId });
    return { internalRoom: room, isHost };
  }

  public handleSocketDisconnect(socketId: string): { room: RoomState; disconnectedPlayerId: string } | null {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return null;

    this.socketToPlayer.delete(socketId);
    const room = this.roomsByCode.get(mapping.code);
    if (!room) return null;

    let foundPlayer: InternalPlayerSlot | null = null;
    if (room.players.playerA?.id === mapping.playerId) {
      foundPlayer = room.players.playerA;
    } else if (room.players.playerB?.id === mapping.playerId) {
      foundPlayer = room.players.playerB;
    }

    if (foundPlayer) {
      foundPlayer.isConnected = false;
      foundPlayer.socketId = null;
      foundPlayer.lastSeenAt = Date.now();
      room.updatedAt = Date.now();
      return {
        room: this.sanitizeRoom(room),
        disconnectedPlayerId: foundPlayer.id,
      };
    }

    return null;
  }

  public toggleReady(code: string, playerId: string): RoomState | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room) return null;

    const player =
      room.players.playerA?.id === playerId
        ? room.players.playerA
        : room.players.playerB?.id === playerId
        ? room.players.playerB
        : null;

    if (!player) return null;

    player.isReady = !player.isReady;
    room.updatedAt = Date.now();
    return this.sanitizeRoom(room);
  }

  public sanitizeRoom(room: InternalRoom): RoomState {
    const sanitizeSlot = (slot: InternalPlayerSlot | null): PlayerSlot | null => {
      if (!slot) return null;
      const { sessionToken, socketId, ...safeSlot } = slot;
      return safeSlot;
    };

    return {
      id: room.id,
      code: room.code,
      status: room.status,
      players: {
        playerA: sanitizeSlot(room.players.playerA),
        playerB: sanitizeSlot(room.players.playerB),
      },
      currentMatch: room.currentMatch,
      createdAt: room.createdAt,
    };
  }
}

export const roomManager = new RoomManager();
