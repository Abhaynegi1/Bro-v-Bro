import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ticTacToeEngine } from '../games/tic-tac-toe.js';

describe('Tic Tac Toe Engine', () => {
  const p1 = 'player-1';
  const p2 = 'player-2';

  it('initializes a fresh 3x3 board with player-1 turn', () => {
    const state = ticTacToeEngine.createInitialState([p1, p2]);
    assert.strictEqual(state.status, 'IN_PROGRESS');
    assert.strictEqual(state.board.length, 9);
    assert.strictEqual(state.board.every((c) => c === null), true);
    assert.strictEqual(state.currentTurnPlayerId, p1);
  });

  it('rejects moves from out-of-turn players or occupied cells', () => {
    let state = ticTacToeEngine.createInitialState([p1, p2]);

    // p2 attempts move when it is p1 turn
    assert.strictEqual(
      ticTacToeEngine.validateMove(state, { cellIndex: 0 }, { playerId: p2, timestamp: 100 }),
      false
    );

    // p1 makes move
    state = ticTacToeEngine.applyMove(state, { cellIndex: 0 }, { playerId: p1, timestamp: 100 });

    // p2 tries to play on same cell
    assert.strictEqual(
      ticTacToeEngine.validateMove(state, { cellIndex: 0 }, { playerId: p2, timestamp: 101 }),
      false
    );
  });

  it('detects horizontal win for player 1', () => {
    let state = ticTacToeEngine.createInitialState([p1, p2]);
    // p1: 0, p2: 3, p1: 1, p2: 4, p1: 2 (Row 0 win)
    state = ticTacToeEngine.applyMove(state, { cellIndex: 0 }, { playerId: p1, timestamp: 100 });
    state = ticTacToeEngine.applyMove(state, { cellIndex: 3 }, { playerId: p2, timestamp: 101 });
    state = ticTacToeEngine.applyMove(state, { cellIndex: 1 }, { playerId: p1, timestamp: 102 });
    state = ticTacToeEngine.applyMove(state, { cellIndex: 4 }, { playerId: p2, timestamp: 103 });
    state = ticTacToeEngine.applyMove(state, { cellIndex: 2 }, { playerId: p1, timestamp: 104 });

    assert.strictEqual(state.status, 'WIN');
    assert.strictEqual(state.winnerPlayerId, p1);
    assert.strictEqual(ticTacToeEngine.isFinished(state), true);
    const result = ticTacToeEngine.getResult(state);
    assert.strictEqual(result.result, 'WIN');
    assert.strictEqual(result.winnerPlayerId, p1);
  });

  it('detects a draw (cat\'s game)', () => {
    let state = ticTacToeEngine.createInitialState([p1, p2]);
    // Fill board without 3-in-a-row:
    // X O X
    // X O O
    // O X X
    const moves = [
      { p: p1, c: 0 }, // X
      { p: p2, c: 1 }, // O
      { p: p1, c: 2 }, // X
      { p: p2, c: 4 }, // O
      { p: p1, c: 3 }, // X
      { p: p2, c: 5 }, // O
      { p: p1, c: 7 }, // X
      { p: p2, c: 6 }, // O
      { p: p1, c: 8 }, // X
    ];

    for (let i = 0; i < moves.length; i++) {
      state = ticTacToeEngine.applyMove(state, { cellIndex: moves[i].c }, { playerId: moves[i].p, timestamp: 100 + i });
    }

    assert.strictEqual(state.status, 'DRAW');
    assert.strictEqual(state.winnerPlayerId, null);
    assert.strictEqual(ticTacToeEngine.isFinished(state), true);
    const result = ticTacToeEngine.getResult(state);
    assert.strictEqual(result.result, 'DRAW');
  });
});
