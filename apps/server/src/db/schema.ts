import { pgTable, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import type { RoundRecord } from '@bvb/shared';

export const matches = pgTable('matches', {
  id: text('id').primaryKey(),
  roomCode: text('room_code').notNull(),
  targetWins: integer('target_wins').notNull().default(3),
  playerAId: text('player_a_id').notNull(),
  playerAName: text('player_a_name').notNull(),
  playerBId: text('player_b_id').notNull(),
  playerBName: text('player_b_name').notNull(),
  winnerId: text('winner_id'),
  winnerName: text('winner_name'),
  scoreA: integer('score_a').notNull().default(0),
  scoreB: integer('score_b').notNull().default(0),
  totalRounds: integer('total_rounds').notNull().default(0),
  rounds: jsonb('rounds').$type<RoundRecord[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).defaultNow().notNull(),
});

export type MatchDbRecord = typeof matches.$inferSelect;
export type NewMatchDbRecord = typeof matches.$inferInsert;
