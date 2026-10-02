import { describe, it } from 'node:test';
import assert from 'node:assert';
import { chessEngine } from '../games/chess.js';

describe('Speed Chess Engine', () => {
  const p1 = 'player-white-uuid';
  const p2 = 'player-black-uuid';

  it('initializes standard board with 120s clocks and White going first', () => {
    const state = chessEngine.createInitialState([p1, p2]);

    assert.strictEqual(state.playerWhiteId, p1);
    assert.strictEqual(state.playerBlackId, p2);
    assert.strictEqual(state.currentTurnPlayerId, p1);
    assert.strictEqual(
      state.fen,
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
    assert.strictEqual(state.clocks[p1], 120000);
    assert.strictEqual(state.clocks[p2], 120000);
    assert.strictEqual(state.status, 'IN_PROGRESS');
    assert.strictEqual(state.moveCount, 0);
    assert.strictEqual(state.isCheck, false);
    assert.strictEqual(state.isCheckmate, false);
  });

  it('validates legal moves and rejects illegal moves / wrong turn', () => {
    const state = chessEngine.createInitialState([p1, p2]);

    // White can move e2 to e4
    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'MOVE', from: 'e2', to: 'e4' },
        { playerId: p1, timestamp: state.lastMoveTimestamp + 100 }
      ),
      true
    );

    // Black cannot move on White's turn
    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'MOVE', from: 'e7', to: 'e5' },
        { playerId: p2, timestamp: state.lastMoveTimestamp + 100 }
      ),
      false
    );

    // White cannot make an illegal move (e2 to e5)
    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'MOVE', from: 'e2', to: 'e5' },
        { playerId: p1, timestamp: state.lastMoveTimestamp + 100 }
      ),
      false
    );

    // Non-player cannot make a move
    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'MOVE', from: 'e2', to: 'e4' },
        { playerId: 'stranger', timestamp: state.lastMoveTimestamp + 100 }
      ),
      false
    );
  });

  it('deducts clock time and switches turns on legal moves', () => {
    let state = chessEngine.createInitialState([p1, p2]);
    const startT = state.lastMoveTimestamp;

    // White plays e4 after 2.5 seconds (2500ms)
    state = chessEngine.applyMove(
      state,
      { action: 'MOVE', from: 'e2', to: 'e4' },
      { playerId: p1, timestamp: startT + 2500 }
    );

    assert.strictEqual(state.currentTurnPlayerId, p2);
    assert.strictEqual(state.clocks[p1], 120000 - 2500);
    assert.strictEqual(state.clocks[p2], 120000);
    assert.strictEqual(state.moveCount, 1);
    assert.strictEqual(state.history.length, 1);
    assert.strictEqual(state.history[0].san, 'e4');
    assert.strictEqual(state.lastMove?.san, 'e4');

    // Black plays e5 after 1.8 seconds (1800ms)
    state = chessEngine.applyMove(
      state,
      { action: 'MOVE', from: 'e7', to: 'e5' },
      { playerId: p2, timestamp: startT + 2500 + 1800 }
    );

    assert.strictEqual(state.currentTurnPlayerId, p1);
    assert.strictEqual(state.clocks[p2], 120000 - 1800);
    assert.strictEqual(state.moveCount, 2);
    assert.strictEqual(state.history.length, 2);
    assert.strictEqual(state.history[1].san, 'e5');
  });

  it('detects checkmate victory (Scholar\'s Mate)', () => {
    let state = chessEngine.createInitialState([p1, p2]);
    let t = state.lastMoveTimestamp;

    const moves = [
      { p: p1, from: 'e2', to: 'e4' }, // 1. e4
      { p: p2, from: 'e7', to: 'e5' }, // 1... e5
      { p: p1, from: 'f1', to: 'c4' }, // 2. Bc4
      { p: p2, from: 'b8', to: 'c6' }, // 2... Nc6
      { p: p1, from: 'd1', to: 'h5' }, // 3. Qh5
      { p: p2, from: 'g8', to: 'f6' }, // 3... Nf6??
      { p: p1, from: 'h5', to: 'f7' }, // 4. Qxf7#
    ];

    for (const m of moves) {
      t += 500;
      state = chessEngine.applyMove(
        state,
        { action: 'MOVE', from: m.from, to: m.to },
        { playerId: m.p, timestamp: t }
      );
    }

    assert.strictEqual(state.status, 'WIN');
    assert.strictEqual(state.reason, 'CHECKMATE');
    assert.strictEqual(state.isCheckmate, true);
    assert.strictEqual(state.winnerPlayerId, p1);
    assert.strictEqual(state.loserPlayerId, p2);
    assert.strictEqual(chessEngine.isFinished(state), true);

    const result = chessEngine.getResult(state);
    assert.strictEqual(result.result, 'WIN');
    assert.strictEqual(result.winnerPlayerId, p1);
  });

  it('allows a player to resign and awards victory to opponent', () => {
    const state = chessEngine.createInitialState([p1, p2]);

    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'RESIGN' },
        { playerId: p2, timestamp: state.lastMoveTimestamp + 100 }
      ),
      true
    );

    const nextState = chessEngine.applyMove(
      state,
      { action: 'RESIGN' },
      { playerId: p2, timestamp: state.lastMoveTimestamp + 100 }
    );

    assert.strictEqual(nextState.status, 'WIN');
    assert.strictEqual(nextState.reason, 'RESIGNED');
    assert.strictEqual(nextState.winnerPlayerId, p1);
    assert.strictEqual(nextState.loserPlayerId, p2);
    assert.strictEqual(chessEngine.isFinished(nextState), true);
  });

  it('handles timeout claim when player clock runs out', () => {
    const state = chessEngine.createInitialState([p1, p2]);
    const startT = state.lastMoveTimestamp;

    // White's turn, but 125 seconds have elapsed (> 120s clock)
    const timeoutT = startT + 125000;

    // White cannot claim timeout on themselves
    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'CLAIM_TIMEOUT' },
        { playerId: p1, timestamp: timeoutT }
      ),
      false
    );

    // Black CAN claim timeout because White ran out of time
    assert.strictEqual(
      chessEngine.validateMove(
        state,
        { action: 'CLAIM_TIMEOUT' },
        { playerId: p2, timestamp: timeoutT }
      ),
      true
    );

    const nextState = chessEngine.applyMove(
      state,
      { action: 'CLAIM_TIMEOUT' },
      { playerId: p2, timestamp: timeoutT }
    );

    assert.strictEqual(nextState.status, 'WIN');
    assert.strictEqual(nextState.reason, 'TIMEOUT');
    assert.strictEqual(nextState.winnerPlayerId, p2);
    assert.strictEqual(nextState.loserPlayerId, p1);
    assert.strictEqual(nextState.clocks[p1], 0);
  });
});
