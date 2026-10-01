import type {
  GameDefinition,
  TicTacToeState,
  TicTacToeMove,
  TicTacToeCell,
  MoveContext,
  GameResult,
} from '@bvb/shared';

const WINNING_COMBINATIONS: [number, number, number][] = [
  [0, 1, 2], // Row 0
  [3, 4, 5], // Row 1
  [6, 7, 8], // Row 2
  [0, 3, 6], // Col 0
  [1, 4, 7], // Col 1
  [2, 5, 8], // Col 2
  [0, 4, 8], // Diagonal TL -> BR
  [2, 4, 6], // Diagonal TR -> BL
];

export class TicTacToeEngine implements GameDefinition<TicTacToeState, TicTacToeMove> {
  public readonly id = 'tic-tac-toe';
  public readonly name = 'Tic-Tac-Toe';
  public readonly description = 'Classic 3x3 grid showdown with instantaneous move syncing.';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): TicTacToeState {
    const [playerXId, playerOId] = playerIds;
    return {
      board: Array(9).fill(null),
      currentTurnPlayerId: playerXId, // Player X moves first
      playerXId,
      playerOId,
      winningLine: null,
      status: 'IN_PROGRESS',
      winnerPlayerId: null,
      moveCount: 0,
    };
  }

  public validateMove(state: TicTacToeState, move: TicTacToeMove, context: MoveContext): boolean {
    // 1. Must be in progress
    if (state.status !== 'IN_PROGRESS') {
      return false;
    }

    // 2. Must be this player's turn
    if (context.playerId !== state.currentTurnPlayerId) {
      return false;
    }

    // 3. Must be a valid board cell index (0..8)
    if (typeof move.cellIndex !== 'number' || move.cellIndex < 0 || move.cellIndex > 8) {
      return false;
    }

    // 4. Target cell must be vacant
    if (state.board[move.cellIndex] !== null) {
      return false;
    }

    return true;
  }

  public applyMove(state: TicTacToeState, move: TicTacToeMove, context: MoveContext): TicTacToeState {
    const symbol: TicTacToeCell = context.playerId === state.playerXId ? 'X' : 'O';
    const newBoard = [...state.board];
    newBoard[move.cellIndex] = symbol;

    const newMoveCount = state.moveCount + 1;

    // Check for winning lines
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return {
          ...state,
          board: newBoard,
          winningLine: [a, b, c],
          status: 'WIN',
          winnerPlayerId: context.playerId,
          moveCount: newMoveCount,
        };
      }
    }

    // Check for draw (board full without winner)
    if (newMoveCount >= 9 || newBoard.every((cell) => cell !== null)) {
      return {
        ...state,
        board: newBoard,
        winningLine: null,
        status: 'DRAW',
        winnerPlayerId: null,
        moveCount: newMoveCount,
      };
    }

    // Switch turns
    const nextTurnPlayerId =
      context.playerId === state.playerXId ? state.playerOId : state.playerXId;

    return {
      ...state,
      board: newBoard,
      currentTurnPlayerId: nextTurnPlayerId,
      moveCount: newMoveCount,
    };
  }

  public isFinished(state: TicTacToeState): boolean {
    return state.status === 'WIN' || state.status === 'DRAW';
  }

  public getResult(state: TicTacToeState): GameResult {
    if (state.status === 'WIN' && state.winnerPlayerId) {
      const loserId =
        state.winnerPlayerId === state.playerXId ? state.playerOId : state.playerXId;
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: loserId,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: '3-in-a-row victory!',
      };
    }

    if (state.status === 'DRAW') {
      return {
        winnerPlayerId: null,
        loserPlayerId: null,
        result: 'DRAW',
        reason: 'COMPLETED',
        summary: "Cat's game (Draw).",
      };
    }

    throw new Error('Cannot getResult on unfinished game');
  }
}

export const ticTacToeEngine = new TicTacToeEngine();
