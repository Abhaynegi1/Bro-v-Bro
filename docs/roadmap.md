# Project Roadmap & Implementation Phases — Bro v Bro

The roadmap is structured into linear, testable phases. **Never begin work on a future phase until the current phase is fully functioning and verified.**

```text
Phase 0 (Docs) ➔ Phase 1 (Skeleton) ➔ Phase 2 (First Game) ➔ Phase 3 (Match System) ➔ Phase 4 (Game Expansion) ➔ Phase 5 (Persistence) ➔ Phase 6 (Polish)
```

---

## Phase 0 — Documentation & Foundation *(Current)*
- [x] Establish root `README.md` and complete `/docs` architecture suite.
- [x] Define domain contracts (`GameDefinition`, `Room`, `Match`, `Socket Events`).
- [x] Establish AI coding agent boundaries and core product principles.

---

## Phase 1 — Skeleton & Realtime Plumbing
**Goal:** Prove two browsers can connect into a single room and see each other.
- Initialize monorepo / folder structure:
  - `apps/web`: React + Vite + TypeScript + Tailwind CSS.
  - `apps/server`: Node.js + Fastify + TypeScript + Socket.IO.
  - `packages/shared`: Shared TypeScript types, Zod schemas, event names.
- Implement room creation (`POST /api/rooms` → returns 5-char code).
- Implement room joining (`POST /api/rooms/:code/join`).
- Implement Socket.IO handshake with ephemeral session tokens.
- Build Waiting Room UI showing real-time player presence (Player 1 & Player 2 connected).

---

## Phase 2 — First Game (Tic Tac Toe PoC)
**Goal:** Prove the complete server-authoritative multiplayer game loop with the simplest possible game.
- Implement `TicTacToeEngine` conforming to `GameDefinition`.
- Server handles `game:move`, validates turns, applies moves, and detects 3-in-a-row or cat's game (draw).
- Build client Tic Tac Toe board component.
- Deliver end-to-end loop:
  ```text
  Create Room ➔ Join Room ➔ Start Game ➔ Send Moves ➔ Synchronize State ➔ Determine Winner ➔ Declare Result
  ```

---

## Phase 3 — Full Match & Series System
**Goal:** Turn standalone game rounds into a continuous Bro v Bro competition series.
- Implement multi-round match progression (e.g. First to 3 points).
- Build the **Universal Match Header** (live scoreboard).
- Implement the **Game Selection Screen** (Host picks Round 1; Loser picks subsequent rounds).
- Implement Round Result breakdown and transition countdowns.
- Implement Final Match Series screen and Rematch reset loop.

---

## Phase 4 — Game Library Expansion
**Goal:** Introduce diverse mini-games one by one into the plug-in registry.
1. **Reaction Test:** Simultaneous reflex test (measures server-validated reaction time).
2. **Wordle:** Word-guessing game featuring state sanitization (hiding secret word from client).
3. **Connect Four:** 7x6 gravity grid with turn-based column dropping.
4. **Minesweeper:** Speed race or shared board flag battle.
5. **Chess:** Classic 1v1 integrated with `chess.js` for move validation and standard clocks.

---

## Phase 5 — Persistence & History (PostgreSQL + Drizzle)
**Goal:** Store completed match results for permanent post-game recaps.
- Introduce PostgreSQL and Drizzle ORM into `apps/server`.
- Save finalized matches, player names, and round summaries.
- Generate shareable post-match summary URLs (e.g. `/match/m-xyz987`).

---

## Phase 6 — Polish, Audio & Resilience
**Goal:** Elevate the experience from functional to unforgettable.
- Sound effects for button clicks, moves, round wins, and buzzer defeats.
- Snappy visual micro-animations (confetti, score counter flips).
- 30-second disconnect pause and graceful reconnection recovery.
- Full mobile browser touch optimization.
