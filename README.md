# Bro v Bro

> A 1v1 browser game night where you and your bro battle across multiple mini-games.

Win games. Earn points. Become the better bro.

---

## What is Bro v Bro?

Bro v Bro is a lightweight, instant 1v1 multiplayer gaming platform inspired by Ludwig's "Bro v Bro" series. Two friends hop into a private room, pick from a playlist of snappy mini-games (Tic Tac Toe, Reaction Time, Wordle, Connect Four, Minesweeper, Chess), and fight for points across a multi-game series.

**The core principle:**
> **The game is not the product. The BRO V BRO match is the product.**

Individual games are interchangeable modules. The room, match scoring, player rivalry, and fast-paced progression between games form the core experience.

---

## Inspiration

Bro v Bro draws direct inspiration from the popular 1v1 gaming gauntlet and creator challenge format popularized by streamers like **Ludwig Ahgren**. In this format, two friends battle across a diverse gauntlet of quick, disparate games—spanning reflex tests, retro classics, puzzle duels, and party showdowns—earning points round by round until an undisputed winner emerges. This project translates that chaotic, high-stakes game-night format into a zero-friction browser experience you can launch with a friend in seconds.

---

## Current Status

- **Status:** Phase 0 — Documentation & Architecture Foundation
- **Current Focus:** Establishing system boundaries, data contracts, and game plugin specifications before writing application code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS + Custom CSS |
| **Backend** | Node.js, Fastify, TypeScript, Socket.IO |
| **Data & ORM** | In-memory (V1) → PostgreSQL + Drizzle ORM (V2) |
| **Validation** | Zod |
| **Auth** | None for V1 (Room code + ephemeral session token) |

---

## Documentation

Comprehensive project documentation lives in the [`docs/`](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/README.md) directory:

- [**Product Concept & Scope**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/product.md) — Game loop, user actions, V1 non-goals
- [**Core Principles**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/principles.md) — Engineering and design rules
- [**System Architecture**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/architecture.md) — High-level architecture & module boundaries
- [**User Flows**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/user-flow.md) — Screen progressions & edge-case handling
- [**Room System**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/room-system.md) — Room lifecycle & player pairing
- [**Match System**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/match-system.md) — Series scoring, round flow & progression
- [**Game System**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/game-system.md) — Game interface, plugin architecture & candidate games
- [**Realtime Architecture**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/realtime.md) — Socket.IO protocol & event taxonomy
- [**Data Model**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/data-model.md) — Entities, state transitions & persistence plan
- [**API Contracts**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/api.md) — HTTP & WebSocket boundaries
- [**UI & Design Direction**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/ui.md) — Visual principles & screen layouts
- [**Development Guide & AI Rules**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/development.md) — Conventions & AI agent rules
- [**Roadmap**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/roadmap.md) — Phased rollout plan
- [**Decisions (ADRs)**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/decisions/README.md) — Architecture decision records

---

## Local Development (Upcoming - Phase 1)

When the skeleton is initialized:

```bash
# Install root dependencies
npm install

# Start development servers (frontend + backend)
npm run dev
```
