import { bgMusic, explosionSound, initAudio, getMuted } from './audio.js';
import { player, initPlayer, updatePlayer as playerUpdate } from './player.js';
import { asteroids, spawnAsteroid, updateAsteroids, resetAsteroids } from './asteroids.js';
import initUI from './ui.js';
import { draw as renderDraw } from './renderer.js';

let ui = null;

// Get high score as number
let highScore = Number(localStorage.getItem("highScore")) || 0;
let gameStarted = false;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load rocket image
const rocketImg = new Image();
rocketImg.src = "images/rocket1.png";

// Load asteroid image
const asteroidImg = new Image();
asteroidImg.src = "images/asteroid1.png";
// Audio is handled in `audio.js` module; initialize controls
initAudio();
// Initialize player input and position
initPlayer({
  isGameStarted: () => gameStarted,
  isGameOver: () => gameOver,
  onRestart: () => restartGame(),
  onTogglePause: () => togglePause()
});

// Player is provided by `player.js`; ensure it's initialized

// Auto-scale rocket when loaded
rocketImg.onload = () => {
  const scale = 0.15;
  player.width = rocketImg.width * scale;
  player.height = rocketImg.height * scale;
};

// Asteroids are managed by `asteroids.js`

// Stars for background
let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2
  });
}

// Game state
let gameOver = false;
let paused = false;
let elapsedTime = 0;


// Timing
let lastTime = Date.now();
let asteroidSpawnTimer = 0;

function getAsteroidSpawnInterval() {
  return Math.max(0.2, 1 - elapsedTime * 0.02);
}

// Pause function
function togglePause() {
  paused = !paused;
  if (ui && ui.setPauseButtonText) ui.setPauseButtonText(paused ? "Resume Game" : "Pause Game");

  if (paused) bgMusic.pause();
  else bgMusic.play();
}

// Asteroid spawning/updating now handled by `asteroids.js`

// Update player (delegates to player module)
function updatePlayer() {
  playerUpdate(gameOver, canvas.height);
}

// Update stars
function updateStars(deltaTime) {
  for (let star of stars) {
    star.x -= 50 * deltaTime;
    if (star.x < 0) star.x = canvas.width;
  }
}

// Update everything
function update(deltaTime) {
  if (gameOver || paused || !gameStarted) return;

  elapsedTime += deltaTime;

  updatePlayer();
  updateStars(deltaTime);

  // Let asteroids module update positions and clean up off-screen ones
  updateAsteroids(deltaTime);

  // Collision detection
  for (let a of asteroids) {
    const ax = a.x + a.size / 2;
    const ay = a.y + a.size / 2;
    const ar = a.size / 2;

    const rx = player.x + player.width * 0.25;
    const ry = player.y + player.height * 0.2;
    const rw = player.width * 0.5;
    const rh = player.height * 0.6;

    const rcx = rx + rw / 2;
    const rcy = ry + rh / 2;

    const dx = rcx - ax;
    const dy = rcy - ay;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const rocketRadius = Math.min(rw, rh) / 2;

    if (distance < ar + rocketRadius) {
      gameOver = true;

      // Explosion sound
      explosionSound.currentTime = 0;
      explosionSound.volume = getMuted() ? 0 : bgMusic.volume;
      explosionSound.play();

      // Stop music
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  // High score update
  if (elapsedTime > highScore) {
    highScore = elapsedTime;
    localStorage.setItem("highScore", highScore);
  }

  asteroidSpawnTimer += deltaTime;
  if (asteroidSpawnTimer >= getAsteroidSpawnInterval()) {
    spawnAsteroid(canvas.width, canvas.height, elapsedTime);
    asteroidSpawnTimer = 0;
  }
}

// Rendering is handled by renderer.js

// Game loop
function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  update(deltaTime);
  renderDraw(ctx, canvas, player, asteroids, rocketImg, asteroidImg, {
    elapsedTime,
    highScore,
    gameStarted,
    gameOver,
    paused,
    stars
  });

  requestAnimationFrame(gameLoop);
}

// Restart game
function restartGame() {
  resetAsteroids();
  player.y = canvas.height / 2 - 20;
  gameOver = false;
  paused = false;
  elapsedTime = 0;
  lastTime = Date.now();
  asteroidSpawnTimer = 0;

  bgMusic.currentTime = 0;
  bgMusic.play();
}

// Initialize UI (wires DOM handlers) with callbacks into game logic
ui = initUI({
  getGameStarted: () => gameStarted,
  getGameOver: () => gameOver,
  onTogglePause: () => togglePause(),
  onRestart: () => restartGame(),
  onResetHighScore: () => {
    highScore = 0;
    localStorage.setItem('highScore', highScore);
    renderDraw(ctx, canvas, player, asteroids, rocketImg, asteroidImg, {
      elapsedTime,
      highScore,
      gameStarted,
      gameOver,
      paused,
      stars
    });
  },
  onPauseForInstructions: () => {
    paused = true;
    if (ui && ui.setPauseButtonText) ui.setPauseButtonText('Resume Game');
    bgMusic.pause();
  },
  onCloseInstructions: () => {
    paused = false;
    if (ui && ui.setPauseButtonText) ui.setPauseButtonText('Pause Game');
    if (gameStarted) bgMusic.play();
  },
  onStartGame: () => {
    gameStarted = true;
    if (!bgMusic.started) {
      bgMusic.play().catch(() => {});
      bgMusic.started = true;
    }
  }
});

// Start game loop (runs idle until gameStarted = true)
gameLoop();