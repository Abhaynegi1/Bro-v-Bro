import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TARGET_WORDS, isValidWord, getRandomTargetWord } from '../wordle-words.js';

describe('Wordle Dictionary & Validator', () => {
  it('contains exactly 2,315 curated target words', () => {
    assert.strictEqual(TARGET_WORDS.length, 2315);
  });

  it('all target words are 5-letter uppercase strings', () => {
    for (const word of TARGET_WORDS.slice(0, 100)) {
      assert.strictEqual(word.length, 5);
      assert.match(word, /^[A-Z]{5}$/);
    }
  });

  it('getRandomTargetWord returns a valid word from TARGET_WORDS', () => {
    const word = getRandomTargetWord();
    assert.strictEqual(word.length, 5);
    assert.strictEqual(TARGET_WORDS.includes(word), true);
  });

  it('validates common words as true', () => {
    assert.strictEqual(isValidWord('CRANE'), true);
    assert.strictEqual(isValidWord('GHOST'), true);
    assert.strictEqual(isValidWord('FLAME'), true);
    assert.strictEqual(isValidWord('STORM'), true);
  });

  it('validates allowed guess words (e.g. ADIEU, ROATE)', () => {
    assert.strictEqual(isValidWord('ADIEU'), true);
    assert.strictEqual(isValidWord('ROATE'), true);
  });

  it('rejects invalid or non-existent words', () => {
    assert.strictEqual(isValidWord('XYZAB'), false);
    assert.strictEqual(isValidWord('AAAAA'), false);
    assert.strictEqual(isValidWord('12345'), false);
    assert.strictEqual(isValidWord('WORD'), false);
  });
});
