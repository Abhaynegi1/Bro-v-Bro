import { ticTacToeEngine } from './tic-tac-toe.js';
import { reactionTestEngine } from './reaction-test.js';
import { connectFourEngine } from './connect-four.js';
import { wordleEngine } from './wordle.js';
import { minesweeperEngine } from './minesweeper.js';
import { chessEngine } from './chess.js';
import type { GameDefinition } from '@bvb/shared';

export const gameRegistry: Record<string, GameDefinition<any, any>> = {
  [ticTacToeEngine.id]: ticTacToeEngine,
  [reactionTestEngine.id]: reactionTestEngine,
  [connectFourEngine.id]: connectFourEngine,
  [wordleEngine.id]: wordleEngine,
  [minesweeperEngine.id]: minesweeperEngine,
  [chessEngine.id]: chessEngine,
};

export function getGameEngine(gameId: string): GameDefinition<any, any> | null {
  return gameRegistry[gameId] || null;
}

export * from './tic-tac-toe.js';
export * from './reaction-test.js';
export * from './connect-four.js';
export * from './wordle.js';
export * from './minesweeper.js';
export * from './chess.js';

