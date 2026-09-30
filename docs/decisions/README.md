# Architecture Decision Records (ADRs) — Bro v Bro

## 1. What are ADRs?

An **Architecture Decision Record (ADR)** documents a significant architectural or technical decision, along with its context, considered alternatives, and consequences.

Recording ADRs prevents:
- Re-debating settled architectural decisions.
- Accidental regressions introduced by new contributors or AI agents.
- Forgetting why a simpler or more complex path was chosen.

---

## 2. Standard ADR Format

When an architectural decision needs to be formally recorded, create a markdown file in this folder: `docs/decisions/NNN-title.md` following this template:

```markdown
# NNN. [Short Title of Decision]

- **Status:** Proposed | Accepted | Deprecated | Superseded
- **Date:** YYYY-MM-DD
- **Author:** [Name / Agent]

## Context & Problem Statement
What context brought about this decision? What constraints or problems are we solving?

## Decision
What is the change/choice we are committing to?

## Rationale & Alternatives Considered
- **Option 1 (Chosen):** Why did this option win?
- **Option 2:** Why was this rejected?

## Consequences
- **Positive:** What benefits do we gain?
- **Negative / Trade-offs:** What complexities or limitations do we accept?
```

---

## 3. Anticipated ADRs (To Be Formally Created When Activated)

The following foundational choices have been established in the core docs and will have dedicated ADRs filed as code implementation commences:

- `001-use-react-and-typescript.md` — Vite + React SPA architecture
- `002-use-socketio-over-raw-ws.md` — Fastify Socket.IO for automatic reconnects and room multiplexing
- `003-game-plugin-architecture.md` — `GameDefinition` contract decoupling games from match orchestrators
- `004-no-auth-v1.md` — Ephemeral room codes and session tokens over user accounts
- `005-in-memory-state-first.md` — In-memory Map storage for fast V1 delivery, deferring PostgreSQL to Phase 5
