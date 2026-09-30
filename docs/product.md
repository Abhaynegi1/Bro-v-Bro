# Product Specification — Bro v Bro

## 1. Product Concept

**Bro v Bro** is a lightweight, instant 1v1 browser gaming platform inspired by the gaming gauntlet and content-creator challenge format popularized by streamers like **Ludwig Ahgren**.

The premise is straightforward:

> Two bros compete against each other across multiple small games. Each game awards a point to the winner. After several games, whoever reaches the series target (or has the most points after N rounds) wins the overall Bro v Bro match.

This is **not** a generic online gaming portal, an esports tournament engine, or a social network. It is built strictly for **two friends challenging each other in a casual, high-energy, slightly chaotic game-night showdown**.

In Ludwig's format, two creators compete across a diverse marathon of rapid mini-challenges—reflex tests, trivia, puzzle showdowns, and retro games—to claim the title of the "better bro" through sheer round-by-round accumulation. Bro v Bro brings that exact format to the web with zero account setup or installation.

### Example Match Progression

```text
ROUND 1 — Wordle       → Abhay
ROUND 2 — Chess        → Rahul
ROUND 3 — Minesweeper  → Abhay
ROUND 4 — Reaction     → Abhay
ROUND 5 — Connect Four → Rahul

FINAL RESULT
Abhay (3) — (2) Rahul
WINNER: Abhay
```

---

## 2. Core User Experience Loop

The primary user loop is frictionless and rapid:

```text
Landing Page
    ↓
Create Room / Join Room
    ↓
Opponent Joins (via 5-character Code or Share Link)
    ↓
Game Selection (Pick from available mini-games)
    ↓
Play Game (Interactive 1v1 session)
    ↓
Determine Winner (Authoritative server calculation)
    ↓
Update Match Scoreboard (Round point awarded)
    ↓
Choose Next Game (Loser picks or alternating)
    ↓
Play Again (Next round starts immediately)
    ↓
Final Series Result (Series winner crowned & Rematch option)
```

---

## 3. Core User Actions

In V1, players can perform the following explicit actions:

1. **Create a room:** One click creates an ephemeral room with a short, memorable room code.
2. **Share room link / code:** Copy a direct invite URL or recite a short room code.
3. **Join a room:** Enter a room code directly or open the shared link.
4. **Enter a display name:** Provide a lightweight nickname (no account creation required).
5. **Realtime presence:** Instantly see when the opponent connects, readies up, or disconnects.
6. **Start a match:** Host launches the match series once both players are ready.
7. **Select a game:** Pick which mini-game to play for the upcoming round.
8. **Play the mini-game:** Realtime 1v1 gameplay inside the browser window.
9. **View round winner:** Immediate declaration of who won the round and why.
10. **Track match score:** Prominent scoreboard showing round-by-round points.
11. **Advance rounds:** Transition seamlessly into the next game without reloading the page.
12. **Complete match:** Crown the overall Bro v Bro champion once the series condition is met.
13. **Rematch / Reset:** Reset the series scores and run it back with the same friend.

---

## 4. Explicit V1 Non-Goals

To maintain a laser focus on shipping a rock-solid, snappy 1v1 game loop, the following features are **explicitly out of scope for V1**:

- **No User Accounts / Authentication:** No email signups, passwords, OAuth, or persistence profiles. Sessions are identified by ephemeral room codes and browser session IDs.
- **No Profiles / Avatars:** No custom avatar uploads, biographies, or XP leveling systems.
- **No Friends Lists / Social Graphs:** No friend requests, status updates, or presence tracking across rooms.
- **No Matchmaking / Random Queues:** Players invite someone they know directly. There is no public matchmaking queue or MMR rating.
- **No Public Lobbies / Directory:** No browser list of open rooms for strangers to join.
- **No In-Game Text Chat:** Players are expected to be on Discord, FaceTime, or sitting next to each other.
- **No Voice Chat / WebRTC Audio:** Third-party audio tools handle voice communication.
- **No Tournaments / Bracket Play:** The architecture is strictly 1v1 (2 players per room).
- **No Global Leaderboards:** Scores exist only within the context of the active match.
- **No Monetization / Payments / Ads:** No microtransactions, coin stores, subscriptions, or banner ads.
- **No Native Mobile Apps:** Browser-first (responsive web design handles mobile browsers).
- **No Game Marketplace / Modding API:** No external developer submission portal or user-created custom games in V1.

Any proposal to add these features must be rejected until V1 is deployed, validated, and stable.
