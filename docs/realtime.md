# Realtime Architecture & Socket Protocol — Bro v Bro

## 1. Overview & Authoritative Model

Realtime communication in Bro v Bro is built on **Socket.IO** running on top of Node.js / Fastify.

```text
Browser A (Player 1)
       │
       │ emit("game:move", movePayload)
       ▼
 Fastify Socket.IO Gateway
       │
       ├── Validate payload (Zod)
       ├── Check active player & turn
       ├── Apply move to Game Engine (applyMove)
       ├── Check terminal condition (isFinished)
       │
       ├── If finished: calculate score & transition round
       └── Broadcast authoritative state update
              │
              ├── emit("game:state", nextState) ──> Browser A
              └── emit("game:state", nextState) ──> Browser B (Player 2)
```

### Golden Rule:
> **The server is strictly authoritative.** Clients never broadcast moves directly to other clients. Clients send user intent to the server; the server validates the intent, mutates canonical state, and broadcasts synchronized updates to both players.

---

## 2. Event Taxonomy

### 2.1 Room & Lobby Events

| Event Name | Direction | Description |
|---|---|---|
| `room:create` | Client → Server | Host creates a room with their chosen display name. |
| `room:join` | Client → Server | Guest requests to join with `roomCode` and display name. |
| `room:player_joined` | Server → Room | Broadcast to room when opponent enters the lobby. |
| `room:ready` | Client → Server | Player toggles ready status. |
| `room:error` | Server → Client | Error response (e.g., room full, invalid code). |

### 2.2 Game Lifecycle Events

| Event Name | Direction | Description |
|---|---|---|
| `game:select` | Client → Server | Authorized player selects next mini-game by `gameId`. |
| `game:start` | Server → Room | Round countdown begins with initial sanitized game state. |
| `game:move` | Client → Server | Active player transmits their move/input. |
| `game:state` | Server → Room | Authoritative updated game state broadcast. |
| `game:complete` | Server → Room | Round concluded with winner/loser and reason. |

### 2.3 Match Lifecycle Events

| Event Name | Direction | Description |
|---|---|---|
| `match:score_update` | Server → Room | Updated series scoreboard (`playerA: 2, playerB: 1`). |
| `match:next_round` | Server → Room | Triggers transition to game selection screen for next round. |
| `match:complete` | Server → Room | Series target reached; crowns overall Bro v Bro champion. |
| `match:rematch_request` | Client → Server | Player requests a series rematch. |

### 2.4 Connection & Resilience Events

| Event Name | Direction | Description |
|---|---|---|
| `player:disconnect` | Server → Room | Notifies opponent of drop and starts 30s reconnect timer. |
| `player:reconnect` | Client → Server | Reconnecting client provides `sessionToken` to reclaim slot. |
| `player:resumed` | Server → Room | Drop timer cancelled; full game snapshot restored. |

---

## 3. Representative Event Payloads

### `game:move` (Client → Server)
```json
{
  "roomId": "BRO42",
  "gameId": "tic-tac-toe",
  "move": {
    "cellIndex": 4
  },
  "clientTimestamp": 1727692800000
}
```

### `game:state` (Server → Room)
```json
{
  "gameId": "tic-tac-toe",
  "stateVersion": 5,
  "state": {
    "board": ["X", null, null, null, "O", null, null, null, "X"],
    "currentTurn": "playerB_id",
    "turnDeadline": 1727692815000
  }
}
```

### `game:complete` (Server → Room)
```json
{
  "roundNumber": 2,
  "gameId": "tic-tac-toe",
  "result": {
    "winnerPlayerId": "playerA_id",
    "loserPlayerId": "playerB_id",
    "result": "WIN",
    "reason": "COMPLETED",
    "summary": "Three in a row on diagonal"
  }
}
```

---

## 4. Resilience & Concurrency Rules

1. **State Versioning:** Every `game:state` broadcast increments an integer `stateVersion`. Clients discard any updates with a lower or equal version number than their local state.
2. **Move Acknowledgments:** Socket.IO acknowledgments (`ack(response)`) return immediate validation status (e.g. `{ ok: true }` or `{ ok: false, error: "NOT_YOUR_TURN" }`).
3. **Turn Timers:** For turn-based games, the server tracks a maximum turn deadline (e.g. 15s). If exceeded, the server executes a default move or marks a turn timeout.
