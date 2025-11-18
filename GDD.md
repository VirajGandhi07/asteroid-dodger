# Asteroid Dodger — Game Design Document (GDD)

Version: 1.1
Last updated: 2025-11-18

Purpose
-------
This document describes the design and implementation plan for "Asteroid Dodger", a browser-based 2D survival/dodger game. It is written to guide development, testing, and future enhancements.

High-level summary
-------------------
- Genre: 2D Survival / Dodger
- Platform: Web (modern browsers with ES module support)
- Tech stack: HTML5 Canvas, CSS, JavaScript (ES modules)
- Scope: Lightweight, single-screen arcade experience with modular, maintainable code

Design goals
------------
- Fast, responsive controls with immediate feedback.
- Clear, focused gameplay loop: dodge, survive, improve.
- Small, modular codebase suitable for learning and extension.
- Graceful audio handling that honors browser autoplay policies.

Target audience
---------------
- Casual web gamers (desktop first, mobile-friendly later).
- Developers interested in small game architecture and modular JS.

Core gameplay loop
------------------
1. Player starts in the start menu.
2. Player presses Start → game begins, music attempts to play.
3. Asteroids spawn and move toward the player.
4. Player moves up and down to avoid collisions.
5. Surviving longer increases the score; difficulty gradually increases.
6. Collision triggers Game Over, sound effect plays, and high score is saved.

Controls & input
----------------
- Keyboard (primary):
  - Arrow Up / Arrow Down: move rocket up/down
  - P: pause/resume
  - R: restart after Game Over
- Mouse / Touch (UI): on-screen buttons for Start, Pause, Reset High Score, Instructions, Volume controls.

Player mechanics
----------------
- Player is constrained vertically inside the canvas.
- Movement is immediate (no complex acceleration) — configurable speed constant.

Asteroids & obstacles
---------------------
- Asteroids spawn at the canvas edge and move across the playfield.
- Spawning frequency and asteroid speed scale with elapsed time.
- Asteroids have a size variance; larger asteroids are easier to collide with.

Difficulty & progression
------------------------
- Difficulty curve is determined by spawn interval and asteroid speed.
- Both values gradually change over elapsed time using linear scaling or tunable curves.

Scoring
-------
- Score is primarily time-based (seconds survived).
- High score is persisted to `localStorage`.

User Interface (HUD)
-------------------
- Visible elements: current time/score, high score, pause button, volume controls.
- Start menu overlay and Instructions modal implemented as DOM elements over the canvas.

Art & audio
-----------
- Art style: pixel/sprite assets for rocket and asteroids with shape fallback; assets live in `images/`.
- Audio: background music and explosion SFX in `sounds/`.
- Audio module centralizes mute and volume controls and exposes `getMuted()`/`setMuted()`.

Technical architecture
----------------------
Modular ES modules separate responsibilities and keep the top-level `main.js` small.

Key modules (in `js/`):
- `main.js` — orchestrates initialization and wires modules.
- `game.js` — owns game state, RAF loop, update orchestration, pause/resume.
- `player.js` — player model, keyboard listeners, position update.
- `asteroids.js` — asteroid array management, spawn/update/reset.
- `renderer.js` — canvas drawing (stars, player, asteroids, HUD, overlays).
- `audio.js` — audio objects, initAudio(), setMuted/getMuted.
- `utils.js` — collision detection and spawn interval helper.
- `config.js` — constants and tuning parameters.

Runtime state
-------------
- `game.js` maintains: `gameStarted`, `gameOver`, `paused`, `elapsedTime`, `highScore`.
- Shared mutable lists/objects: `asteroids[]`, `player` object.

Persistence
-----------
- High score key stored in `localStorage` (e.g., `highScore`).

Accessibility & UX
------------------
- Keyboard-first with visible alternate UI buttons.
- Instructions modal traps or returns focus; pause/resume behavior is explicit to avoid accidental resumes.

Mobile considerations
---------------------
- Desktop is primary focus. For mobile: add touch controls, scale UI, and reduce asset memory where needed.

Testing plan
------------
Manual tests:
- Start/Stop game flow
- Pause and Instructions modal behaviour (game pause/resume and audio state)
- Volume/mute controls and audio playback
- Keyboard controls (Up/Down/P/R)
- High score persistence

Unit-test candidates:
- `isColliding(player, asteroid)` — multiple geometric cases
- `getAsteroidSpawnInterval(elapsedTime)` — correct interval over time

Risk & mitigations
------------------
- Autoplay restrictions: play audio only after user gesture (Start). Catch and ignore play() promise rejections.
- Module loading: ES modules require HTTP serving. Document recommended local server (`python3 -m http.server`).

Roadmap & optional features
---------------------------
Short-term:
- Add UI polish and small tunings (pause button text, instructions pause guard).

Medium-term:
- Power-ups (shield, slow-time), new asteroid behaviors, difficulty tiers.
- Touch controls and responsive layout.
- Server-backed leaderboard (optional).

Long-term:
- PWA packaging or mobile wrapper.

Open questions
--------------
- Keep asteroid behavior simple or add diverse patterns (splitters, homers)?
- Server-backed leaderboard vs client-only high score?

Appendix — tuning & constants
----------------------------
- See `js/config.js` for star count, ASTEROID_* constants, TIME_SCALE, and PLAYER_SCALE.

Next actions
------------
- Expand any section into concrete tasks (e.g., create UI mockups, implement mobile controls, add unit tests), or request a backlog breakdown.