import { describe, it } from 'node:test';
import assert from 'node:assert';
import { reactionTestEngine } from '../games/reaction-test.js';

describe('Reaction Test Engine', () => {
  const p1 = 'player-1';
  const p2 = 'player-2';

  it('initializes in WAITING status with a future triggerAt timestamp', () => {
    const state = reactionTestEngine.createInitialState([p1, p2]);
    assert.strictEqual(state.status, 'WAITING');
    assert.strictEqual(state.triggerAt > Date.now(), true);
    assert.strictEqual(state.winnerPlayerId, null);
  });

  it('penalizes early click as false start (instant defeat)', () => {
    const state = reactionTestEngine.createInitialState([p1, p2]);
    // p1 clicks before triggerAt
    const earlyTimestamp = state.triggerAt - 500;
    const nextState = reactionTestEngine.applyMove(
      state,
      { action: 'CLICK' },
      { playerId: p1, timestamp: earlyTimestamp }
    );

    assert.strictEqual(nextState.status, 'FINISHED');
    assert.strictEqual(nextState.winnerPlayerId, p2);
    assert.strictEqual(nextState.loserPlayerId, p1);
    assert.strictEqual(nextState.playerResults[p1].earlyClick, true);
  });

  it('awards victory to the first valid click after trigger time', () => {
    const state = reactionTestEngine.createInitialState([p1, p2]);
    const trigger = state.triggerAt;

    // p1 clicks at trigger + 250ms (first valid quickdraw click!)
    const finishedState = reactionTestEngine.applyMove(
      state,
      { action: 'CLICK' },
      { playerId: p1, timestamp: trigger + 250 }
    );

    assert.strictEqual(finishedState.status, 'FINISHED');
    assert.strictEqual(finishedState.winnerPlayerId, p1);
    assert.strictEqual(finishedState.loserPlayerId, p2);
    assert.strictEqual(finishedState.playerResults[p1].reactionMs, 250);
    assert.strictEqual(reactionTestEngine.isFinished(finishedState), true);
  });
});
