# Asteroid Dodger

A small browser game where you pilot a rocket and dodge incoming asteroids. Built with modern ES modules, HTML5 Canvas, and vanilla JavaScript — easy to run locally and extend.

## Table of Contents
- [Demo](#demo)
- [Features](#features)
- [Quick Start](#quick-start)
- [Controls](#controls)
- [Project Structure](#project-structure)
- [Development Notes](#development-notes)
- [Testing / Smoke Checks](#testing--smoke-checks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Credits](#credits)

## Demo

Open `index.html` in a modern browser (or serve the folder with a static server) to play locally. For best results use Chrome, Firefox, or Edge with ES module support.

## Features

- Simple 2D gameplay using HTML5 Canvas
- Player movement and keyboard input handling
- Asteroid spawning with progressive difficulty
- High score persistence via `localStorage`
- Audio (background music + explosion), mute and volume controls
- Modular codebase using ES modules under `js/` for clarity

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/VirajGandhi07/asteroid-dodger.git
cd asteroid-dodger
```

2. Start a simple static server from the project root (recommended):

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

3. Open `http://localhost:8000` in a modern browser. The game entrypoint is `index.html` and it loads the ES module bundle from `js/main.js`.

Note: Directly opening `index.html` (file://) may work in some browsers, but serving via HTTP avoids CORS/import issues with ES modules.

## Controls

- Arrow Up: move rocket up
- Arrow Down: move rocket down
- P: pause / resume
- R: restart after Game Over
- On-screen buttons: Pause, New Game, Reset High Score, Instructions
- Volume buttons: Increase / Decrease / Mute

## Project Structure (key files)

- `index.html` — page and entry `<script type="module" src="js/main.js">`
- `css/` — project styling
- `images/` — rocket and asteroid images
- `sounds/` — audio assets (background and explosion)
- `js/` — ES modules (moved from root):
  - `main.js` — top-level orchestrator (initializes modules)
  - `audio.js` — audio setup and volume/mute controls
  - `player.js` — player state and keyboard handling
  - `asteroids.js` — asteroid spawn / update / reset
  - `renderer.js` — canvas drawing routines
  - `utils.js` — collision detection and spawn interval helper
  - `game.js` — game loop, state, pause/resume, high score
  - `config.js` — shared constants

## Development Notes

- The project uses native ES modules. `index.html` loads `js/main.js` as `type="module"`.
- Asset paths (images/sounds) are referenced relative to the page, so keep the served root at the repository root when running a server.
- Browser autoplay policy: background audio may require a user gesture (e.g., clicking Start) before playback begins. The code attempts to play audio on start and falls back safely.
- To modify game behavior, edit the modules under `js/` (they follow a separation of concerns pattern).

## Testing / Smoke Checks

Run the local server and perform these manual checks:

1. Visit http://localhost:8000 and confirm the page loads without 404s in DevTools (Console / Network).
2. Click Start — game should start and background music should attempt to play (user gesture may be required).
3. Use Arrow keys to move; asteroids should appear and move left.
4. Open the Instructions modal — game should pause and music should pause; closing should resume only if the UI paused it.
5. Mute / adjust volume using the controls and verify explosion sound and background obey the setting.

If anything fails, check the browser console for module resolution errors or missing asset 404s.

## Troubleshooting

- 404 for `js/main.js`: make sure `index.html` points to `js/main.js` and that you are serving from the repository root via HTTP.
- Audio not playing automatically: browser requires a user gesture; click Start or interact with the page to enable audio playback.
- Controls not responding: ensure the canvas has focus or click the page once so key events register.

## Contributing

Contributions welcome. Suggested workflow:

1. Fork the repo and create a branch for your change.
2. Make changes under `js/` and update `index.html` or assets as needed.
3. Test locally with `python3 -m http.server`.
4. Open a PR describing your changes.

If you'd like, I can also:
- Add unit tests for utility functions.
- Add a build script or bundler configuration (not required for this vanilla setup).

## Credits

Author: VirajGandhi07

This project started as a simple HTML5 Canvas demo and was refactored into modular ES modules for clarity.

---