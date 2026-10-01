import { describe, it } from 'node:test';
import assert from 'node:assert';
import { connectFourEngine } from '../games/connect-four.js';

describe('Connect Four Engine', () => {
  const p1 = 'player-red';
  const p2 = 'player-yellow';

  it('initializes 6x7 empty grid with player-red going first', () => {
    const state = connectFourEngine.createInitialState([p1, p2]);
    assert.strictEqual(state.status, 'IN_PROGRESS');
    assert.strictEqual(state.board.length, 6);
    assert.strictEqual(state.board[0].length, 7);
    assert.strictEqual(state.currentTurnPlayerId, p1);
  });

  it('drops tokens to bottom with gravity', () => {
    let state = connectFourEngine.createInitialState([p1, p2]);
    // p1 drops in column 3 -> should land on row 5
    state = connectFourEngine.applyMove(state, { column: 3 }, { playerId: p1, timestamp: 100 });
    assert.strictEqual(state.board[5][3], 'RED');

    // p2 drops in column 3 -> should land on row 4
    state = connectFourEngine.applyMove(state, { column: 3 }, { playerId: p2, timestamp: 101 });
    assert.strictEqual(state.board[4][3], 'YELLOW');
  });

  it('rejects dropping into a completely full column', () => {
    let state = connectFourEngine.createInitialState([p1, p2]);
    // Fill column 0 with 6 tokens
    for (let i = 0; i < 6; i++) {
      const activePlayer = i % 2 === 0 ? p1 : p2;
      state = connectFourEngine.applyMove(state, { column: 0 }, { playerId: activePlayer, timestamp: 100 + i });
    }

    // 7th token in col 0 must be invalid
    const nextPlayer = state.currentTurnPlayerId;
    assert.strictEqual(
      connectFourEngine.validateMove(state, { column: 0 }, { playerId: nextPlayer, timestamp: 200 }),
      false
    );
  });

  it('detects horizontal 4-in-a-row victory', () => {
    let state = connectFourEngine.createInitialState([p1, p2]);
    // Red: 0, 1, 2, 3 (bottom row 5)
    // Yellow: 0, 1, 2 (row 4)
    state = connectFourEngine.applyMove(state, { column: 0 }, { playerId: p1, timestamp: 100 }); // R (5,0)
    state = connectFourEngine.applyMove(state, { column: 0 }, { playerId: p2, timestamp: 101 }); // Y (4,0)
    state = connectFourEngine.applyMove(state, { column: 1 }, { playerId: p1, timestamp: 102 }); // R (5,1)
    state = connectFourEngine.applyMove(state, { column: 1 }, { playerId: p2, timestamp: 103 }); // Y (4,1)
    state = connectFourEngine.applyMove(state, { column: 2 }, { playerId: p1, timestamp: 104 }); // R (5,2)
    state = connectFourEngine.applyMove(state, { column: 2 }, { playerId: p2, timestamp: 105 }); // Y (4,2)
    state = connectFourEngine.applyMove(state, { column: 3 }, { playerId: p1, timestamp: 106 }); // R (5,3) -> 4 in a row!

    assert.strictEqual(state.status, 'WIN');
    assert.strictEqual(state.winnerPlayerId, p1);
    assert.strictEqual(connectFourEngine.isFinished(state), true);
  });
});
