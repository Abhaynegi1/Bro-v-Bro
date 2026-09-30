# Technical Architecture — Bro v Bro

## 1. High-Level Architecture Overview

Bro v Bro is built on a clean separation of concerns between **room management**, **match orchestration**, **game engines**, and **realtime transport**.

```mermaid
graph TD
    subgraph Client["Client (React + Vite + TypeScript)"]
        UI["UI Layer / Screens (Landing, Waiting, Match, Scoreboard)"]
        ClientSocket["Socket.IO Client Gateway"]
        ActiveGameView["Active Game Component (Dynamic Plugin Loader)"]
        UI --> ClientSocket
        UI --> ActiveGameView
    end

    subgraph Transport["Realtime Transport"]
        SocketServer["Fastify Socket.IO Gateway"]
        AuthMiddleware["Session & Room Validation (Zod)"]
        SocketServer --> AuthMiddleware
    end

    subgraph Server["Server Core (Node.js + Fastify + TypeScript)"]
        RoomManager["Room Manager (Rooms, Players, Presence)"]
        MatchEngine["Match Engine (Series, Rounds, Scoreboard)"]
        GameRegistry["Game Registry (Plug-and-play Game Engines)"]
        MemoryStore["In-Memory Store (Rooms, Active Matches)"]
        
        AuthMiddleware --> RoomManager
        RoomManager --> MatchEngine
        MatchEngine --> GameRegistry
        RoomManager -.-> MemoryStore
    end

    subgraph Deferred["Deferred Layer (Phase 5)"]
        PostgresDB[("PostgreSQL via Drizzle ORM")]
    end

    ClientSocket <===>|WebSockets (Events)| SocketServer
    GameRegistry -.->|Future Match History| PostgresDB
```

---

## 2. Core Architectural Layers

### 2.1 Presentation Layer (Frontend)
- **Framework:** React 18+ with Vite and TypeScript.
- **Styling:** Tailwind CSS for structural utility alongside custom CSS for snappy micro-animations, bold typography, and arcade-like aesthetics.
- **State Management:** Lightweight React state (or Zustand) paired with custom Socket.IO hooks. The client holds a mirrored view of server state; it never unilaterally decides round or match outcomes.
- **Game Renderers:** Dynamic game component renderer that maps the current `gameId` to an isolated React component adhering to a standard UI prop contract.

### 2.2 Transport & Gateway Layer
- **Framework:** Fastify with `@fastify/websocket` or Fastify Socket.IO plugin.
- **Validation:** Zod schemas applied to all incoming socket event payloads and HTTP requests. Invalid payloads are dropped with error acknowledgments before reaching core engines.
- **Session Identification:** Ephemeral tokens (e.g., nanoid) stored in the browser's `sessionStorage` associate socket reconnections with the correct player slot.

### 2.3 Core Domain Engines (Backend)
1. **Room Manager:**
   - Handles room creation, code generation (e.g., `BRO99`), player join/leave, ready states, and cleanup timers.
   - Manages player slots: Player 1 (Host) and Player 2 (Guest).
2. **Match Engine:**
   - Governs series rules (e.g., "First to 3 wins" or "Best of 5").
   - Controls round transitions: `ROUND_START` → `GAME_ACTIVE` → `ROUND_COMPLETE` → `SERIES_FINISH`.
   - Maintains the official series scoreboard.
3. **Game Registry & Plugin Engines:**
   - Pure, decoupled game engines implementing the `GameDefinition` contract.
   - Validates player moves, mutates the active round game state, checks terminal conditions, and outputs an authoritative `GameResult`.
   - **Zero coupling:** A game engine has no reference to rooms, sockets, or database models.

### 2.4 Persistence Layer
- **V1 (Current):** 100% In-Memory store (`Map<string, Room>`). Highly performant, zero setup friction, perfectly suited for ephemeral 1v1 sessions.
- **V2 (Phase 5):** PostgreSQL with Drizzle ORM introduced solely for match history and telemetry once the core multiplayer experience is battle-tested.

---

## 3. Strict Boundary Rules

To prevent code entanglement as mini-games are added, the system enforces strict dependency boundaries:

```text
Room System  ──>  Match System  ──>  Game Registry
     │                  │                   │
     ▼                  ▼                   ▼
 (Knows Rooms)    (Knows Rounds)     (Only knows Game Rules)
```

1. **Games NEVER import Rooms or Matches:** A game engine receives an input payload and a state object; it produces an updated state object. It does not know who the players are outside their slot IDs (`playerA`, `playerB`).
2. **Matches NEVER contain game-specific logic:** The match engine does not inspect chess boards or wordle guesses. It asks the Game Registry: *"Is this move valid?"* and *"Is this game finished?"*.
3. **Clients NEVER dictate game results:** Clients send player intent (`game:move`). The server evaluates the move, determines win/loss/draw, updates scores, and broadcasts state.
