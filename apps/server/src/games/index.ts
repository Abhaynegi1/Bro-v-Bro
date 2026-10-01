import { ticTacToeEngine } from './tic-tac-toe.js';
import type { GameDefinition } from '@bvb/shared';

export const gameRegistry: Record<string, GameDefinition<any, any>> = {
  [ticTacToeEngine.id]: ticTacToeEngine,
};

export function getGameEngine(gameId: string): GameDefinition<any, any> | null {
  return gameRegistry[gameId] || null;
}

export * from './tic-tac-toe.js';
