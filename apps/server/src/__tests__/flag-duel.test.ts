import { describe, it } from 'node:test';
import assert from 'node:assert';
import { flagDuelEngine } from '../games/flag-duel.js';

describe('Flag Duel Engine', () => {
  const p1 = 'player-1';
  const p2 = 'player-2';

  it('creates initial state with 3 lives and 0 score', () => {
    const state = flagDuelEngine.createInitialState([p1, p2]);
    assert.strictEqual(state.status, 'IN_PROGRESS');
    assert.strictEqual(state.playerStates[p1].lives, 3);
    assert.strictEqual(state.playerStates[p1].score, 0);
    assert.strictEqual(state.playerStates[p2].lives, 3);
    assert.strictEqual(state.playerStates[p2].score, 0);
    assert.strictEqual(state.currentFlag.options.length, 4);
    assert.ok(state.currentFlag.options.includes(state.targetCountryName!));
  });

  it('validates moves only for valid options and un-answered questions', () => {
    const state = flagDuelEngine.createInitialState([p1, p2]);
    const validOption = state.currentFlag.options[0];

    assert.strictEqual(
      flagDuelEngine.validateMove(state, { action: 'GUESS', country: validOption }, { playerId: p1, timestamp: 100 }),
      true
    );

    // Invalid country not in options
    assert.strictEqual(
      flagDuelEngine.validateMove(state, { action: 'GUESS', country: 'Atlantis' }, { playerId: p1, timestamp: 100 }),
      false
    );

    // After guessing, cannot guess again on same question
    const nextState = flagDuelEngine.applyMove(
      state,
      { action: 'GUESS', country: validOption },
      { playerId: p1, timestamp: 100 }
    );
    // If not finished, p1 already guessed
    if (nextState.status === 'IN_PROGRESS' && nextState.playerStates[p1].lastSelected !== null) {
      assert.strictEqual(
        flagDuelEngine.validateMove(nextState, { action: 'GUESS', country: nextState.currentFlag.options[0] }, { playerId: p1, timestamp: 101 }),
        false
      );
    }
  });

  it('deducts a life on wrong guess and eliminates player after 3 wrong guesses', () => {
    let state = flagDuelEngine.createInitialState([p1, p2]);
    const target = state.targetCountryName!;
    const wrongOption = state.currentFlag.options.find((o) => o !== target)!;

    // Guess 1 wrong
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: wrongOption }, { playerId: p1, timestamp: 100 });
    assert.strictEqual(state.playerStates[p1].lives, 2);
    assert.strictEqual(state.status, 'IN_PROGRESS');

    // Simulate p2 also guessing wrong so question advances
    const wrongOption2 = state.currentFlag.options.find((o) => o !== target)!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: wrongOption2 }, { playerId: p2, timestamp: 101 });
    assert.strictEqual(state.playerStates[p2].lives, 2);

    // Question advanced! Now p1 guesses wrong again (life 2 -> 1)
    const target2 = state.targetCountryName!;
    const wrongOptionQ2 = state.currentFlag.options.find((o) => o !== target2)!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: wrongOptionQ2 }, { playerId: p1, timestamp: 102 });
    assert.strictEqual(state.playerStates[p1].lives, 1);

    // p2 wrong to advance
    const wrong2 = state.currentFlag.options.find((o) => o !== target2)!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: wrong2 }, { playerId: p2, timestamp: 103 });

    // p1 guesses wrong 3rd time (life 1 -> 0, ELIMINATION!)
    const target3 = state.targetCountryName!;
    const wrongOptionQ3 = state.currentFlag.options.find((o) => o !== target3)!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: wrongOptionQ3 }, { playerId: p1, timestamp: 104 });
    
    assert.strictEqual(state.playerStates[p1].lives, 0);
    assert.strictEqual(state.playerStates[p1].isEliminated, true);
    assert.strictEqual(state.status, 'FINISHED');
    assert.strictEqual(state.winnerPlayerId, p2);
    assert.strictEqual(state.loserPlayerId, p1);
  });

  it('awards victory to first player to score 3 points', () => {
    let state = flagDuelEngine.createInitialState([p1, p2]);

    // Point 1 for p1
    let correct = state.targetCountryName!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: correct }, { playerId: p1, timestamp: 100 });
    assert.strictEqual(state.playerStates[p1].score, 1);
    assert.strictEqual(state.status, 'IN_PROGRESS');

    // Point 2 for p1
    correct = state.targetCountryName!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: correct }, { playerId: p1, timestamp: 101 });
    assert.strictEqual(state.playerStates[p1].score, 2);
    assert.strictEqual(state.status, 'IN_PROGRESS');

    // Point 3 for p1 -> WIN!
    correct = state.targetCountryName!;
    state = flagDuelEngine.applyMove(state, { action: 'GUESS', country: correct }, { playerId: p1, timestamp: 102 });
    assert.strictEqual(state.playerStates[p1].score, 3);
    assert.strictEqual(state.status, 'FINISHED');
    assert.strictEqual(state.winnerPlayerId, p1);
    assert.strictEqual(state.loserPlayerId, p2);
  });

  it('masks target country name in sanitizeStateForPlayer while in progress', () => {
    const state = flagDuelEngine.createInitialState([p1, p2]);
    const sanitized = flagDuelEngine.sanitizeStateForPlayer(state, p1);
    assert.strictEqual(sanitized.targetCountryName, undefined);
  });
});
