# Game System & Plugin Architecture — Bro v Bro

## 1. Core Principle & Isolation

> **Individual games are plugins. The match system is the host.**

Each game is an isolated module containing pure rules, state transitions, validation, and a dedicated UI renderer. A game module must never make network calls, inspect room objects, or query databases directly.

---

## 2. Standard Game Interface (`GameDefinition`)

Every game on the backend must implement the standard `GameDefinition` contract:

```typescript
export interface MoveContext {
  playerId: string;
  timestamp: number;
}

export interface GameResult {
  winnerPlayerId: string | null; // null for draw
  loserPlayerId: string | null;
  result: 'WIN' | 'DRAW';
  reason: 'COMPLETED' | 'FORFEIT' | 'TIMEOUT';
  summary?: string;
}

export interface GameDefinition<TState, TMove> {
  id: string;
  name: string;
  description: string;
  minPlayers: 2;
  maxPlayers: 2;

  /** Generates fresh starting state for the game */
  createInitialState(playerIds: [string, string]): TState;

  /** Validates whether a move is legal given the current state and player */
  validateMove(state: TState, move: TMove, context: MoveContext): boolean;

  /** Applies the move and returns a brand-new immutable state object */
  applyMove(state: TState, move: TMove, context: MoveContext): TState;

  /** Checks if the game has met a terminal condition */
  isFinished(state: TState): boolean;

  /** Computes the final winner/draw if finished */
  getResult(state: TState): GameResult;

  /** Optional: masks private information before broadcasting to a specific player (e.g. Wordle solution or hidden mines) */
  sanitizeStateForPlayer?(state: TState, viewingPlayerId: string): unknown;
}
```

### Frontend Game Component Contract
On the React client, each game registers a component conforming to:

```typescript
export interface GameComponentProps<TState, TMove> {
  gameState: TState;
  myPlayerId: string;
  opponentPlayerId: string;
  isMyTurn: boolean;
  onSendMove: (move: TMove) => void;
}
```

---

## 3. Game Candidates & Rollout Sequence

Mini-games are rolled out in order of increasing state complexity:

```text
1. Tic Tac Toe     (Phase 2 - Architecture & Multiplayer PoC)
2. Reaction Test   (Phase 4 - Asynchronous/reflex timing)
3. Wordle-style    (Phase 4 - Hidden state sanitization)
4. Connect Four    (Phase 4 - Turn-based grid evaluation)
5. Minesweeper     (Phase 4 - Speed race / board synchronization)
6. Chess           (Phase 4 - Complex move validation via chess.js)
```

The primary objective of **Tic Tac Toe** is NOT to build an exciting game—it is to **prove the complete multiplayer socket lifecycle**, state synchronization, and match progression on a bug-free, trivial ruleset.

---

## 4. Evaluation of Existing Game Implementations

We do **not** automatically build every game from scratch. Where high-quality, permissively licensed open-source libraries exist (e.g., `chess.js` for chess rule validation), we should leverage them.

### Third-Party Library Integration Checklist
Before integrating any third-party game code or npm library, fill out this rubric:

```text
Name:                  [e.g., chess.js]
Repository:            [URL]
License:               [MIT / Apache 2.0 / BSD] (GPL / AGPL strictly forbidden)
Integration Method:    [npm library / adapted TS logic / embedded React component]
Dependencies:          [List external dependencies]
Can we modify it?      [Yes / No]
Can we redistribute?   [Yes / No]
Can we control state?  [Yes / No - Must support server-authoritative state]
Can server determine?  [Yes / No - Server must be able to verify winner]
```

### Strict Rules Regarding `iframe` Embedding

Do **NOT** assume external gaming websites can simply be embedded via `<iframe>`. An `iframe` is strictly prohibited as the core architecture. It may only be considered if:
1. The external host explicitly permits framing (`X-Frame-Options` and `Content-Security-Policy`).
2. Its license and terms of service legally permit commercial/redistributed framing.
3. Bidirectional `postMessage` communication can be cryptographically secured.
4. The server can authoritatively verify the final game state and winner (not relying on client screenshot or honor system).
5. The UX feels native, responsive, and free of third-party ads or popups.

**Default approach:** Integrate pure TypeScript logic engines into the server and build or adapt clean, cohesive React views in the client.
