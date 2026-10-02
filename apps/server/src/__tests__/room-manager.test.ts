import { describe, it } from 'node:test';
import assert from 'node:assert';
import { roomManager } from '../room-manager.js';

describe('Room Manager Lifecycle', () => {
  it('creates room with 5-character readable code and host slot', () => {
    const { room, playerId, sessionToken } = roomManager.createRoom('HostBro', 3);
    assert.strictEqual(room.code.length, 5);
    assert.strictEqual(room.status, 'WAITING');
    assert.strictEqual(room.players.playerA?.name, 'HostBro');
    assert.strictEqual(room.players.playerB, null);
    assert.strictEqual(playerId, room.players.playerA?.id);
    assert.strictEqual(typeof sessionToken, 'string');
  });

  it('allows second player to join and prevents third player', () => {
    const { room } = roomManager.createRoom('HostBro', 3);
    const joinResult = roomManager.joinRoom(room.code, 'GuestBro');

    assert.strictEqual(joinResult.room.players.playerB?.name, 'GuestBro');

    // 3rd player attempt should throw ROOM_FULL
    assert.throws(() => {
      roomManager.joinRoom(room.code, 'ThirdWheel');
    }, /ROOM_FULL/);
  });

  it('authenticates valid socket credentials and rejects invalid', () => {
    const { room, playerId, sessionToken } = roomManager.createRoom('HostBro', 3);

    const validAuth = roomManager.authenticateSocket(room.code, playerId, sessionToken, 'socket_123');
    assert.strictEqual(validAuth?.isHost, true);

    const invalidAuth = roomManager.authenticateSocket(room.code, playerId, 'wrong_token', 'socket_456');
    assert.strictEqual(invalidAuth, null);
  });

  it('handles turn-based series playlist drafting and uniqueness', () => {
    // Target wins = 2 -> 3 games needed (2*2 - 1)
    const { room: r1, playerId: hostId, sessionToken: hostToken } = roomManager.createRoom('HostBro', 2);
    const { playerId: guestId, sessionToken: guestToken } = roomManager.joinRoom(r1.code, 'GuestBro');

    // Authenticate both sockets
    roomManager.authenticateSocket(r1.code, hostId, hostToken, 'sock_h');
    roomManager.authenticateSocket(r1.code, guestId, guestToken, 'sock_g');

    // Host starts match series
    const started = roomManager.startMatch(r1.code, hostId);
    assert.ok(started);
    assert.strictEqual(started.status, 'SELECTING_GAME');
    assert.strictEqual(started.selectingPlayerId, hostId);
    assert.strictEqual(started.currentMatch?.totalGamesNeeded, 3);
    assert.deepStrictEqual(started.currentMatch?.gamePlaylist, []);

    // Pick 1: Host drafts Tic Tac Toe
    const pick1 = roomManager.selectGame(r1.code, hostId, 'tic-tac-toe');
    assert.ok(pick1);
    assert.strictEqual(pick1.activeGame, null, 'Active game should be null while draft in progress');
    assert.strictEqual(pick1.room.status, 'SELECTING_GAME');
    assert.strictEqual(pick1.room.selectingPlayerId, guestId, 'Should alternate to challenger');
    assert.deepStrictEqual(pick1.room.currentMatch?.gamePlaylist, ['tic-tac-toe']);

    // Challenger tries to draft Tic Tac Toe again -> Should reject (uniqueness)
    const duplicatePick = roomManager.selectGame(r1.code, guestId, 'tic-tac-toe');
    assert.strictEqual(duplicatePick, null, 'Duplicate game selection must be rejected');

    // Pick 2: Challenger drafts Reflex Duel
    const pick2 = roomManager.selectGame(r1.code, guestId, 'reaction-test');
    assert.ok(pick2);
    assert.strictEqual(pick2.activeGame, null);
    assert.strictEqual(pick2.room.selectingPlayerId, hostId, 'Should alternate back to host');
    assert.deepStrictEqual(pick2.room.currentMatch?.gamePlaylist, ['tic-tac-toe', 'reaction-test']);

    // Pick 3: Host drafts Connect Four -> Draft complete!
    const pick3 = roomManager.selectGame(r1.code, hostId, 'connect-four');
    assert.ok(pick3);
    assert.ok(pick3.activeGame, 'Draft complete: opening round should launch');
    assert.strictEqual(pick3.activeGame?.gameId, 'tic-tac-toe');
    assert.strictEqual(pick3.room.status, 'IN_GAME');
    assert.deepStrictEqual(pick3.room.currentMatch?.gamePlaylist, ['tic-tac-toe', 'reaction-test', 'connect-four']);
  });
});
