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
});
