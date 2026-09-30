# UI & Design System Guidelines — Bro v Bro

## 1. Aesthetic Direction: "Casual Game Night"

The design of Bro v Bro must feel like two friends yelling at each other on a couch while battling across quick games.

```text
The UI should communicate:
"You are playing your friend."

NOT:
"Welcome to our enterprise SaaS mini-game engagement portal."
```

### Visual Pillars:
1. **Minimal & Punchy:** Zero unnecessary clutter. If an element doesn't help players start a game, make a move, or see the score, remove it.
2. **Playful & Scrappy:** Chunky borders, high-contrast arcade buttons, crisp typography, and snappy sound cues.
3. **Competitive Rivalry:** Prominent player scores and head-to-head framing.
4. **Hero the Game:** 80% of the screen real estate belongs to the active game board. Surrounding chrome is strictly a scoreboard and round counter.

### Anti-Patterns (STRICTLY FORBIDDEN):
- ❌ **No Corporate / SaaS Dashboards:** No collapsible sidebars, stat metrics cards, dropdown account menus, or breadcrumbs.
- ❌ **No "AI Product" Aesthetics:** No generic purple-to-pink gradient blobs, shiny floating stars, or glassmorphic blur overdoses.
- ❌ **No Sluggish Transitions:** No 600ms page fade-outs. Screen transitions must feel instantaneous and snappy (<150ms).
- ❌ **No Generic System Fonts:** Use expressive, punchy modern sans-serif typography (e.g. Outfit, Space Grotesk, or Archivo Black for headers).

---

## 2. Universal Match Header

During gameplay and round transitions, a persistent, minimalist header keeps players locked into the rivalry:

```text
┌─────────────────────────────────────────────────────────────┐
│  ABHAY                                             RAHUL    │
│    [ 3 ]                                           [ 2 ]    │
│                                                             │
│                      ROUND 6 — WORDLE                       │
│                      [ Timer: 00:14 ]                       │
└─────────────────────────────────────────────────────────────┘
```

- **Player Names:** Bold uppercase, distinct player color accents (e.g., Electric Blue vs Hot Coral).
- **Scores:** Large, prominent digits that pulse when updated.
- **Center:** Game title and active countdown timer / turn indicator.

---

## 3. Core Screens Wireframe Specifications

### 3.1 Landing Screen
- **Hero:** Punchy logo (`BRO v BRO`).
- **Tagline:** *"1v1 browser game night with your bro."*
- **Two Big Action Buttons:**
  - `[ CREATE ROOM ]` (Large, primary accent)
  - `[ ENTER ROOM CODE ]` (Secondary outline with quick input)

### 3.2 Waiting Room / Lobby
- **Room Code Display:** Huge, high-contrast code box (`BRO42`) with one-click **"Copy Invite Link"**.
- **The Two Slots:**
  - Player 1 Card: *"Abhay (Host) - Ready"*
  - Player 2 Card: Pulsing dashed card: *"Waiting for your bro to join..."*
- **Settings (Host only):** Series length selector: `[ First to 3 ]` `[ First to 5 ]`.

### 3.3 Game Selection Screen
- Displayed between rounds.
- Banner: *"Rahul is choosing the next game..."* (or *"Your pick!"*).
- Grid of game cards with clear icons, titles, and average duration:
  - `[ Tic Tac Toe ]` `~1m`
  - `[ Reaction Test ]` `~30s`
  - `[ Wordle ]` `~2m`
  - `[ Connect Four ]` `~2m`
  - `[ Minesweeper ]` `~2m`
  - `[ Chess ]` `~5m`

### 3.4 Active Game Screen
- Universal Match Header at top.
- Centered, distraction-free Game Viewport (responsive square/rectangle container).
- In-game interaction prompts (e.g., *"Your Turn"*, *"Opponent Thinking..."*).

### 3.5 Round Result Screen
- Immediate impact overlay:
  - *"Abhay wins Round 4!"*
  - Scoreboard flip animation (`2` ➔ `3`).
  - Next round countdown: *"Next game starting in 3... 2... 1..."*.

### 3.6 Match Champion Screen
- Bold celebration for series winner:
  - *"ABHAY WINS THE BRO V BRO!"*
  - Complete series round recap list.
  - Action buttons: `[ REMATCH ]` and `[ LEAVE ROOM ]`.
