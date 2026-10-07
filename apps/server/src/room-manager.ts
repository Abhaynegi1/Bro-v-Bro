import { customAlphabet } from 'nanoid';
import type {
  RoomState,
  RoomStatus,
  PlayerSlot,
  MatchState,
  ActiveGameData,
  GameResult,
  DisconnectPauseState,
} from '@bvb/shared';
import { getGameEngine } from './games/index.js';
import { saveMatchResult } from './db/index.js';

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
  disconnectPause?: DisconnectPauseState | null;
  createdAt: number;
  updatedAt: number;
}

export class RoomManager {
  private roomsByCode = new Map<string, InternalRoom>();
  private socketToPlayer = new Map<string, { code: string; playerId: string }>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();
  private onRoomUpdatedCallback?: (code: string, isForfeit?: boolean) => void;

  public setOnRoomUpdated(cb: (code: string, isForfeit?: boolean) => void) {
    this.onRoomUpdatedCallback = cb;
  }

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

    const totalGamesNeeded = Math.min(6, 2 * targetWins - 1);
    const initialMatch: MatchState = {
      id: `match_${generateId()}`,
      seriesCondition: { type: 'FIRST_TO_N', targetPoints: targetWins },
      scores: { playerA: 0, playerB: 0 },
      rounds: [],
      currentRoundNumber: 1,
      activeGameId: null,
      status: 'IN_PROGRESS',
      seriesWinnerId: null,
      gamePlaylist: [],
      totalGamesNeeded,
      nextPickerPlayerId: playerId,
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

    // If this player was disconnected and caused a pause, unpause gracefully!
    if (room.disconnectPause && room.disconnectPause.disconnectedPlayerId === playerId) {
      if (this.disconnectTimers.has(room.code)) {
        clearTimeout(this.disconnectTimers.get(room.code)!);
        this.disconnectTimers.delete(room.code);
      }
      room.disconnectPause = null;
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

      // Trigger 30-second disconnect pause if an active match is in progress
      const isMatchActive = Boolean(
        room.currentMatch &&
        room.currentMatch.status === 'IN_PROGRESS' &&
        ['IN_GAME', 'SELECTING_GAME', 'ROUND_COMPLETE'].includes(room.status)
      );

      if (isMatchActive) {
        room.disconnectPause = {
          disconnectedPlayerId: foundPlayer.id,
          disconnectedPlayerName: foundPlayer.name,
          pausedAt: Date.now(),
          expiresAt: Date.now() + 30000,
        };

        if (this.disconnectTimers.has(room.code)) {
          clearTimeout(this.disconnectTimers.get(room.code)!);
        }

        const timer = setTimeout(() => {
          this.handleDisconnectExpiry(room.code, foundPlayer.id);
        }, 30000);
        this.disconnectTimers.set(room.code, timer);
      }

      return {
        room: this.sanitizeRoom(room),
        disconnectedPlayerId: foundPlayer.id,
      };
    }

    return null;
  }

  public handleDisconnectExpiry(code: string, disconnectedPlayerId: string): void {
    this.disconnectTimers.delete(code);
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room || !room.currentMatch || room.currentMatch.status !== 'IN_PROGRESS') return;

    const disconnectedPlayer =
      room.players.playerA?.id === disconnectedPlayerId
        ? room.players.playerA
        : room.players.playerB?.id === disconnectedPlayerId
        ? room.players.playerB
        : null;

    if (!disconnectedPlayer || disconnectedPlayer.isConnected) return;

    const winnerPlayer =
      room.players.playerA?.id === disconnectedPlayerId
        ? room.players.playerB
        : room.players.playerA;

    if (!winnerPlayer) return;

    room.currentMatch.status = 'COMPLETED';
    room.currentMatch.seriesWinnerId = winnerPlayer.id;
    room.status = 'MATCH_COMPLETE';
    room.disconnectPause = null;

    const targetGameId = room.activeGame?.gameId || 'forfeit';
    room.currentMatch.rounds.push({
      roundNumber: room.currentMatch.currentRoundNumber,
      gameId: targetGameId,
      winnerPlayerId: winnerPlayer.id,
      loserPlayerId: disconnectedPlayer.id,
      result: 'WIN',
      reason: 'FORFEIT',
      durationMs: 30000,
      summary: `${disconnectedPlayer.name} disconnected. Match awarded to ${winnerPlayer.name} by forfeit (30s reconnect timeout expired).`,
    });

    if (winnerPlayer.id === room.players.playerA?.id) {
      room.currentMatch.scores.playerA++;
    } else {
      room.currentMatch.scores.playerB++;
    }

    room.currentMatch.surrenderDocument = {
      id: `DECREE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      loserPlayerId: disconnectedPlayer.id,
      winnerPlayerId: winnerPlayer.id,
      loserName: disconnectedPlayer.name,
      winnerName: winnerPlayer.name,
      scoreWinner: Math.max(room.currentMatch.scores.playerA, room.currentMatch.scores.playerB),
      scoreLoser: Math.min(room.currentMatch.scores.playerA, room.currentMatch.scores.playerB),
      confessionClause: 'I disconnected in the heat of battle and hereby forfeit all honor.',
      isSigned: false,
    };

    room.updatedAt = Date.now();
    this.persistCompletedMatch(room);
    this.onRoomUpdatedCallback?.(room.code, true);
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

  public sanitizeRoom(room: InternalRoom, viewingPlayerId?: string): RoomState {
    const sanitizeSlot = (slot: InternalPlayerSlot | null): PlayerSlot | null => {
      if (!slot) return null;
      const { sessionToken, socketId, ...safeSlot } = slot;
      return safeSlot;
    };

    let activeGame = room.activeGame;
    if (activeGame && viewingPlayerId) {
      const engine = getGameEngine(activeGame.gameId);
      if (engine?.sanitizeStateForPlayer) {
        activeGame = {
          gameId: activeGame.gameId,
          state: engine.sanitizeStateForPlayer(activeGame.state, viewingPlayerId),
        };
      }
    }

    return {
      id: room.id,
      code: room.code,
      status: room.status,
      players: {
        playerA: sanitizeSlot(room.players.playerA),
        playerB: sanitizeSlot(room.players.playerB),
      },
      currentMatch: room.currentMatch,
      activeGame,
      selectingPlayerId: room.selectingPlayerId || null,
      disconnectPause: room.disconnectPause || null,
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

    const targetWins =
      room.currentMatch?.seriesCondition.type === 'FIRST_TO_N'
        ? room.currentMatch.seriesCondition.targetPoints
        : 3;
    const totalGamesNeeded = Math.min(6, 2 * targetWins - 1);

    // Enter Match Lineup Draft! Host begins drafting Round 1
    room.status = 'SELECTING_GAME';
    room.selectingPlayerId = room.players.playerA.id;
    room.activeGame = null;
    if (room.currentMatch) {
      room.currentMatch.status = 'IN_PROGRESS';
      room.currentMatch.gamePlaylist = [];
      room.currentMatch.totalGamesNeeded = totalGamesNeeded;
      room.currentMatch.nextPickerPlayerId = room.players.playerA.id;
    }
    room.updatedAt = Date.now();

    return this.sanitizeRoom(room);
  }

  public selectGame(
    code: string,
    requesterPlayerId: string,
    gameId: string
  ): { room: RoomState; activeGame: ActiveGameData | null } | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room || !room.currentMatch) return null;

    // Both players must be connected
    if (!room.players.playerA || !room.players.playerB) return null;
    if (!room.players.playerA.isConnected || !room.players.playerB.isConnected) return null;

    // Verify room is in SELECTING_GAME status and requester is the authorized picker
    if (room.status !== 'SELECTING_GAME') return null;
    if (room.selectingPlayerId && room.selectingPlayerId !== requesterPlayerId) return null;

    const engine = getGameEngine(gameId);
    if (!engine) return null;

    const targetWins =
      room.currentMatch.seriesCondition.type === 'FIRST_TO_N'
        ? room.currentMatch.seriesCondition.targetPoints
        : 3;
    const totalGamesNeeded = room.currentMatch.totalGamesNeeded || Math.min(6, 2 * targetWins - 1);
    room.currentMatch.totalGamesNeeded = totalGamesNeeded;

    if (!room.currentMatch.gamePlaylist) {
      room.currentMatch.gamePlaylist = [];
    }

    // Uniqueness rule: A game can only be drafted once across the playlist until all games are used
    if (room.currentMatch.gamePlaylist.includes(gameId)) {
      return null;
    }

    // Add selected game to the series playlist
    room.currentMatch.gamePlaylist.push(gameId);

    // If more games need to be drafted, alternate the picker!
    if (room.currentMatch.gamePlaylist.length < totalGamesNeeded) {
      const playerAId = room.players.playerA.id;
      const playerBId = room.players.playerB.id;
      const nextPicker = requesterPlayerId === playerAId ? playerBId : playerAId;

      room.selectingPlayerId = nextPicker;
      room.currentMatch.nextPickerPlayerId = nextPicker;
      room.updatedAt = Date.now();

      return {
        room: this.sanitizeRoom(room),
        activeGame: null,
      };
    }

    // Draft is complete! Launch Round 1 with the first game drafted
    const firstGameId = room.currentMatch.gamePlaylist[0];
    const firstEngine = getGameEngine(firstGameId);
    if (!firstEngine) return null;

    const initialState = firstEngine.createInitialState([room.players.playerA.id, room.players.playerB.id]);
    room.status = 'IN_GAME';
    room.selectingPlayerId = null;
    room.activeGame = {
      gameId: firstGameId,
      state: initialState,
    };
    room.currentMatch.activeGameId = firstGameId;
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
  ): { room: RoomState; activeGame: ActiveGameData | null } | null {
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
    if (room.disconnectPause) return { success: false, reason: 'MATCH_PAUSED_DISCONNECT' };
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
          if (room.players.playerA && room.players.playerB) {
            room.currentMatch.surrenderDocument = {
              id: `DECREE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              loserPlayerId: room.players.playerB.id,
              winnerPlayerId: room.players.playerA.id,
              loserName: room.players.playerB.name,
              winnerName: room.players.playerA.name,
              scoreWinner: room.currentMatch.scores.playerA,
              scoreLoser: room.currentMatch.scores.playerB,
              confessionClause: 'I hereby admit that my opponent is simply the superior gamer and diffed me fair and square.',
              isSigned: false,
            };
          }
          this.persistCompletedMatch(room);
        } else if (room.currentMatch.scores.playerB >= targetWins) {
          room.status = 'MATCH_COMPLETE';
          room.currentMatch.status = 'COMPLETED';
          room.currentMatch.seriesWinnerId = room.players.playerB?.id || null;
          room.selectingPlayerId = null;
          if (room.players.playerA && room.players.playerB) {
            room.currentMatch.surrenderDocument = {
              id: `DECREE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              loserPlayerId: room.players.playerA.id,
              winnerPlayerId: room.players.playerB.id,
              loserName: room.players.playerA.name,
              winnerName: room.players.playerB.name,
              scoreWinner: room.currentMatch.scores.playerB,
              scoreLoser: room.currentMatch.scores.playerA,
              confessionClause: 'I hereby admit that my opponent is simply the superior gamer and diffed me fair and square.',
              isSigned: false,
            };
          }
          this.persistCompletedMatch(room);
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
    if (!room || !room.currentMatch || !room.players.playerA || !room.players.playerB) return null;

    if (room.status === 'ROUND_COMPLETE') {
      room.currentMatch.currentRoundNumber++;
      const nextRoundIndex = room.currentMatch.currentRoundNumber - 1;

      let nextGameId: string | null = null;
      if (room.currentMatch.gamePlaylist && nextRoundIndex < room.currentMatch.gamePlaylist.length) {
        nextGameId = room.currentMatch.gamePlaylist[nextRoundIndex];
      }

      if (nextGameId) {
        const engine = getGameEngine(nextGameId);
        if (engine) {
          const initialState = engine.createInitialState([room.players.playerA.id, room.players.playerB.id]);
          room.status = 'IN_GAME';
          room.selectingPlayerId = null;
          room.activeGame = {
            gameId: nextGameId,
            state: initialState,
          };
          room.currentMatch.activeGameId = nextGameId;
          room.updatedAt = Date.now();
          return this.sanitizeRoom(room);
        }
      }

      // If playlist somehow exhausted (e.g. extra ties), allow picker to draft an extra round
      room.status = 'SELECTING_GAME';
      room.activeGame = null;
      room.selectingPlayerId = room.currentMatch.nextPickerPlayerId || room.players.playerA.id;
      room.updatedAt = Date.now();
      return this.sanitizeRoom(room);
    }

    return null;
  }

  public rematch(code: string, _requesterPlayerId: string): RoomState | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room || !room.currentMatch || !room.players.playerA) return null;

    if (this.disconnectTimers.has(room.code)) {
      clearTimeout(this.disconnectTimers.get(room.code)!);
      this.disconnectTimers.delete(room.code);
    }
    room.disconnectPause = null;

    const targetWins =
      room.currentMatch.seriesCondition.type === 'FIRST_TO_N'
        ? room.currentMatch.seriesCondition.targetPoints
        : 3;
    const totalGamesNeeded = Math.min(6, 2 * targetWins - 1);

    room.currentMatch.id = `match_${generateId()}`;
    room.currentMatch.scores = { playerA: 0, playerB: 0 };
    room.currentMatch.rounds = [];
    room.currentMatch.currentRoundNumber = 1;
    room.currentMatch.status = 'IN_PROGRESS';
    room.currentMatch.seriesWinnerId = null;
    room.currentMatch.gamePlaylist = [];
    room.currentMatch.totalGamesNeeded = totalGamesNeeded;
    room.currentMatch.nextPickerPlayerId = room.players.playerA.id;
    room.currentMatch.surrenderDocument = null;

    // Reset to Game Lineup Draft with Host picking first
    room.status = 'SELECTING_GAME';
    room.selectingPlayerId = room.players.playerA.id;
    room.activeGame = null;
    room.updatedAt = Date.now();

    return this.sanitizeRoom(room);
  }

  public signSurrenderDocument(
    code: string,
    playerId: string,
    signatureDataUrl: string,
    confessionClause?: string
  ): InternalRoom | null {
    const room = this.roomsByCode.get(code.toUpperCase());
    if (!room || !room.currentMatch) {
      return null;
    }

    if (!room.currentMatch.surrenderDocument) {
      const winnerId = room.currentMatch.seriesWinnerId;
      const winnerPlayer =
        winnerId === room.players.playerA?.id ? room.players.playerA : room.players.playerB;
      const loserPlayer =
        winnerId === room.players.playerA?.id ? room.players.playerB : room.players.playerA;

      if (winnerPlayer && loserPlayer) {
        room.currentMatch.surrenderDocument = {
          id: `DECREE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          loserPlayerId: loserPlayer.id,
          winnerPlayerId: winnerPlayer.id,
          loserName: loserPlayer.name,
          winnerName: winnerPlayer.name,
          scoreWinner: Math.max(room.currentMatch.scores.playerA, room.currentMatch.scores.playerB),
          scoreLoser: Math.min(room.currentMatch.scores.playerA, room.currentMatch.scores.playerB),
          confessionClause: confessionClause || 'I hereby admit that my opponent is simply the superior gamer.',
          isSigned: true,
          signedAt: Date.now(),
          signatureDataUrl,
        };
      }
    } else {
      room.currentMatch.surrenderDocument.isSigned = true;
      room.currentMatch.surrenderDocument.signedAt = Date.now();
      room.currentMatch.surrenderDocument.signatureDataUrl = signatureDataUrl;
      if (confessionClause) {
        room.currentMatch.surrenderDocument.confessionClause = confessionClause;
      }
    }

    room.updatedAt = Date.now();
    return room;
  }

  private persistCompletedMatch(room: InternalRoom) {
    if (!room.currentMatch || !room.players.playerA || !room.players.playerB) return;
    const match = room.currentMatch;
    const winnerId = match.seriesWinnerId;
    const winnerName =
      winnerId === room.players.playerA.id
        ? room.players.playerA.name
        : winnerId === room.players.playerB.id
        ? room.players.playerB.name
        : null;

    const targetWins =
      match.seriesCondition.type === 'FIRST_TO_N'
        ? match.seriesCondition.targetPoints
        : 3;

    saveMatchResult({
      id: match.id,
      roomCode: room.code,
      targetWins,
      playerAId: room.players.playerA.id,
      playerAName: room.players.playerA.name,
      playerBId: room.players.playerB.id,
      playerBName: room.players.playerB.name,
      winnerId,
      winnerName,
      scoreA: match.scores.playerA,
      scoreB: match.scores.playerB,
      totalRounds: match.rounds.length,
      rounds: match.rounds,
    }).catch((err) => {
      console.error('Error persisting completed match to Neon DB:', err);
    });
  }
}

export const roomManager = new RoomManager();
