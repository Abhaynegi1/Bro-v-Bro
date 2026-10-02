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

## Phase 1 — Skeleton & Realtime Plumbing *(Completed)*
**Goal:** Prove two browsers can connect into a single room and see each other.
- [x] Initialize monorepo / folder structure:
  - `apps/web`: React + Vite + TypeScript + Tailwind CSS.
  - `apps/server`: Node.js + Fastify + TypeScript + Socket.IO.
  - `packages/shared`: Shared TypeScript types, Zod schemas, event names.
- [x] Implement room creation (`POST /api/rooms` → returns 5-char code).
- [x] Implement room joining (`POST /api/rooms/:code/join`).
- [x] Implement Socket.IO handshake with ephemeral session tokens.
- [x] Build Waiting Room UI showing real-time player presence (Player 1 & Player 2 connected).

---

## Phase 2 — First Game (Tic Tac Toe PoC) *(Completed)*
**Goal:** Prove the complete server-authoritative multiplayer game loop with the simplest possible game.
- [x] Implement `TicTacToeEngine` conforming to `GameDefinition`.
- [x] Server handles `game:move`, validates turns, applies moves, and detects 3-in-a-row or cat's game (draw).
- [x] Build client Tic Tac Toe board component with retro arcade theme & confetti.
- [x] Deliver end-to-end loop:
  ```text
  Create Room ➔ Join Room ➔ Start Game ➔ Send Moves ➔ Synchronize State ➔ Determine Winner ➔ Declare Result ➔ Next Round / Rematch
  ```

---

## Phase 3 — Full Match & Series System *(Completed)*
**Goal:** Turn standalone game rounds into a continuous Bro v Bro competition series.
- [x] Implement multi-round match progression (e.g. First to 3 points).
- [x] Build the **Universal Match Header** (live scoreboard, player avatars, stars & target wins).
- [x] Implement the **Game Selection Screen** (Host picks Round 1; Loser's Revenge picks subsequent rounds).
- [x] Implement Round Result breakdown and transition countdowns.
- [x] Implement Final Match Series screen, Champion podium, recap table, and Rematch reset loop.
- [x] Implemented second plug-and-play game: **Reflex Duel** (`reaction-test`) for genuine multi-game selection.

---

## Phase 4 — Game Library Expansion *(Completed)*
**Goal:** Introduce diverse mini-games one by one into the plug-in registry.
1. [x] **Reaction Test (Reflex Duel):** Simultaneous reflex test (measures server-validated reaction time).
2. [x] **Connect Four:** 7x6 gravity grid with turn-based column dropping and 4-in-a-row detection.
3. [x] **Wordle Race:** Word-guessing game featuring state sanitization (hiding secret word from client).
4. [x] **Minesweeper (Minefield Battle):** 1v1 speed race on 9x9 dual boards with first-click safety & detonation knockout.
5. [x] **Speed Chess:** Classic 1v1 integrated with `chess.js` for move validation and standard clocks.

---

## Phase 5 — Persistence & History (Neon PostgreSQL + Drizzle) *(Completed)*
**Goal:** Store completed match results for permanent post-game recaps.
- [x] Introduce PostgreSQL and Drizzle ORM into `apps/server` connected to Neon DB.
- [x] Save finalized matches, player names, scores, and round summaries automatically upon series conclusion.
- [x] Build shareable post-match summary permalinks (`/match/:id`) with verified database archive cards.
- [x] Added "Share Permanent Recap" button with clipboard integration on the post-match victory screen.

---

## Phase 6 — Polish, Audio & Resilience
**Goal:** Elevate the experience from functional to unforgettable.
- Sound effects for button clicks, moves, round wins, and buzzer defeats.
- Snappy visual micro-animations (confetti, score counter flips).
- 30-second disconnect pause and graceful reconnection recovery.
- Full mobile browser touch optimization.
