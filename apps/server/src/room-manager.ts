import { customAlphabet } from 'nanoid';
import type { RoomState, RoomStatus, PlayerSlot, MatchState, ActiveGameData, GameResult } from '@bvb/shared';
import { getGameEngine } from './games/index.js';

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
  activeGame: ActiveGameData | null;
  selectingPlayerId?: string | null;
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
      activeGame: null,
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
      activeGame: room.activeGame,
      selectingPlayerId: room.selectingPlayerId || null,
      createdAt: room.createdAt,
    };
  }

  public startMatch(
    code: string,
    requesterPlayerId: string
  ): RoomState | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room) return null;

    // Both players must be connected
    if (!room.players.playerA || !room.players.playerB) return null;
    if (!room.players.playerA.isConnected || !room.players.playerB.isConnected) return null;

    // Only host can start the match series
    if (room.players.playerA.id !== requesterPlayerId) return null;

    // Round 1: Host picks the game!
    room.status = 'SELECTING_GAME';
    room.selectingPlayerId = room.players.playerA.id;
    room.activeGame = null;
    if (room.currentMatch) {
      room.currentMatch.status = 'IN_PROGRESS';
      room.currentMatch.nextPickerPlayerId = room.players.playerA.id;
    }
    room.updatedAt = Date.now();

    return this.sanitizeRoom(room);
  }

  public selectGame(
    code: string,
    requesterPlayerId: string,
    gameId: string
  ): { room: RoomState; activeGame: ActiveGameData } | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room) return null;

    // Both players must be connected
    if (!room.players.playerA || !room.players.playerB) return null;
    if (!room.players.playerA.isConnected || !room.players.playerB.isConnected) return null;

    // Verify room is in SELECTING_GAME status and requester is the authorized picker
    if (room.status !== 'SELECTING_GAME') return null;
    if (room.selectingPlayerId && room.selectingPlayerId !== requesterPlayerId) return null;

    const engine = getGameEngine(gameId);
    if (!engine) return null;

    const initialState = engine.createInitialState([room.players.playerA.id, room.players.playerB.id]);

    room.status = 'IN_GAME';
    room.selectingPlayerId = null;
    room.activeGame = {
      gameId,
      state: initialState,
    };

    if (room.currentMatch) {
      room.currentMatch.activeGameId = gameId;
    }

    room.updatedAt = Date.now();

    return {
      room: this.sanitizeRoom(room),
      activeGame: room.activeGame,
    };
  }

  public startGame(
    code: string,
    requesterPlayerId: string,
    gameId: string = 'tic-tac-toe'
  ): { room: RoomState; activeGame: ActiveGameData } | null {
    return this.selectGame(code, requesterPlayerId, gameId);
  }

  public handleMove(
    code: string,
    playerId: string,
    move: any
  ): {
    success: boolean;
    room?: RoomState;
    activeGame?: ActiveGameData;
    isFinished?: boolean;
    result?: GameResult;
    reason?: string;
  } {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room) return { success: false, reason: 'ROOM_NOT_FOUND' };
    if (room.status !== 'IN_GAME' || !room.activeGame) return { success: false, reason: 'NOT_IN_GAME' };

    const engine = getGameEngine(room.activeGame.gameId);
    if (!engine) return { success: false, reason: 'ENGINE_NOT_FOUND' };

    const context = { playerId, timestamp: Date.now() };

    const isValid = engine.validateMove(room.activeGame.state, move, context);
    if (!isValid) {
      return { success: false, reason: 'INVALID_MOVE' };
    }

    const nextState = engine.applyMove(room.activeGame.state, move, context);
    room.activeGame.state = nextState;
    room.updatedAt = Date.now();

    if (engine.isFinished(nextState)) {
      const result = engine.getResult(nextState);

      if (room.currentMatch) {
        if (result.winnerPlayerId === room.players.playerA?.id) {
          room.currentMatch.scores.playerA++;
        } else if (result.winnerPlayerId === room.players.playerB?.id) {
          room.currentMatch.scores.playerB++;
        }

        room.currentMatch.rounds.push({
          roundNumber: room.currentMatch.currentRoundNumber,
          gameId: room.activeGame.gameId,
          winnerPlayerId: result.winnerPlayerId,
          loserPlayerId: result.loserPlayerId,
          result: result.result,
          reason: result.reason,
          durationMs: 0,
          summary: result.summary,
        });

        const targetWins =
          room.currentMatch.seriesCondition.type === 'FIRST_TO_N'
            ? room.currentMatch.seriesCondition.targetPoints
            : 3;

        if (room.currentMatch.scores.playerA >= targetWins) {
          room.status = 'MATCH_COMPLETE';
          room.currentMatch.status = 'COMPLETED';
          room.currentMatch.seriesWinnerId = room.players.playerA?.id || null;
          room.selectingPlayerId = null;
        } else if (room.currentMatch.scores.playerB >= targetWins) {
          room.status = 'MATCH_COMPLETE';
          room.currentMatch.status = 'COMPLETED';
          room.currentMatch.seriesWinnerId = room.players.playerB?.id || null;
          room.selectingPlayerId = null;
        } else {
          room.status = 'ROUND_COMPLETE';
          // Game selection turn logic:
          // 1. Loser of the previous round picks next game!
          // 2. If Draw: Alternate player picks (player who did not pick the drawn game)
          const playerAId = room.players.playerA?.id;
          const playerBId = room.players.playerB?.id;
          let nextPicker: string | null = null;

          if (result.loserPlayerId) {
            nextPicker = result.loserPlayerId;
          } else {
            // Draw: Alternate picker
            const previousPicker = room.currentMatch.nextPickerPlayerId || playerAId;
            nextPicker = previousPicker === playerAId ? playerBId || null : playerAId || null;
          }

          room.selectingPlayerId = nextPicker;
          room.currentMatch.nextPickerPlayerId = nextPicker;
        }
      } else {
        room.status = 'ROUND_COMPLETE';
      }

      return {
        success: true,
        room: this.sanitizeRoom(room),
        activeGame: room.activeGame,
        isFinished: true,
        result,
      };
    }

    return {
      success: true,
      room: this.sanitizeRoom(room),
      activeGame: room.activeGame,
      isFinished: false,
    };
  }

  public nextRound(code: string, _requesterPlayerId: string): RoomState | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room) return null;

    if (room.currentMatch && room.status === 'ROUND_COMPLETE') {
      room.currentMatch.currentRoundNumber++;
      // Transition to game selection
      room.status = 'SELECTING_GAME';
      room.activeGame = null;
      room.selectingPlayerId = room.currentMatch.nextPickerPlayerId || room.players.playerA?.id || null;
      room.updatedAt = Date.now();
      return this.sanitizeRoom(room);
    }

    return null;
  }

  public rematch(code: string, _requesterPlayerId: string): RoomState | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room || !room.currentMatch) return null;

    room.currentMatch.scores = { playerA: 0, playerB: 0 };
    room.currentMatch.rounds = [];
    room.currentMatch.currentRoundNumber = 1;
    room.currentMatch.status = 'IN_PROGRESS';
    room.currentMatch.seriesWinnerId = null;
    room.currentMatch.nextPickerPlayerId = room.players.playerA?.id || null;

    // Reset to Game Selection with Host picking Round 1
    room.status = 'SELECTING_GAME';
    room.selectingPlayerId = room.players.playerA?.id || null;
    room.activeGame = null;
    room.updatedAt = Date.now();

    return this.sanitizeRoom(room);
  }
}

export const roomManager = new RoomManager();
