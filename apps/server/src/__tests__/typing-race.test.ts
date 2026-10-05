import { describe, it } from 'node:test';
import assert from 'node:assert';
import { typingRaceEngine } from '../games/typing-race.js';

describe('Typing Race Engine', () => {
  const p1 = 'player-1';
  const p2 = 'player-2';

  it('initializes with passage text and countdown status', () => {
    const state = typingRaceEngine.createInitialState([p1, p2]);
    assert.strictEqual(state.status, 'COUNTDOWN');
    assert.ok(state.text.length > 20);
    assert.ok(state.startTime > Date.now());
    assert.strictEqual(state.playerStates[p1].progress, 0);
    assert.strictEqual(state.playerStates[p2].progress, 0);
    assert.strictEqual(state.playerStates[p1].completed, false);
    assert.strictEqual(state.playerStates[p2].completed, false);
    assert.strictEqual(state.winnerPlayerId, null);
  });

  it('validates progress moves correctly', () => {
    const state = typingRaceEngine.createInitialState([p1, p2]);

    // Valid progress move
    assert.strictEqual(
      typingRaceEngine.validateMove(
        state,
        { action: 'PROGRESS', charIndex: 10, mistakesCount: 0, accuracy: 100, wpm: 60 },
        { playerId: p1, timestamp: Date.now() }
      ),
      true
    );

    // Negative charIndex is invalid
    assert.strictEqual(
      typingRaceEngine.validateMove(
        state,
        { action: 'PROGRESS', charIndex: -5, mistakesCount: 0, accuracy: 100, wpm: 60 },
        { playerId: p1, timestamp: Date.now() }
      ),
      false
    );

    // charIndex exceeding text length is invalid
    assert.strictEqual(
      typingRaceEngine.validateMove(
        state,
        { action: 'PROGRESS', charIndex: state.text.length + 10, mistakesCount: 0, accuracy: 100, wpm: 60 },
        { playerId: p1, timestamp: Date.now() }
      ),
      false
    );

    // Move from non-player is invalid
    assert.strictEqual(
      typingRaceEngine.validateMove(
        state,
        { action: 'PROGRESS', charIndex: 10, mistakesCount: 0, accuracy: 100, wpm: 60 },
        { playerId: 'hacker-player', timestamp: Date.now() }
      ),
      false
    );
  });

  it('tracks progress, switches to RACING after countdown, and computes percentage', () => {
    let state = typingRaceEngine.createInitialState([p1, p2]);
    const afterCountdown = state.startTime + 100;

    const moveChar = Math.floor(state.text.length / 2);
    state = typingRaceEngine.applyMove(
      state,
      { action: 'PROGRESS', charIndex: moveChar, mistakesCount: 1, accuracy: 98, wpm: 75 },
      { playerId: p1, timestamp: afterCountdown }
    );

    assert.strictEqual(state.status, 'RACING');
    assert.strictEqual(state.playerStates[p1].charIndex, moveChar);
    assert.strictEqual(state.playerStates[p1].wpm, 75);
    assert.strictEqual(state.playerStates[p1].accuracy, 98);
    assert.strictEqual(state.playerStates[p1].mistakesCount, 1);
    assert.ok(state.playerStates[p1].progress >= 45 && state.playerStates[p1].progress <= 55);
    assert.strictEqual(state.playerStates[p1].completed, false);
    assert.strictEqual(state.winnerPlayerId, null);
  });

  it('awards victory to the first player to reach 100% characters', () => {
    let state = typingRaceEngine.createInitialState([p1, p2]);
    const afterCountdown = state.startTime + 1000;

    // Player 1 finishes the text
    state = typingRaceEngine.applyMove(
      state,
      { action: 'PROGRESS', charIndex: state.text.length, mistakesCount: 0, accuracy: 100, wpm: 92 },
      { playerId: p1, timestamp: afterCountdown }
    );

    assert.strictEqual(state.status, 'FINISHED');
    assert.strictEqual(state.winnerPlayerId, p1);
    assert.strictEqual(state.loserPlayerId, p2);
    assert.strictEqual(state.playerStates[p1].completed, true);
    assert.strictEqual(state.playerStates[p1].progress, 100);
    assert.ok(typingRaceEngine.isFinished(state));

    const result = typingRaceEngine.getResult(state);
    assert.strictEqual(result.result, 'WIN');
    assert.strictEqual(result.winnerPlayerId, p1);
    assert.strictEqual(result.loserPlayerId, p2);
    assert.ok(result.summary?.includes('92 WPM'));
  });
});
