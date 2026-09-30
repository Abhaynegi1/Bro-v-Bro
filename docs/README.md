# Bro v Bro — Documentation Index

Welcome to the **Bro v Bro** technical and product documentation. This documentation is written to provide immediate, actionable context for both human developers and AI coding agents.

---

## Documentation Directory

| Document | Purpose |
|---|---|
| [**product.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/product.md) | Product concept, gameplay loop, core actions, and explicit V1 non-goals |
| [**principles.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/principles.md) | Immutable engineering and design rules guiding every technical decision |
| [**architecture.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/architecture.md) | High-level system structure, client/server boundaries, and component layers |
| [**user-flow.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/user-flow.md) | Step-by-step user journeys, UI wireflow diagrams, and edge cases |
| [**room-system.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/room-system.md) | Room lifecycle, room codes, player pairing, and disconnect mechanics |
| [**match-system.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/match-system.md) | Series management, round progression, point scoring, and draw handling |
| [**game-system.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/game-system.md) | Modular game plugin interface (`GameDefinition`), evaluation criteria, and candidate list |
| [**realtime.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/realtime.md) | WebSocket & Socket.IO communication protocols, authoritative state sync, and event contracts |
| [**data-model.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/data-model.md) | Domain entities, in-memory representations, and future relational database schema |
| [**api.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/api.md) | Minimal REST API endpoints and separation between HTTP and WebSocket responsibilities |
| [**ui.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/ui.md) | Design principles, aesthetic guidelines, screen layouts, and anti-patterns |
| [**development.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/development.md) | Code conventions, validation rules, testing checklist, and **AI Coding Agent Rules** |
| [**roadmap.md**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/roadmap.md) | Phased delivery plan from Phase 0 (Docs) through Phase 6 (Polish) |
| [**decisions/**](file:///c:/Users/lenovo/Desktop/Project%20Dump/Bro%20V%20Bro/docs/decisions/README.md) | Architectural Decision Records (ADRs) tracking foundational choices |

---

## Core Mental Model

Before writing or modifying any code, remember the golden rule:

```
[ Room ]               -> Temporary connection container for 2 players
  └── [ Match ]        -> The overall series competition (e.g., Best of 5)
        ├── [ Round ]  -> An individual point scored in a chosen game
        └── [ Game ]   -> Isolated game rules & UI component (interchangeable)
```

The match system coordinates the competition; the game plug-ins merely report moves and state changes.
