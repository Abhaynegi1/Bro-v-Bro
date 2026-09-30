# API Specification — Bro v Bro

## 1. Protocol Division: HTTP vs. WebSocket

Bro v Bro maintains a clean division between HTTP endpoints and WebSocket channels:

| Responsibility | Protocol | Rationale |
|---|---|---|
| **Room Creation** | HTTP `POST /rooms` | Single idempotent action returning initial room code and host session token. |
| **Room Validation** | HTTP `GET /rooms/:code` | Pre-flight check to verify room exists and is not full before initiating socket connection. |
| **Room Join Handshake** | HTTP `POST /rooms/:code/join` | Assigns guest player slot and issues session token. |
| **All Active Gameplay** | WebSocket (Socket.IO) | Zero-overhead, bidirectional, low-latency transmission for moves, turns, timers, and round transitions. |

> **No REST for Gameplay:** Do not create REST endpoints like `POST /games/move` or `POST /rounds/next`. All in-game interactions must flow through the persistent WebSocket connection.

---

## 2. HTTP Endpoints (Fastify)

### 2.1 Create Room
Creates an empty room and registers the caller as Host (Player A).

- **Method:** `POST`
- **Route:** `/api/rooms`
- **Request Body:**
  ```json
  {
    "hostName": "Abhay",
    "targetWins": 3
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "roomId": "f3b4c1a2-...",
    "roomCode": "BRO42",
    "playerId": "p1-uuid",
    "sessionToken": "sec_host_xyz987"
  }
  ```

---

### 2.2 Pre-flight Room Check
Verifies code validity and slot availability prior to UI loading.

- **Method:** `GET`
- **Route:** `/api/rooms/:code`
- **Response (`200 OK`):**
  ```json
  {
    "roomCode": "BRO42",
    "status": "WAITING",
    "hostName": "Abhay",
    "isJoinable": true
  }
  ```
- **Error Response (`404 Not Found` / `409 Conflict`):**
  ```json
  {
    "error": "ROOM_FULL",
    "message": "This room already has 2 active players."
  }
  ```

---

### 2.3 Join Room
Registers the second player as Guest (Player B).

- **Method:** `POST`
- **Route:** `/api/rooms/:code/join`
- **Request Body:**
  ```json
  {
    "guestName": "Rahul"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "roomId": "f3b4c1a2-...",
    "roomCode": "BRO42",
    "playerId": "p2-uuid",
    "sessionToken": "sec_guest_abc123"
  }
  ```

---

## 3. WebSocket Handshake & Auth

When establishing the Socket.IO connection, the client provides authentication metadata in the handshake payload:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    roomCode: "BRO42",
    sessionToken: sessionStorage.getItem("bvb_session_token"),
    playerId: sessionStorage.getItem("bvb_player_id")
  }
});
```

The server validates this token during the socket connection phase and automatically attaches the socket to the corresponding Socket.IO room channel (`room:BRO42`).
