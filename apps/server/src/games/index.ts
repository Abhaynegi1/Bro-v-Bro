import { ticTacToeEngine } from './tic-tac-toe.js';
import { reactionTestEngine } from './reaction-test.js';
import type { GameDefinition } from '@bvb/shared';

export const gameRegistry: Record<string, GameDefinition<any, any>> = {
  [ticTacToeEngine.id]: ticTacToeEngine,
  [reactionTestEngine.id]: reactionTestEngine,
};

export function getGameEngine(gameId: string): GameDefinition<any, any> | null {
  return gameRegistry[gameId] || null;
}

export * from './tic-tac-toe.js';
export * from './reaction-test.js';
