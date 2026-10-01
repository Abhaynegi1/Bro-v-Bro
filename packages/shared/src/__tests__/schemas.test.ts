import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CreateRoomSchema,
  JoinRoomSchema,
  RoomCodeParamSchema,
  SocketAuthSchema,
  TicTacToeMoveSchema,
  ReactionTestMoveSchema,
  ConnectFourMoveSchema,
  WordleMoveSchema,
  MinesweeperMoveSchema,
} from '../schemas.js';

describe('Shared Zod Schemas', () => {
  describe('CreateRoomSchema', () => {
    it('accepts valid host name and target wins', () => {
      const result = CreateRoomSchema.safeParse({ hostName: 'Abhay', targetWins: 3 });
      assert.strictEqual(result.success, true);
    });

    it('rejects empty host name', () => {
      const result = CreateRoomSchema.safeParse({ hostName: '', targetWins: 3 });
      assert.strictEqual(result.success, false);
    });

    it('defaults targetWins to 3 if omitted', () => {
      const result = CreateRoomSchema.safeParse({ hostName: 'Player' });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.targetWins, 3);
      }
    });

    it('rejects targetWins out of 1-10 range', () => {
      assert.strictEqual(CreateRoomSchema.safeParse({ hostName: 'P', targetWins: 0 }).success, false);
      assert.strictEqual(CreateRoomSchema.safeParse({ hostName: 'P', targetWins: 11 }).success, false);
    });
  });

  describe('JoinRoomSchema', () => {
    it('accepts valid guest name', () => {
      const result = JoinRoomSchema.safeParse({ guestName: 'GuestBro' });
      assert.strictEqual(result.success, true);
    });

    it('rejects empty guest name', () => {
      assert.strictEqual(JoinRoomSchema.safeParse({ guestName: '   ' }).success, false);
    });
  });

  describe('RoomCodeParamSchema', () => {
    it('accepts and uppercases 5-character alphanumeric codes', () => {
      const result = RoomCodeParamSchema.safeParse({ code: 'abc12' });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.code, 'ABC12');
      }
    });

    it('rejects codes with invalid characters', () => {
      assert.strictEqual(RoomCodeParamSchema.safeParse({ code: 'AB-12' }).success, false);
      assert.strictEqual(RoomCodeParamSchema.safeParse({ code: 'A' }).success, false);
    });
  });

  describe('SocketAuthSchema', () => {
    it('accepts valid socket auth payload', () => {
      const result = SocketAuthSchema.safeParse({
        roomCode: 'ABCDE',
        sessionToken: 'session_token_12345',
        playerId: 'player-uuid-1',
      });
      assert.strictEqual(result.success, true);
    });

    it('rejects too short sessionToken', () => {
      assert.strictEqual(
        SocketAuthSchema.safeParse({
          roomCode: 'ABCDE',
          sessionToken: 'short',
          playerId: 'p1',
        }).success,
        false
      );
    });
  });

  describe('Move Schemas', () => {
    it('TicTacToeMoveSchema validates cellIndex 0..8', () => {
      assert.strictEqual(TicTacToeMoveSchema.safeParse({ cellIndex: 0 }).success, true);
      assert.strictEqual(TicTacToeMoveSchema.safeParse({ cellIndex: 8 }).success, true);
      assert.strictEqual(TicTacToeMoveSchema.safeParse({ cellIndex: 9 }).success, false);
      assert.strictEqual(TicTacToeMoveSchema.safeParse({ cellIndex: -1 }).success, false);
    });

    it('ReactionTestMoveSchema validates CLICK action', () => {
      assert.strictEqual(ReactionTestMoveSchema.safeParse({ action: 'CLICK' }).success, true);
      assert.strictEqual(ReactionTestMoveSchema.safeParse({ action: 'JUMP' }).success, false);
    });

    it('ConnectFourMoveSchema validates column 0..6', () => {
      assert.strictEqual(ConnectFourMoveSchema.safeParse({ column: 0 }).success, true);
      assert.strictEqual(ConnectFourMoveSchema.safeParse({ column: 6 }).success, true);
      assert.strictEqual(ConnectFourMoveSchema.safeParse({ column: 7 }).success, false);
    });

    it('WordleMoveSchema validates 5-letter uppercase guess', () => {
      assert.strictEqual(WordleMoveSchema.safeParse({ action: 'GUESS', guess: 'CRANE' }).success, true);
      assert.strictEqual(WordleMoveSchema.safeParse({ action: 'GUESS', guess: 'crane' }).success, true);
      assert.strictEqual(WordleMoveSchema.safeParse({ action: 'GUESS', guess: 'LONGWORD' }).success, false);
      assert.strictEqual(WordleMoveSchema.safeParse({ action: 'GUESS', guess: '12345' }).success, false);
    });

    it('MinesweeperMoveSchema validates REVEAL and FLAG actions on 9x9 grid', () => {
      assert.strictEqual(MinesweeperMoveSchema.safeParse({ action: 'REVEAL', row: 0, col: 0 }).success, true);
      assert.strictEqual(MinesweeperMoveSchema.safeParse({ action: 'FLAG', row: 8, col: 8 }).success, true);
      assert.strictEqual(MinesweeperMoveSchema.safeParse({ action: 'REVEAL', row: 9, col: 0 }).success, false);
      assert.strictEqual(MinesweeperMoveSchema.safeParse({ action: 'EXPLODE', row: 0, col: 0 }).success, false);
    });
  });
});
