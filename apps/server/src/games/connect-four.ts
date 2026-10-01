import type {
  GameDefinition,
  ConnectFourState,
  ConnectFourMove,
  ConnectFourCell,
  MoveContext,
  GameResult,
} from '@bvb/shared';

const ROWS = 6;
const COLS = 7;

export class ConnectFourEngine
  implements GameDefinition<ConnectFourState, ConnectFourMove>
{
  public readonly id = 'connect-four';
  public readonly name = 'Connect Four';
  public readonly description = '7x6 vertical gravity grid — drop tokens and connect four in a row!';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): ConnectFourState {
    const board: ConnectFourCell[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => null)
    );

    return {
      board,
      currentTurnPlayerId: playerIds[0], // Red / Host goes first
      playerRedId: playerIds[0],
      playerYellowId: playerIds[1],
      winningLine: null,
      status: 'IN_PROGRESS',
      winnerPlayerId: null,
      loserPlayerId: null,
      moveCount: 0,
      lastMove: null,
    };
  }

  public validateMove(
    state: ConnectFourState,
    move: ConnectFourMove,
    context: MoveContext
  ): boolean {
    if (state.status !== 'IN_PROGRESS') return false;
    if (context.playerId !== state.currentTurnPlayerId) return false;
    if (typeof move.column !== 'number' || move.column < 0 || move.column >= COLS) return false;

    // Top slot of the column must be empty
    if (state.board[0][move.column] !== null) return false;

    return true;
  }

  public applyMove(
    state: ConnectFourState,
    move: ConnectFourMove,
    context: MoveContext
  ): ConnectFourState {
    const isRed = context.playerId === state.playerRedId;
    const token: ConnectFourCell = isRed ? 'RED' : 'YELLOW';
    const otherPlayerId = isRed ? state.playerYellowId : state.playerRedId;

    // Deep clone the board
    const nextBoard: ConnectFourCell[][] = state.board.map((row) => [...row]);

    // Find the lowest empty row in the selected column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (nextBoard[r][move.column] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) {
      return state; // Illegal move safety
    }

    nextBoard[targetRow][move.column] = token;

    const nextState: ConnectFourState = {
      ...state,
      board: nextBoard,
      moveCount: state.moveCount + 1,
      lastMove: { row: targetRow, col: move.column, player: token },
    };

    // Check if this move created a 4-in-a-row
    const winningCoords = this.findWinningLine(nextBoard, targetRow, move.column, token);

    if (winningCoords) {
      nextState.status = 'WIN';
      nextState.winnerPlayerId = context.playerId;
      nextState.loserPlayerId = otherPlayerId;
      nextState.winningLine = winningCoords;
    } else if (nextState.moveCount >= ROWS * COLS) {
      nextState.status = 'DRAW';
    } else {
      nextState.currentTurnPlayerId = otherPlayerId;
    }

    return nextState;
  }

  public isFinished(state: ConnectFourState): boolean {
    return state.status !== 'IN_PROGRESS';
  }

  public getResult(state: ConnectFourState): GameResult {
    if (state.status === 'WIN' && state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId || null,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: 'Connected 4 in a row!',
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: 'Board full, gridlock draw!',
    };
  }

  /**
   * Checks horizontal, vertical, and both diagonals from the placed token.
   * Returns the list of 4 [row, col] winning coordinates or null.
   */
  private findWinningLine(
    board: ConnectFourCell[][],
    startRow: number,
    startCol: number,
    token: ConnectFourCell
  ): [number, number][] | null {
    const directions: [number, number][] = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal down-right (\)
      [-1, 1], // Diagonal up-right (/)
    ];

    for (const [dr, dc] of directions) {
      const line: [number, number][] = [[startRow, startCol]];

      // Check positive direction
      let r = startRow + dr;
      let c = startCol + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === token) {
        line.push([r, c]);
        r += dr;
        c += dc;
      }

      // Check negative direction
      r = startRow - dr;
      c = startCol - dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === token) {
        line.push([r, c]);
        r -= dr;
        c -= dc;
      }

      if (line.length >= 4) {
        return line.slice(0, 4);
      }
    }

    return null;
  }
}

export const connectFourEngine = new ConnectFourEngine();
