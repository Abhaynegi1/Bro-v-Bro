# Core Principles — Bro v Bro

These eight principles guide every architectural, product, and engineering decision in Bro v Bro. If a proposed feature or refactor violates any of these principles, it must be rejected or redesigned.

---

### Principle 1 — Minimal First
Do not add features just because they could be useful or because other gaming sites have them. Every line of code, dependency, and configuration must justify its existence in service of the immediate 1v1 loop. When in doubt, leave it out.

---

### Principle 2 — Match Over Game
> **The game is not the product. The BRO V BRO match is the product.**

Individual games are interchangeable modules. The room, match scoring, player experience, and progression between games are the core system. 
- Game-specific logic must **never** leak into the room or match orchestration layers.
- The match system does not care whether the round is Tic Tac Toe, Minesweeper, or Chess—it only cares that the game accepted players, validated moves, and returned an authoritative result.

---

### Principle 3 — No Unnecessary Accounts
If a 5-character room code and an ephemeral browser session token solve the problem, do not introduce authentication.
- No user accounts, passwords, email verification, or third-party OAuth in V1.
- Friction kills casual party games. Players should be in a game within seconds of clicking a link.

---

### Principle 4 — Games Should Be Replaceable
A game must be capable of being added, disabled, replaced, or rewritten without touching a single line of room or match management code.
- Games implement a clean, isolated interface (`GameDefinition`).
- Games never call room methods, database queries, or network sockets directly. They receive state and player inputs, and return new state and results.

---

### Principle 5 — Server Authoritative for Competitive Results
Never trust the client to declare itself the winner.
- The server receives moves/inputs, validates them against the game state rules, advances the state, and determines the official winner or draw.
- Clients are presentation layers and input transmitters. If a client disconnects or tampers with payload data, the server's state remains intact and authoritative.

---

### Principle 6 — Don't Overengineer Early
Start with in-memory state. Introduce persistent storage only when there is an actual requirement that cannot be met without it.
- V1 rooms and matches live entirely in memory on the Fastify/Node backend.
- Do not add PostgreSQL migrations, connection pools, or schema syncing until the core multiplayer loop is proven and stable.

---

### Principle 7 — Fast Path to Playing
The user should get from the landing page to playing a game with the minimum possible number of clicks:
1. Host clicks **"Create Room"** → Enters Name → Shares Code / Link.
2. Guest enters Code + Name → Joins.
3. Host picks game → Match begins.
Zero loading screens, zero onboarding modals, zero cookie banners, zero captcha walls.

---

### Principle 8 — Avoid Generic SaaS UI
This is a game-night experience between two friends, not an enterprise B2B dashboard.
- Avoid boring card layouts, corporate grey tables, generic SaaS typography, or sterile enterprise aesthetics.
- Visuals must feel snappy, playful, competitive, and bold—with clear focus on the active game and a high-visibility scoreboard.
