import type {
  GameDefinition,
  MinesweeperState,
  MinesweeperMove,
  MinesweeperPlayerState,
  MinesweeperCell,
  MoveContext,
  GameResult,
} from '@bvb/shared';

const ROWS = 9;
const COLS = 9;
const TOTAL_MINES = 10;
const TOTAL_SAFE_CELLS = ROWS * COLS - TOTAL_MINES; // 71

function generateMines(excludeRow?: number, excludeCol?: number): [number, number][] {
  const mines: [number, number][] = [];
  const set = new Set<string>();

  if (excludeRow !== undefined && excludeCol !== undefined) {
    set.add(`${excludeRow},${excludeCol}`);
  }

  while (mines.length < TOTAL_MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const key = `${r},${c}`;

    if (!set.has(key)) {
      set.add(key);
      mines.push([r, c]);
    }
  }

  return mines;
}

function countAdjacentMines(r: number, c: number, mineSet: Set<string>): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        if (mineSet.has(`${nr},${nc}`)) count++;
      }
    }
  }
  return count;
}

function createEmptyBoard(): MinesweeperCell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      status: 'HIDDEN' as const,
      adjacentMines: 0,
    }))
  );
}

export class MinesweeperEngine
  implements GameDefinition<MinesweeperState, MinesweeperMove>
{
  public readonly id = 'minesweeper';
  public readonly name = 'Minefield Battle';
  public readonly description = '1v1 speed race! Clear identical 9x9 minefields without detonating. First click safe!';
  public readonly minPlayers = 2 as const;
  public readonly maxPlayers = 2 as const;

  public createInitialState(playerIds: [string, string]): MinesweeperState {
    const mineLocations = generateMines();

    return {
      playerIds,
      rows: ROWS,
      cols: COLS,
      totalMines: TOTAL_MINES,
      totalSafeCells: TOTAL_SAFE_CELLS,
      mineLocations,
      playerStates: {
        [playerIds[0]]: {
          board: createEmptyBoard(),
          flagCount: 0,
          revealedCount: 0,
          isDead: false,
          hasWon: false,
          isCompleted: false,
        },
        [playerIds[1]]: {
          board: createEmptyBoard(),
          flagCount: 0,
          revealedCount: 0,
          isDead: false,
          hasWon: false,
          isCompleted: false,
        },
      },
      status: 'IN_PROGRESS',
      winnerPlayerId: null,
      loserPlayerId: null,
    };
  }

  public validateMove(
    state: MinesweeperState,
    move: MinesweeperMove,
    context: MoveContext
  ): boolean {
    if (state.status !== 'IN_PROGRESS') return false;
    if (!state.playerIds.includes(context.playerId)) return false;

    const pState = state.playerStates[context.playerId];
    if (!pState || pState.isCompleted || pState.isDead) return false;

    const { row, col, action } = move;
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;

    const cell = pState.board[row][col];

    if (action === 'REVEAL') {
      // Cannot reveal already revealed or flagged cell
      if (cell.status !== 'HIDDEN') return false;
    } else if (action === 'FLAG') {
      // Can only flag / unflag non-revealed cells
      if (cell.status !== 'HIDDEN' && cell.status !== 'FLAGGED') return false;
    }

    return true;
  }

  public applyMove(
    state: MinesweeperState,
    move: MinesweeperMove,
    context: MoveContext
  ): MinesweeperState {
    const { row, col, action } = move;
    const playerId = context.playerId;
    const otherPlayerId = state.playerIds.find((id) => id !== playerId)!;

    // Deep clone player state board
    const currentPState = state.playerStates[playerId];
    const newBoard = currentPState.board.map((r) => r.map((c) => ({ ...c })));
    let flagCount = currentPState.flagCount;
    let revealedCount = currentPState.revealedCount;
    let isDead = currentPState.isDead;
    let hasWon = currentPState.hasWon;
    let isCompleted = currentPState.isCompleted;

    let mineLocations = [...state.mineLocations];
    let mineSet = new Set(mineLocations.map(([r, c]) => `${r},${c}`));

    let status = state.status;
    let winnerPlayerId = state.winnerPlayerId;
    let loserPlayerId = state.loserPlayerId;
    let summary = state.summary;

    if (action === 'FLAG') {
      const cell = newBoard[row][col];
      if (cell.status === 'HIDDEN') {
        cell.status = 'FLAGGED';
        flagCount++;
      } else if (cell.status === 'FLAGGED') {
        cell.status = 'HIDDEN';
        flagCount--;
      }
    } else if (action === 'REVEAL') {
      // First click guarantee: if first reveal lands on a mine, relocate it!
      if (revealedCount === 0 && mineSet.has(`${row},${col}`)) {
        // Remove mine from (row, col)
        mineSet.delete(`${row},${col}`);
        mineLocations = mineLocations.filter(([mr, mc]) => !(mr === row && mc === col));

        // Find first empty cell to relocate the mine
        let relocated = false;
        for (let r = 0; r < ROWS && !relocated; r++) {
          for (let c = 0; c < COLS && !relocated; c++) {
            if ((r !== row || c !== col) && !mineSet.has(`${r},${c}`)) {
              mineSet.add(`${r},${c}`);
              mineLocations.push([r, c]);
              relocated = true;
            }
          }
        }
      }

      // Check if stepped on a mine
      if (mineSet.has(`${row},${col}`)) {
        // DETONATION!
        newBoard[row][col] = {
          status: 'EXPLODED',
          adjacentMines: 0,
          hasMine: true,
        };
        isDead = true;
        isCompleted = true;

        status = 'FINISHED';
        winnerPlayerId = otherPlayerId;
        loserPlayerId = playerId;
        summary = `Boom! Stepped on a hidden mine at [${row + 1},${col + 1}]. Opponent wins!`;
      } else {
        // Safe cell: reveal and flood fill if 0 adjacent mines
        const queue: [number, number][] = [[row, col]];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const [currR, currC] = queue.shift()!;
          const key = `${currR},${currC}`;
          if (visited.has(key)) continue;
          visited.add(key);

          const cell = newBoard[currR][currC];
          if (cell.status === 'REVEALED' || cell.status === 'FLAGGED') continue;

          const adj = countAdjacentMines(currR, currC, mineSet);
          cell.status = 'REVEALED';
          cell.adjacentMines = adj;
          revealedCount++;

          // If blank (0 adjacent mines), cascade reveal all 8 neighbors
          if (adj === 0) {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = currR + dr;
                const nc = currC + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                  if (newBoard[nr][nc].status === 'HIDDEN' && !mineSet.has(`${nr},${nc}`)) {
                    queue.push([nr, nc]);
                  }
                }
              }
            }
          }
        }

        // Check clearance victory condition
        if (revealedCount >= TOTAL_SAFE_CELLS) {
          hasWon = true;
          isCompleted = true;
          status = 'FINISHED';
          winnerPlayerId = playerId;
          loserPlayerId = otherPlayerId;
          summary = `Flawless sweep! Cleared all ${TOTAL_SAFE_CELLS} safe sectors first!`;
        }
      }
    }

    return {
      ...state,
      mineLocations,
      playerStates: {
        ...state.playerStates,
        [playerId]: {
          board: newBoard,
          flagCount,
          revealedCount,
          isDead,
          hasWon,
          isCompleted,
        },
      },
      status,
      winnerPlayerId,
      loserPlayerId,
      summary,
    };
  }

  public isFinished(state: MinesweeperState): boolean {
    return state.status === 'FINISHED';
  }

  public getResult(state: MinesweeperState): GameResult {
    if (state.winnerPlayerId) {
      return {
        winnerPlayerId: state.winnerPlayerId,
        loserPlayerId: state.loserPlayerId,
        result: 'WIN',
        reason: 'COMPLETED',
        summary: state.summary,
      };
    }

    return {
      winnerPlayerId: null,
      loserPlayerId: null,
      result: 'DRAW',
      reason: 'COMPLETED',
      summary: state.summary || 'Draw! Minefield duel concluded.',
    };
  }

  public sanitizeStateForPlayer(
    state: MinesweeperState,
    viewingPlayerId: string
  ): MinesweeperState {
    const mineSet = new Set(state.mineLocations.map(([r, c]) => `${r},${c}`));

    // If game finished: reveal all mines on both boards
    if (state.status === 'FINISHED') {
      const revealedPlayerStates: Record<string, MinesweeperPlayerState> = {};

      for (const pid of state.playerIds) {
        const pState = state.playerStates[pid];
        const unmaskedBoard = pState.board.map((row, r) =>
          row.map((cell, c) => ({
            ...cell,
            hasMine: mineSet.has(`${r},${c}`),
          }))
        );

        revealedPlayerStates[pid] = {
          ...pState,
          board: unmaskedBoard,
        };
      }

      return {
        ...state,
        playerStates: revealedPlayerStates,
      };
    }

    // While in progress:
    // 1. Mask mineLocations array to prevent network inspection cheat
    // 2. Viewing player sees their own board exactly
    // 3. Opponent board masks numbers (-1) but shows revealed/flagged status for live radar
    const sanitizedPlayerStates: Record<string, MinesweeperPlayerState> = {};

    for (const pid of state.playerIds) {
      const pState = state.playerStates[pid];
      if (pid === viewingPlayerId) {
        sanitizedPlayerStates[pid] = pState;
      } else {
        const maskedOpponentBoard = pState.board.map((row) =>
          row.map((cell) => ({
            status: cell.status,
            adjacentMines: cell.status === 'REVEALED' ? -1 : 0,
          }))
        );

        sanitizedPlayerStates[pid] = {
          ...pState,
          board: maskedOpponentBoard,
        };
      }
    }

    return {
      ...state,
      mineLocations: [], // Concealed
      playerStates: sanitizedPlayerStates,
    };
  }
}

export const minesweeperEngine = new MinesweeperEngine();
