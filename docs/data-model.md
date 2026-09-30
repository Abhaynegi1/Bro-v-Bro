# Data Model & Storage Strategy — Bro v Bro

## 1. Domain Entities Overview

The core domain consists of six primary entities:

```text
Player (Ephemeral session participant)
  └── Room (Pairing container with code)
        └── Match (Overall series competition)
              └── Round (Instance of a mini-game played for 1 point)
                    ├── Game (Engine definition & static metadata)
                    └── GameResult (Outcome record)
```

---

## 2. Storage Strategy: In-Memory First

> **PostgreSQL persistence is NOT required for the first prototype.**

### V1 Strategy (Phases 1–4)
- All entities (`Room`, `Player`, `Match`, `Round`) exist purely in **Node.js process memory** via `Map<string, Room>`.
- In-memory state offers maximum agility:
  - Zero database setup, migrations, or local service dependencies.
  - Sub-millisecond read/write latency for realtime socket handlers.
  - Automatic memory reclamation via periodic garbage collection of expired rooms.

### V2 Strategy (Phase 5 Persistence)
- PostgreSQL paired with **Drizzle ORM** will be introduced solely to support:
  - Match history and series recaps after players leave.
  - Long-term game balance telemetry (win rates, round durations).
  - Shareable post-match summary links.

---

## 3. Ephemeral vs. Persistent Mapping

| Entity | Field | V1 In-Memory | V2 Persistent (Postgres) |
|---|---|---|---|
| **Player** | `id`, `sessionToken` | In-Memory (ephemeral) | Ephemeral session token (not saved) |
| **Player** | `name` | In-Memory | Saved in `match_players` join table |
| **Room** | `id`, `code`, `status` | In-Memory | `rooms` table (archived on close) |
| **Match** | `id`, `seriesCondition` | In-Memory | `matches` table |
| **Match** | `scores`, `winnerId` | In-Memory | `matches` table |
| **Round** | `roundNumber`, `gameId` | In-Memory | `rounds` table |
| **Round** | `winnerId`, `durationMs`| In-Memory | `rounds` table |
| **Game State** | Dynamic grid/moves | In-Memory (discarded on round finish) | Optional JSON blob for match replay |

---

## 4. Entity Definitions (TypeScript & Future Drizzle Schema)

### 4.1 In-Memory Domain Definitions

```typescript
export interface Player {
  id: string;
  name: string;
  sessionToken: string;
  isHost: boolean;
  connected: boolean;
  lastActiveAt: number;
}

export interface RoomRecord {
  id: string;
  code: string;
  status: 'WAITING' | 'READY' | 'IN_GAME' | 'ROUND_COMPLETE' | 'MATCH_COMPLETE' | 'CLOSED';
  playerA: Player | null;
  playerB: Player | null;
  activeMatchId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface MatchRecord {
  id: string;
  roomId: string;
  targetWins: number;
  scoreA: number;
  scoreB: number;
  winnerPlayerId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  rounds: RoundSummary[];
}

export interface RoundSummary {
  roundNumber: number;
  gameId: string;
  winnerPlayerId: string | null;
  loserPlayerId: string | null;
  result: 'WIN' | 'DRAW';
  reason: 'COMPLETED' | 'FORFEIT' | 'TIMEOUT';
  durationMs: number;
}
```

### 4.2 Future Drizzle Schema Blueprint (Phase 5 Reference Only)

```typescript
// For future reference in Phase 5: do NOT create migrations or DB connections in V1.
/*
import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomCode: text('room_code').notNull(),
  targetWins: integer('target_wins').notNull().default(3),
  playerAName: text('player_a_name').notNull(),
  playerBName: text('player_b_name').notNull(),
  winnerName: text('winner_name'),
  scoreA: integer('score_a').notNull().default(0),
  scoreB: integer('score_b').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});
*/
```
