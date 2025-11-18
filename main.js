import { bgMusic, explosionSound, initAudio, getMuted } from './audio.js';
import { player, initPlayer, updatePlayer as playerUpdate } from './player.js';
import { asteroids, spawnAsteroid, updateAsteroids } from './asteroids.js';
import initUI from './ui.js';
import { draw as renderDraw } from './renderer.js';
import { isColliding, getAsteroidSpawnInterval } from './utils.js';
import createGame from './game.js';
import { STAR_COUNT, STAR_SPEED, PLAYER_SCALE } from './config.js';

let ui = null;
// Track whether opening instructions caused a pause so we only resume when appropriate
let instructionsPausedByUI = false;

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
// Initialize player input and position (game callbacks wired after game is created)

// Player is provided by `player.js`; ensure it's initialized

// Auto-scale rocket when loaded
rocketImg.onload = () => {
  player.width = rocketImg.width * PLAYER_SCALE;
  player.height = rocketImg.height * PLAYER_SCALE;
};

// Asteroids are managed by `asteroids.js`

// Stars for background
let stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2
  });
}

// Game is handled by `game.js`
let game = null;

// Update stars
function updateStars(deltaTime) {
  for (let star of stars) {
    star.x -= STAR_SPEED * deltaTime;
    if (star.x < 0) star.x = canvas.width;
  }
}

// Initialize UI (wires DOM handlers) with callbacks into game logic
// Create and initialize game module with required dependencies
game = createGame({
  canvas,
  ctx,
  player,
  playerUpdate,
  updateStars,
  asteroids,
  spawnAsteroid,
  updateAsteroids,
  isColliding,
  getAsteroidSpawnInterval,
  render: renderDraw,
  rocketImg,
  asteroidImg,
  bgMusic,
  explosionSound,
  getMuted,
  stars
});

// Initialize player input and position with game callbacks
initPlayer({
  isGameStarted: () => game.isStarted(),
  isGameOver: () => game.isGameOver(),
  onRestart: () => game.restart(),
  onTogglePause: () => game.togglePause()
});

// Initialize UI (wires DOM handlers) with callbacks into game logic
ui = initUI({
  getGameStarted: () => game.isStarted(),
  getGameOver: () => game.isGameOver(),
  onTogglePause: () => game.togglePause(),
  onRestart: () => game.restart(),
  onResetHighScore: () => {
    game.resetHighScore && game.resetHighScore();
    renderDraw(ctx, canvas, player, asteroids, rocketImg, asteroidImg, Object.assign(game.getState(), { stars }));
  },
  onPauseForInstructions: () => {
    // Pause the game and audio when opening instructions, but only if the game was running.
    if (game.isStarted() && !game.getState().paused) {
      game.pause();
      instructionsPausedByUI = true;
      if (ui && ui.setPauseButtonText) ui.setPauseButtonText('Resume Game');
      bgMusic.pause();
    } else {
      instructionsPausedByUI = false;
    }
  },
  onCloseInstructions: () => {
    // Resume game/audio only if UI paused it when opening instructions
    if (instructionsPausedByUI) {
      game.resume();
      instructionsPausedByUI = false;
      if (ui && ui.setPauseButtonText) ui.setPauseButtonText('Pause Game');
      if (game.isStarted()) bgMusic.play();
    }
  },
  onStartGame: () => {
    game.start();
  }
});

// Start game loop (game.start() will be called by UI when Start pressed)