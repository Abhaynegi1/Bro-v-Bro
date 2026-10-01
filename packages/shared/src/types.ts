export type RoomStatus =
  | 'WAITING'         // Host created room, waiting for Guest
  | 'READY'           // Both players present and ready
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
  createdAt: number;
}

export interface GameResult {
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  result: 'WIN' | 'DRAW';
  reason: 'COMPLETED' | 'FORFEIT' | 'TIMEOUT';
  summary?: string;
}
