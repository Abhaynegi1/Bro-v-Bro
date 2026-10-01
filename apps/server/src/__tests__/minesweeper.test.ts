import { describe, it } from 'node:test';
import assert from 'node:assert';
import { minesweeperEngine } from '../games/minesweeper.js';

describe('Minesweeper Battle Engine', () => {
  const p1 = 'player-1';
  const p2 = 'player-2';

  it('initializes 9x9 board with 10 mines and 71 safe cells', () => {
    const state = minesweeperEngine.createInitialState([p1, p2]);
    assert.strictEqual(state.status, 'IN_PROGRESS');
    assert.strictEqual(state.rows, 9);
    assert.strictEqual(state.cols, 9);
    assert.strictEqual(state.totalMines, 10);
    assert.strictEqual(state.totalSafeCells, 71);
    assert.strictEqual(state.playerStates[p1].board.length, 9);
    assert.strictEqual(state.playerStates[p1].revealedCount, 0);
  });

  it('guarantees safety on the opening move (relocates mine if hit)', () => {
    let state = minesweeperEngine.createInitialState([p1, p2]);
    // Force a mine at (0, 0)
    state.mineLocations = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [8, 1]];

    state = minesweeperEngine.applyMove(state, { action: 'REVEAL', row: 0, col: 0 }, { playerId: p1, timestamp: 100 });
    assert.strictEqual(state.playerStates[p1].isDead, false, 'First click must not kill player');
    assert.strictEqual(state.playerStates[p1].board[0][0].status, 'REVEALED');
  });

  it('triggers detonation knockout when player clicks an active mine', () => {
    let state = minesweeperEngine.createInitialState([p1, p2]);
    // First move (safe)
    state = minesweeperEngine.applyMove(state, { action: 'REVEAL', row: 4, col: 4 }, { playerId: p1, timestamp: 100 });

    // Find a known mine location and click it
    const mine = state.mineLocations[0];
    state = minesweeperEngine.applyMove(state, { action: 'REVEAL', row: mine[0], col: mine[1] }, { playerId: p1, timestamp: 101 });

    assert.strictEqual(state.playerStates[p1].isDead, true);
    assert.strictEqual(state.playerStates[p1].board[mine[0]][mine[1]].status, 'EXPLODED');
    assert.strictEqual(state.status, 'FINISHED');
    assert.strictEqual(state.winnerPlayerId, p2, 'Opponent wins when a player detonates');
  });

  it('masks mine locations from state payloads while in progress', () => {
    const state = minesweeperEngine.createInitialState([p1, p2]);
    const sanitized = minesweeperEngine.sanitizeStateForPlayer(state, p1);
    assert.deepStrictEqual(sanitized.mineLocations, []);
  });
});
