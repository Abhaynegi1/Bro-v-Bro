import { describe, it } from 'node:test';
import assert from 'node:assert';
import { saveMatchResult, getMatchById, getRecentMatches } from '../db/index.js';

describe('Neon DB Match Persistence', () => {
  const testMatchId = `test_match_${Date.now()}`;

  it('saves and retrieves a completed match series from Neon DB', async () => {
    const saved = await saveMatchResult({
      id: testMatchId,
      roomCode: 'TEST1',
      targetWins: 3,
      playerAId: 'player_a_test',
      playerAName: 'BroAlpha',
      playerBId: 'player_b_test',
      playerBName: 'BroBeta',
      winnerId: 'player_a_test',
      winnerName: 'BroAlpha',
      scoreA: 3,
      scoreB: 1,
      totalRounds: 4,
      rounds: [
        {
          roundNumber: 1,
          gameId: 'tic-tac-toe',
          winnerPlayerId: 'player_a_test',
          loserPlayerId: 'player_b_test',
          result: 'WIN',
          reason: 'COMPLETED',
          durationMs: 45000,
          summary: 'BroAlpha completed 3-in-a-row.',
        },
        {
          roundNumber: 2,
          gameId: 'reaction-test',
          winnerPlayerId: 'player_b_test',
          loserPlayerId: 'player_a_test',
          result: 'WIN',
          reason: 'COMPLETED',
          durationMs: 12000,
          summary: 'BroBeta clicked faster in 230ms.',
        },
        {
          roundNumber: 3,
          gameId: 'connect-four',
          winnerPlayerId: 'player_a_test',
          loserPlayerId: 'player_b_test',
          result: 'WIN',
          reason: 'COMPLETED',
          durationMs: 65000,
          summary: 'BroAlpha connected 4 discs horizontally.',
        },
        {
          roundNumber: 4,
          gameId: 'wordle',
          winnerPlayerId: 'player_a_test',
          loserPlayerId: 'player_b_test',
          result: 'WIN',
          reason: 'COMPLETED',
          durationMs: 80000,
          summary: 'BroAlpha guessed the secret word.',
        },
      ],
    });

    assert.ok(saved, 'Match should be successfully saved');
    assert.strictEqual(saved.id, testMatchId);
    assert.strictEqual(saved.winnerName, 'BroAlpha');
    assert.strictEqual(saved.scoreA, 3);
    assert.strictEqual(saved.scoreB, 1);

    // Fetch by ID
    const retrieved = await getMatchById(testMatchId);
    assert.ok(retrieved, 'Should fetch match by ID from Neon DB');
    assert.strictEqual(retrieved.id, testMatchId);
    assert.strictEqual(retrieved.roomCode, 'TEST1');
    assert.strictEqual(retrieved.playerAName, 'BroAlpha');
    assert.strictEqual(retrieved.playerBName, 'BroBeta');
    assert.strictEqual(retrieved.rounds.length, 4);

    // Fetch recent
    const recent = await getRecentMatches(5);
    assert.ok(Array.isArray(recent));
    assert.ok(recent.some((m) => m.id === testMatchId));
  });
});
