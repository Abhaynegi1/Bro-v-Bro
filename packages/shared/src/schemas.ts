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
