export type RoomStatus =
  | 'WAITING'         // Host created room, waiting for Guest
  | 'READY'           // Both players present and ready
  | 'SELECTING_GAME'  // In game selection screen, authorized player is picking
  | 'IN_GAME'         // A round is actively being played
  | 'ROUND_COMPLETE'  // Round finished, displaying round results / picking next
  | 'MATCH_COMPLETE'  // Series target reached, displaying final champion
  | 'CLOSED';         // Room terminated / expired

export interface PlayerSlot {
  id: string;              // Ephemeral player UUID
  name: string;            // Display name (e.g. "Abhay")
  isHost: boolean;         // True for slot A, false for slot B
  isReady: boolean;        // Ready toggle
  isConnected: boolean;    // Current realtime connection flag
  lastSeenAt: number;      // Epoch timestamp for heartbeat
}

export type SeriesCondition =
  | { type: 'FIRST_TO_N'; targetPoints: number }
  | { type: 'BEST_OF_N'; totalRounds: number };

export interface RoundRecord {
  roundNumber: number;
  gameId: string;
  winnerPlayerId: string | null; // null for draw
  loserPlayerId: string | null;
  result: 'WIN' | 'DRAW';
  reason: 'COMPLETED' | 'FORFEIT' | 'TIMEOUT';
  durationMs: number;
  summary?: string;
}

export interface MatchState {
  id: string;
  seriesCondition: SeriesCondition;
  scores: {
    playerA: number;
    playerB: number;
  };
  rounds: RoundRecord[];
  currentRoundNumber: number;
  activeGameId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  seriesWinnerId: string | null;
  nextPickerPlayerId?: string | null;
}

export interface MoveContext {
  playerId: string;
  timestamp: number;
}

export interface GameDefinition<TState, TMove> {
  id: string;
  name: string;
  description: string;
  minPlayers: 2;
  maxPlayers: 2;
  createInitialState(playerIds: [string, string]): TState;
  validateMove(state: TState, move: TMove, context: MoveContext): boolean;
  applyMove(state: TState, move: TMove, context: MoveContext): TState;
  isFinished(state: TState): boolean;
  getResult(state: TState): GameResult;
  sanitizeStateForPlayer?(state: TState, viewingPlayerId: string): unknown;
}

export type TicTacToeCell = 'X' | 'O' | null;

export interface TicTacToeState {
  board: TicTacToeCell[];
  currentTurnPlayerId: string;
  playerXId: string;
  playerOId: string;
  winningLine: [number, number, number] | null;
  status: 'IN_PROGRESS' | 'WIN' | 'DRAW';
  winnerPlayerId: string | null;
  moveCount: number;
}

export interface TicTacToeMove {
  cellIndex: number;
}

export interface ReactionTestPlayerResult {
  reactionMs: number | null;
  earlyClick: boolean;
  clickedAt?: number;
}

export interface ReactionTestState {
  playerIds: [string, string];
  triggerAt: number;
  status: 'WAITING' | 'READY' | 'FINISHED';
  playerResults: {
    [playerId: string]: ReactionTestPlayerResult;
  };
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  summary?: string;
}

export interface ReactionTestMove {
  action: 'CLICK';
}

export type ConnectFourCell = 'RED' | 'YELLOW' | null;

export interface ConnectFourState {
  board: ConnectFourCell[][]; // 6 rows (0=top, 5=bottom) x 7 cols (0..6)
  currentTurnPlayerId: string;
  playerRedId: string;
  playerYellowId: string;
  winningLine: [number, number][] | null; // list of [row, col] winning cells
  status: 'IN_PROGRESS' | 'WIN' | 'DRAW';
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  moveCount: number;
  lastMove?: { row: number; col: number; player: 'RED' | 'YELLOW' } | null;
}

export interface ConnectFourMove {
  column: number; // 0..6
}

export type WordleLetterState = 'CORRECT' | 'PRESENT' | 'ABSENT';

export interface WordleGuess {
  word: string; // Sanitized: empty string for opponent while in progress
  evaluation: WordleLetterState[];
}

export interface WordlePlayerState {
  guesses: WordleGuess[];
  isCompleted: boolean;
  hasWon: boolean;
  finishedAt?: number;
}

export interface WordleState {
  playerIds: [string, string];
  targetWord: string; // Masked when sanitized
  maxAttempts: number; // 6
  playerStates: {
    [playerId: string]: WordlePlayerState;
  };
  status: 'IN_PROGRESS' | 'FINISHED';
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  summary?: string;
}

export interface WordleMove {
  action: 'GUESS';
  guess: string; // 5-letter uppercase string
}

export type MinesweeperCellStatus = 'HIDDEN' | 'FLAGGED' | 'REVEALED' | 'EXPLODED';

export interface MinesweeperCell {
  status: MinesweeperCellStatus;
  adjacentMines: number; // 0..8
  hasMine?: boolean; // Revealed on FINISHED
}

export interface MinesweeperPlayerState {
  board: MinesweeperCell[][];
  flagCount: number;
  revealedCount: number;
  isDead: boolean;
  hasWon: boolean;
  isCompleted: boolean;
}

export interface MinesweeperState {
  playerIds: [string, string];
  rows: number; // 9
  cols: number; // 9
  totalMines: number; // 10
  totalSafeCells: number; // 71
  mineLocations: [number, number][]; // Masked when sanitized
  playerStates: {
    [playerId: string]: MinesweeperPlayerState;
  };
  status: 'IN_PROGRESS' | 'FINISHED';
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  summary?: string;
}

export interface MinesweeperMove {
  action: 'REVEAL' | 'FLAG';
  row: number;
  col: number;
}

export type ChessPieceColor = 'w' | 'b';
export type ChessPieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessMoveRecord {
  san: string;
  from: string;
  to: string;
  piece: string;
  color: ChessPieceColor;
  captured?: string;
  promotion?: string;
}

export interface ChessState {
  playerWhiteId: string;
  playerBlackId: string;
  currentTurnPlayerId: string;
  fen: string;
  history: ChessMoveRecord[];
  clocks: {
    [playerId: string]: number; // remaining ms
  };
  lastMoveTimestamp: number;
  initialTimeMs: number;
  status: 'IN_PROGRESS' | 'WIN' | 'DRAW';
  reason?: 'CHECKMATE' | 'TIMEOUT' | 'RESIGNED' | 'STALEMATE' | 'INSUFFICIENT_MATERIAL' | 'THREEFOLD_REPETITION' | '50_MOVE_RULE';
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  moveCount: number;
  lastMove?: { from: string; to: string; san: string } | null;
  summary?: string;
}

export type ChessMove =
  | {
      action: 'MOVE';
      from: string;
      to: string;
      promotion?: 'q' | 'r' | 'b' | 'n';
    }
  | {
      action: 'RESIGN';
    }
  | {
      action: 'CLAIM_TIMEOUT';
    };

export interface ActiveGameData {
  gameId: string;
  state: any;
}

export interface RoomState {
  id: string;
  code: string;
  status: RoomStatus;
  players: {
    playerA: PlayerSlot | null;
    playerB: PlayerSlot | null;
  };
  currentMatch: MatchState | null;
  activeGame: ActiveGameData | null;
  selectingPlayerId?: string | null;
  createdAt: number;
}

export interface GameResult {
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  result: 'WIN' | 'DRAW';
  reason: 'COMPLETED' | 'FORFEIT' | 'TIMEOUT';
  summary?: string;
}
