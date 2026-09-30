# UI & Design System Direction — Bro v Bro

## 1. Visual Target & Core Personality

> **“A forgotten pixel-art game from the late 90s / early 2000s that somehow became a modern multiplayer website.”**

Bro v Bro is not a generic modern esports dashboard with a pixel font slapped on top, nor is it a neon purple cyberpunk UI. It is designed to feel like a small, weird, handcrafted game world—combining old Flash gaming websites, Game Boy / SNES / arcade title screens, and early internet personal web experiments.

### The Golden Ratio:
- **70% Clean, readable modern web layout** (usable spacing, responsive structure, clear buttons)
- **30% Handcrafted pixel-art & retro game personality** (hero illustrations, characters, decorative cables/cartridges, arcade scoreboards, CRT textures)

---

## 2. Color System: Warm Cream Foundation & High Contrast

Move away from full dark-mode palettes. The primary foundation is a warm, crisp paper surface with high-contrast dark ink and intentional dark navy visual blocks:

```text
PRIMARY BACKGROUND:
  Warm Paper Cream: #F4EBD0 / #FFF7DC (Main page canvas)

PRIMARY INK & BORDERS:
  Deep Ink Black:   #171A1F (Text, borders, crisp hard shadows)

DARK NAVY (Intentional blocks only):
  Cabinet Navy:     #18243A (Header bar, arcade scene interior, match view)
  Muted Slate:      #24334E (Floors, controls, tile grids)

ACCENT PALETTE (1–2 per section):
  Arcade Red:       #E84B4B
  Cartridge Yellow: #F4D35E
  CRT Cyan:         #42B8C7
  GameBoy Green:    #69B85A
  Pixel Pink:       #E95A8A
```

---

## 3. Typography Architecture

### Headings & Arcade Scores
- **Fonts:** `'Press Start 2P'`, `'Silkscreen'`
- **Role:** Major titles (`BRO V BRO`), round counters, victory declarations, big score numbers (`04 — 02`), game titles.
- **Traits:** Chunky, blocky, square, strong silhouette, authentic bitmap feel.

### Body Text & Interactive UI
- **Fonts:** `'Space Mono'`, `'JetBrains Mono'`, clean monospace / grotesk
- **Role:** Button labels, descriptions, room codes, player names, instructions, system messages.
- **Rule:** Never use pixel bitmap fonts for long paragraphs. Legibility is paramount.

---

## 4. Texture & Retro Atmosphere

- **Subtle Scanlines:** Delicate CRT scanlines on active game containers and mini-screens (`background-size: 100% 4px`).
- **Dithered Pixel Patterns:** Subtle 2x2 checkerboard pixel shading on cards and headers.
- **Offset Block Shadows:** Chunky `3px 3px 0px #111522` and `4px 4px 0px #111522` drop shadows instead of fuzzy modern blur filters.
- **Handcrafted Separators:** Custom dashed or dithered pixel dividers (`+ - + - +`).

---

## 5. Pixel Art World & Characters

The universe features two signature pixel characters:
- **Bro 01:** Red / Cyan accented pixel character (idle bobbing, competitive pose).
- **Bro 02:** Yellow / Green accented pixel challenger (blinking, ready pose).

### Environmental Props:
- Mini desktop CRT monitors with flickering screen pixels
- Floor cables connecting game cartridges to arcade cabinets
- Floating pixel stars (`★`), plus marks (`+`), and tiny hearts
- Potted pixel desktop plants / cacti

---

## 6. Component Specs

### 6.1 Pixel Button
- Rectangular with crisp 2px solid border (`#111522` or `#F4EFD9`).
- Deep offset shadow (`3px 3px 0 #111522`).
- Hover state: Slight translate (`translate(-1px, -1px)`) with pixel cursor arrow (`> `) appearing before the label.
- Active state: Pressed translate (`translate(2px, 2px)` with shadow collapsing to `1px 1px 0`).

### 6.2 Scoreboard
- Prominent arcade score numbers (`04` vs `03`).
- Win indicator stars (`★ ★ ★ ★` vs `★ ★ ★`).
- Clean separation between active round indicator and game canvas.

### 6.3 Microcopy
- Playful, personal, peer-to-peer banter:
  - *"ROOM READY."* (not "Session created")
  - *"WAITING FOR YOUR BRO..."* (not "Waiting for second player to connect")
  - *"YOUR BRO GOT COOKED."* (not "Opponent defeated")
  - *"HE RAN AWAY."* (not "Connection timeout")
