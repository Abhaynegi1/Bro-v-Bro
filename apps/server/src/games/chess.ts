import { Chess } from 'chess.js';
import type {
  GameDefinition,
  ChessState,
  ChessMove,
  ChessMoveRecord,
  MoveContext,
  GameResult,
} from '@bvb/shared';

const DEFAULT_CLOCK_MS = 120_000; // 2 minutes (120s) blitz clock

export class ChessEngine implements GameDefinition<ChessState, ChessMove> {
  public readonly id = 'chess';
  public readonly name = 'Speed Chess';
  public readonly description =
    'Fast-paced 1v1 blitz chess with server-authoritative move verification and clocks.';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): ChessState {
    const chess = new Chess();
    const now = Date.now();

    return {
      playerWhiteId: playerIds[0],
      playerBlackId: playerIds[1],
      currentTurnPlayerId: playerIds[0], // White moves first
      fen: chess.fen(),
      history: [],
      clocks: {
        [playerIds[0]]: DEFAULT_CLOCK_MS,
        [playerIds[1]]: DEFAULT_CLOCK_MS,
      },
      lastMoveTimestamp: now,
      initialTimeMs: DEFAULT_CLOCK_MS,
      status: 'IN_PROGRESS',
      reason: undefined,
      winnerPlayerId: null,
      loserPlayerId: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      moveCount: 0,
      lastMove: null,
      summary: undefined,
    };
  }

  public validateMove(
    state: ChessState,
    move: ChessMove,
    context: MoveContext
  ): boolean {
    if (state.status !== 'IN_PROGRESS') return false;
    if (
      context.playerId !== state.playerWhiteId &&
      context.playerId !== state.playerBlackId
    ) {
      return false;
    }

    if (move.action === 'RESIGN') {
      return true;
    }

    if (move.action === 'CLAIM_TIMEOUT') {
      // Must be opponent claiming that active player ran out of time
      if (context.playerId === state.currentTurnPlayerId) return false;
      const elapsed = Math.max(0, context.timestamp - state.lastMoveTimestamp);
      const remainingTime = state.clocks[state.currentTurnPlayerId] - elapsed;
      return remainingTime <= 0;
    }

    if (move.action === 'MOVE') {
      if (context.playerId !== state.currentTurnPlayerId) return false;
      if (!move.from || !move.to) return false;

      const elapsed = Math.max(0, context.timestamp - state.lastMoveTimestamp);
      const remainingTime = state.clocks[context.playerId] - elapsed;
      if (remainingTime <= 0) {
        // Clock expired: move is accepted so applyMove can trigger timeout defeat
        return true;
      }

      try {
        const chess = new Chess(state.fen);
        const testMove = chess.move({
          from: move.from.toLowerCase(),
          to: move.to.toLowerCase(),
          promotion: move.promotion || 'q',
        });
        return testMove !== null;
      } catch {
        return false;
      }
    }

    return false;
  }

  public applyMove(
    state: ChessState,
    move: ChessMove,
    context: MoveContext
  ): ChessState {
    const isWhite = context.playerId === state.playerWhiteId;
    const opponentId = isWhite ? state.playerBlackId : state.playerWhiteId;
    const activePlayerId = state.currentTurnPlayerId;
    const nonActivePlayerId =
      activePlayerId === state.playerWhiteId
        ? state.playerBlackId
        : state.playerWhiteId;

    if (move.action === 'RESIGN') {
      return {
        ...state,
        status: 'WIN',
        reason: 'RESIGNED',
        winnerPlayerId: opponentId,
        loserPlayerId: context.playerId,
        summary: 'Resignation! Victory awarded to opponent.',
      };
    }

    if (move.action === 'CLAIM_TIMEOUT') {
      const elapsed = Math.max(0, context.timestamp - state.lastMoveTimestamp);
      const updatedClocks = {
        ...state.clocks,
        [activePlayerId]: Math.max(0, state.clocks[activePlayerId] - elapsed),
      };

      return {
        ...state,
        clocks: updatedClocks,
        status: 'WIN',
        reason: 'TIMEOUT',
        winnerPlayerId: nonActivePlayerId,
        loserPlayerId: activePlayerId,
        summary: 'Clock expired! Flag fell on time.',
      };
    }

    // move.action === 'MOVE'
    const elapsed = Math.max(0, context.timestamp - state.lastMoveTimestamp);
    const remainingTime = state.clocks[context.playerId] - elapsed;
    const updatedClocks = {
      ...state.clocks,
      [context.playerId]: Math.max(0, remainingTime),
    };

    if (remainingTime <= 0) {
      return {
        ...state,
        clocks: updatedClocks,
        status: 'WIN',
        reason: 'TIMEOUT',
        winnerPlayerId: opponentId,
        loserPlayerId: context.playerId,
        summary: 'Clock expired! Flag fell before move was executed.',
      };
    }

    const chess = new Chess(state.fen);
    const moveResult = chess.move({
      from: move.from.toLowerCase(),
      to: move.to.toLowerCase(),
      promotion: move.promotion || 'q',
    });

    if (!moveResult) {
      return state;
    }

    const moveRecord: ChessMoveRecord = {
      san: moveResult.san,
      from: moveResult.from,
      to: moveResult.to,
      piece: moveResult.piece,
      color: moveResult.color,
      captured: moveResult.captured,
      promotion: moveResult.promotion,
    };

    const isCheckmate = chess.isCheckmate();
    const isStalemate = chess.isStalemate();
    const isThreefold = chess.isThreefoldRepetition();
    const isInsufficient = chess.isInsufficientMaterial();
    const isDraw = chess.isDraw();
    const isCheck = chess.isCheck();

    const nextHistory = [...state.history, moveRecord];
    const lastMove = {
      from: moveResult.from,
      to: moveResult.to,
      san: moveResult.san,
    };

    if (isCheckmate) {
      return {
        ...state,
        fen: chess.fen(),
        clocks: updatedClocks,
        history: nextHistory,
        moveCount: state.moveCount + 1,
        lastMove,
        status: 'WIN',
        reason: 'CHECKMATE',
        winnerPlayerId: context.playerId,
        loserPlayerId: opponentId,
        isCheck: true,
        isCheckmate: true,
        isStalemate: false,
        isDraw: false,
        summary: `Checkmate! Move ${moveResult.san} delivered checkmate.`,
      };
    }

    if (isStalemate) {
      return {
        ...state,
        fen: chess.fen(),
        clocks: updatedClocks,
        history: nextHistory,
        moveCount: state.moveCount + 1,
        lastMove,
        status: 'DRAW',
        reason: 'STALEMATE',
        winnerPlayerId: null,
        loserPlayerId: null,
        isCheck: false,
        isCheckmate: false,
        isStalemate: true,
        isDraw: true,
        summary: 'Stalemate! Game ended in a draw.',
      };
    }

    if (isThreefold) {
      return {
        ...state,
        fen: chess.fen(),
        clocks: updatedClocks,
        history: nextHistory,
        moveCount: state.moveCount + 1,
        lastMove,
        status: 'DRAW',
        reason: 'THREEFOLD_REPETITION',
        winnerPlayerId: null,
        loserPlayerId: null,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: true,
        summary: 'Draw by threefold repetition.',
      };
    }

    if (isInsufficient) {
      return {
        ...state,
        fen: chess.fen(),
        clocks: updatedClocks,
        history: nextHistory,
        moveCount: state.moveCount + 1,
        lastMove,
        status: 'DRAW',
        reason: 'INSUFFICIENT_MATERIAL',
        winnerPlayerId: null,
        loserPlayerId: null,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: true,
        summary: 'Draw by insufficient material.',
      };
    }

    if (isDraw) {
      return {
        ...state,
        fen: chess.fen(),
        clocks: updatedClocks,
        history: nextHistory,
        moveCount: state.moveCount + 1,
        lastMove,
        status: 'DRAW',
        reason: '50_MOVE_RULE',
        winnerPlayerId: null,
        loserPlayerId: null,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: true,
        summary: 'Draw by 50-move rule.',
      };
    }

    return {
      ...state,
      fen: chess.fen(),
      clocks: updatedClocks,
      currentTurnPlayerId: opponentId,
      lastMoveTimestamp: context.timestamp,
      history: nextHistory,
      moveCount: state.moveCount + 1,
      lastMove,
      isCheck,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
    };
  }

  public isFinished(state: ChessState): boolean {
    return state.status !== 'IN_PROGRESS';
  }

  public getResult(state: ChessState): GameResult {
    if (state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId || null,
        result: 'WIN',
        reason: state.reason === 'TIMEOUT' ? 'TIMEOUT' : 'COMPLETED',
        summary: state.summary || 'Victory in Speed Chess!',
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: state.summary || 'Speed Chess ended in a draw.',
    };
  }
}

export const chessEngine = new ChessEngine();
