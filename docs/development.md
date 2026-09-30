# Development Guidelines & AI Coding Agent Rules — Bro v Bro

## 1. Engineering Conventions

### 1.1 Strict TypeScript
- `strict: true` must be enabled across all packages.
- **Never use `any`** unless interfacing with an untyped legacy 3rd-party library, in which case it must be safely cast and isolated with an explanatory comment. Prefer `unknown` with runtime type narrowing.

### 1.2 Input Validation
- All inputs entering through HTTP requests or WebSocket events must be validated with **Zod** schemas.
- Never trust client-declared outcomes. The server validates moves and declares winners.

### 1.3 Game Module Isolation
Games must be pure plug-ins. Strictly enforce these import boundaries:
- ❌ **Forbidden:**
  - `src/games/tictactoe` importing from `src/rooms`
  - `src/games/chess` importing from database models
  - `src/games/wordle` importing from `src/games/minesweeper`
- ✅ **Permitted:**
  ```text
  Room & Match Manager
         │ (imports)
         ▼
  GameDefinition Interface (types only)
         ▲ (implements)
         │
  Specific Game Engine (e.g. TicTacToeEngine)
  ```

### 1.4 Testing Requirements
- **Game Engine Unit Tests:**
  - Valid moves advance state correctly.
  - Invalid moves (out-of-turn, illegal positions, duplicate inputs) are rejected cleanly.
  - Win conditions trigger properly.
  - Draw/stalemate conditions trigger properly.
- **Match Engine Tests:**
  - Round score incrementing and series condition triggers.
  - Disconnect forfeit handling and timers.
  - Rematch reset state integrity.

---

## 2. AI Coding Agent Rules

When an AI coding assistant (or human contributor) works on Bro v Bro, the following **10 rules are mandatory**:

1. **Read Docs First:** Always read [`docs/README.md`](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/README.md) and the subsystem document before making architectural changes.
2. **Consult Subsystem Docs:** Before modifying rooms, matches, or realtime logic, review the corresponding doc (`room-system.md`, `match-system.md`, `realtime.md`).
3. **No Unsolicited Dependencies:** Never introduce third-party libraries (npm packages) without verifying necessity and licensing compatibility.
4. **Preserve Architecture:** Do not compromise architectural boundaries or rewrite core interfaces to solve a localized bug.
5. **Strict Game Isolation:** Keep every game engine independent and testable in pure isolation without socket or room dependencies.
6. **Protect MVP Scope:** Resist feature creep. Do not add chat, voice, leaderboards, or accounts to V1.
7. **Keep Docs Synchronized:** If an architectural pattern is intentionally changed, update the relevant documentation immediately.
8. **No Stealth Subsystems:** Never silently introduce authentication systems, tracking/analytics, payment SDKs, or cloud dependencies.
9. **Clarify Principle Conflicts:** If an instruction conflicts with the 8 Core Principles in [`docs/principles.md`](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/principles.md), ask for clarification before writing code.
10. **Simplest Working Solution:** Always prefer the most transparent, readable, and minimal code that satisfies the requirement.
