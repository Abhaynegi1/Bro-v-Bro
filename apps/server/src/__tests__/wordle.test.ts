import { describe, it } from 'node:test';
import assert from 'node:assert';
import { wordleEngine, evaluateGuess } from '../games/wordle.js';

describe('Wordle Race Engine', () => {
  const p1 = 'player-1';
  const p2 = 'player-2';

  it('evaluates duplicate letters correctly', () => {
    // Target: SPEED, Guess: ERASE
    const eval1 = evaluateGuess('ERASE', 'SPEED');
    assert.deepStrictEqual(eval1, ['PRESENT', 'ABSENT', 'ABSENT', 'PRESENT', 'PRESENT']);

    // Target: APPLE, Guess: PUPPY
    const eval2 = evaluateGuess('PUPPY', 'APPLE');
    assert.deepStrictEqual(eval2, ['PRESENT', 'ABSENT', 'CORRECT', 'ABSENT', 'ABSENT']);

    // Exact match
    const evalExact = evaluateGuess('GHOST', 'GHOST');
    assert.deepStrictEqual(evalExact, ['CORRECT', 'CORRECT', 'CORRECT', 'CORRECT', 'CORRECT']);
  });

  it('validates 5-letter dictionary words and rejects non-words', () => {
    const state = wordleEngine.createInitialState([p1, p2]);
    assert.strictEqual(
      wordleEngine.validateMove(state, { action: 'GUESS', guess: 'CRANE' }, { playerId: p1, timestamp: 100 }),
      true
    );
    assert.strictEqual(
      wordleEngine.validateMove(state, { action: 'GUESS', guess: 'XYZAB' }, { playerId: p1, timestamp: 100 }),
      false
    );
  });

  it('awards victory to the first player to guess the secret word', () => {
    let state = wordleEngine.createInitialState([p1, p2]);
    state.targetWord = 'FLAME';

    // p1 makes partial guess
    state = wordleEngine.applyMove(state, { action: 'GUESS', guess: 'CRANE' }, { playerId: p1, timestamp: 100 });
    assert.strictEqual(state.status, 'IN_PROGRESS');

    // p2 guesses target word correctly
    state = wordleEngine.applyMove(state, { action: 'GUESS', guess: 'FLAME' }, { playerId: p2, timestamp: 101 });
    assert.strictEqual(state.status, 'FINISHED');
    assert.strictEqual(state.winnerPlayerId, p2);
    assert.strictEqual(state.loserPlayerId, p1);
    assert.strictEqual(wordleEngine.isFinished(state), true);
  });

  it('sanitizes state to prevent network payload cheating', () => {
    let state = wordleEngine.createInitialState([p1, p2]);
    state.targetWord = 'FLAME';
    state = wordleEngine.applyMove(state, { action: 'GUESS', guess: 'CRANE' }, { playerId: p1, timestamp: 100 });

    // Sanitized for opponent (p2)
    const sanitizedForP2 = wordleEngine.sanitizeStateForPlayer(state, p2);
    assert.strictEqual(sanitizedForP2.targetWord, '', 'Target word must be concealed');
    assert.strictEqual(sanitizedForP2.playerStates[p1].guesses[0].word, '?????', 'Opponent letters masked');
    assert.strictEqual(sanitizedForP2.playerStates[p1].guesses[0].evaluation.length, 5, 'Tile colors visible');

    // Finished unmasks everything
    state.status = 'FINISHED';
    const finishedState = wordleEngine.sanitizeStateForPlayer(state, p2);
    assert.strictEqual(finishedState.targetWord, 'FLAME');
    assert.strictEqual(finishedState.playerStates[p1].guesses[0].word, 'CRANE');
  });
});
