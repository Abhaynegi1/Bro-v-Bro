# Match System — Bro v Bro

## 1. Hierarchy: Room vs Match vs Round vs Game

Clear separation between these four concepts prevents business logic leaks across the codebase:

```text
ROOM
 └── MATCH (Series)
      ├── ROUND 1 → Wordle        (Winner: Player A)
      ├── ROUND 2 → Chess         (Winner: Player B)
      ├── ROUND 3 → Minesweeper   (Winner: Player A)
      └── ROUND 4 → Reaction Test (Winner: Player A)
```

| Entity | Definition | Lifetime |
|---|---|---|
| **Room** | Connection & networking container holding two player sockets | Lasts across multiple matches until players leave |
| **Match** | The multi-round competition series (e.g., "First to 3 Points") | Starts at round 1, ends when a player hits target score |
| **Round** | A single contest within the match playing one selected game | Starts at game launch, ends when game returns a result |
| **Game** | The self-contained logic engine and UI component | Swapped dynamically each round |

---

## 2. Match Model & Scoring

```typescript
export type SeriesCondition = 
  | { type: 'FIRST_TO_N'; targetPoints: number }  // e.g., First to 3
  | { type: 'BEST_OF_N'; totalRounds: number };    // e.g., Best of 5

export interface RoundRecord {
  roundNumber: number;
  gameId: string;
  winnerPlayerId: string | null; // null represents a draw
  loserPlayerId: string | null;
  result: 'WIN' | 'DRAW';
  reason: 'COMPLETED' | 'FORFEIT' | 'TIMEOUT';
  durationMs: number;
  summary?: string;              // e.g. "Abhay guessed in 4 tries"
}

export interface Match {
  id: string;
  roomId: string;
  seriesCondition: SeriesCondition;
  scores: {
    playerA: number;
    playerB: number;
  };
  rounds: RoundRecord[];
  currentRoundNumber: number;
  activeGameId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  seriesWinnerId: string | null;
  createdAt: number;
  completedAt: number | null;
}
```

---

## 3. Round Result Handling

When a round ends, the active game engine returns a standardized result object:

### Scenario A: Clean Win
```json
{
  "winner": "playerA_id",
  "loser": "playerB_id",
  "result": "WIN",
  "reason": "COMPLETED",
  "summary": "Tic Tac Toe completed with 3 in a row"
}
```
**Score Action:** `playerA` score increases by 1.

### Scenario B: Draw / Stalemate
```json
{
  "winner": null,
  "loser": null,
  "result": "DRAW",
  "reason": "COMPLETED",
  "summary": "Board full, no winner"
}
```
**Score Action:** 
- In V1 default rules: Neither player gains a point, round is recorded as a draw, and the match proceeds to the next round. (Or sudden-death replay if configured).

### Scenario C: Forfeit or Disconnect Timeout
```json
{
  "winner": "playerB_id",
  "loser": "playerA_id",
  "result": "WIN",
  "reason": "FORFEIT",
  "summary": "Player A disconnected for more than 30 seconds"
}
```

---

## 4. Match Progression & Game Selection

Who chooses the next game?

1. **Round 1:** The **Host** (Player A) picks the opening game.
2. **Subsequent Rounds (2+):** The **Loser** of the previous round picks the next game. This classic party-game mechanic provides natural catch-up leverage.
3. **After a Draw:** The player who did **not** pick the drawn game gets to pick the replacement game.
4. **Game Cooldowns (Optional):** A game played in round $N$ cannot immediately be replayed in round $N+1$ unless both players agree.

---

## 5. Match Completion & Rematch

1. **Terminal Condition Check:** After each round result is processed, the Match Engine checks:
   - Does either player have $\ge \text{targetPoints}$?
2. **Series Winner Declaration:** If yes, status transitions to `COMPLETED`, `seriesWinnerId` is set, and the UI displays the series recap podium.
3. **Rematch Flow:**
   - Both players receive a **"Rematch?"** prompt.
   - If both click accept, a new `Match` instance is initialized with scores reset to 0-0.
   - The room container, connection sockets, and player assignments remain uninterrupted.
