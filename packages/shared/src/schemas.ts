import { z } from 'zod';

export const CreateRoomSchema = z.object({
  hostName: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 character')
    .max(20, 'Name must be 20 characters or fewer'),
  targetWins: z.number().int().min(1).max(10).default(3),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export const JoinRoomSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(1, 'Name must be at least 1 character')
    .max(20, 'Name must be 20 characters or fewer'),
});

export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;

export const RoomCodeParamSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{4,6}$/, 'Invalid room code format'),
});

export type RoomCodeParam = z.infer<typeof RoomCodeParamSchema>;

export const SocketAuthSchema = z.object({
  roomCode: z.string().trim().toUpperCase(),
  sessionToken: z.string().min(10),
  playerId: z.string().min(1),
});

export type SocketAuth = z.infer<typeof SocketAuthSchema>;

export const TicTacToeMoveSchema = z.object({
  cellIndex: z.number().int().min(0).max(8),
});

export type TicTacToeMoveInput = z.infer<typeof TicTacToeMoveSchema>;

export const GameSelectSchema = z.object({
  gameId: z.string().trim().min(1).max(50),
});

export type GameSelectInput = z.infer<typeof GameSelectSchema>;

export const ReactionTestMoveSchema = z.object({
  action: z.literal('CLICK'),
});

export type ReactionTestMoveInput = z.infer<typeof ReactionTestMoveSchema>;

export const ConnectFourMoveSchema = z.object({
  column: z.number().int().min(0).max(6),
});

export type ConnectFourMoveInput = z.infer<typeof ConnectFourMoveSchema>;

export const WordleMoveSchema = z.object({
  action: z.literal('GUESS'),
  guess: z
    .string()
    .trim()
    .toUpperCase()
    .length(5)
    .regex(/^[A-Z]{5}$/, 'Guess must be a 5-letter word'),
});

export type WordleMoveInput = z.infer<typeof WordleMoveSchema>;

export const MinesweeperMoveSchema = z.object({
  action: z.enum(['REVEAL', 'FLAG']),
  row: z.number().int().min(0).max(8),
  col: z.number().int().min(0).max(8),
});

export type MinesweeperMoveInput = z.infer<typeof MinesweeperMoveSchema>;

export const ChessMoveSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('MOVE'),
    from: z.string().trim().toLowerCase().regex(/^[a-h][1-8]$/, 'Invalid from square'),
    to: z.string().trim().toLowerCase().regex(/^[a-h][1-8]$/, 'Invalid to square'),
    promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
  }),
  z.object({
    action: z.literal('RESIGN'),
  }),
  z.object({
    action: z.literal('CLAIM_TIMEOUT'),
  }),
]);

export type ChessMoveInput = z.infer<typeof ChessMoveSchema>;

export const SurrenderSignSchema = z.object({
  signatureDataUrl: z.string().min(1),
  confessionClause: z.string().max(250).optional(),
});

export type SurrenderSignInput = z.infer<typeof SurrenderSignSchema>;

export const FlagDuelMoveSchema = z.object({
  action: z.literal('GUESS'),
  country: z.string().min(1).max(60),
});

export type FlagDuelMoveInput = z.infer<typeof FlagDuelMoveSchema>;
