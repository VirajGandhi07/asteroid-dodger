// Player module: exports `player`, `initPlayer`, and `updatePlayer`.

export const player = {
  x: 50,
  y: 0,
  width: 60,
  height: 40,
  speed: 3
};

// Internal key state
const keys = {};

let callbacks = {
  isGameStarted: () => true,
  isGameOver: () => false,
  onRestart: () => {},
  onTogglePause: () => {}
};

export function initPlayer(opts = {}) {
  callbacks = Object.assign(callbacks, opts);

  // Initialize player.y based on canvas height if available
  const canvas = document.getElementById('gameCanvas');
  if (canvas) player.y = canvas.height / 2 - 20;

  document.addEventListener('keydown', e => {
    keys[e.key] = true;

    if (!callbacks.isGameStarted()) return;

    if (callbacks.isGameOver() && e.key.toLowerCase() === 'r') callbacks.onRestart();

    if (!callbacks.isGameOver() && e.key.toLowerCase() === 'p') callbacks.onTogglePause();
  });

  document.addEventListener('keyup', e => {
    keys[e.key] = false;
  });
}

// Update player position — keep function pure relative to passed state
export function updatePlayer(gameOver, canvasHeight) {
  if (gameOver) return;

  if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
  if (keys['ArrowDown'] && player.y + player.height < canvasHeight) player.y += player.speed;
}