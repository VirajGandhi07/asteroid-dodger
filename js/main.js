import { bgMusic, explosionSound, initAudio, getMuted } from './audio.js';
import { player, initPlayer, updatePlayer as playerUpdate } from './player.js';
import { asteroids, spawnAsteroid, updateAsteroids } from './asteroids.js';
import initUI from './ui.js';
import { draw as renderDraw } from './renderer.js';
import { isColliding, getAsteroidSpawnInterval } from './utils.js';
import createGame from './game.js';
import { STAR_COUNT, STAR_SPEED, PLAYER_SCALE } from './config.js';
import * as api from './api.js';
import { setGameInstance, startGame, onGameOver as menuOnGameOver, updateAdminMenuVisibility } from './menu.js';
import { initializeLoginForm, addLogoutToMenu } from './login.js';
import * as auth from './auth.js';

let ui = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load rocket image
const rocketImg = new Image();
rocketImg.src = "images/rocket1.png";

// Load asteroid image
const asteroidImg = new Image();
asteroidImg.src = "images/asteroid1.png";

initAudio();

// Auto-scale rocket when loaded
rocketImg.onload = () => {
  player.width = rocketImg.width * PLAYER_SCALE;
  player.height = rocketImg.height * PLAYER_SCALE;
};

// Stars for background
let stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2
  });
}

let game = null;

function updateStars(deltaTime) {
  for (let star of stars) {
    star.x -= STAR_SPEED * deltaTime;
    if (star.x < 0) star.x = canvas.width;
  }
}

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
  stars,
  onGameOver: (score) => {
    menuOnGameOver(score);
  }
});

// Register game with menu system
setGameInstance(game);

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
  getGameState: () => game.getState(),
  onTogglePause: () => game.togglePause(),
  onPause: () => game.pause(),
  onResume: () => game.resume(),
  onRestart: () => game.restart(),
  onReturnToMenu: () => {
    // Stop the game without saving score
    game.pause();
    // Hide game elements
    const gameCanvas = document.getElementById('gameCanvas');
    const gameButtons = document.getElementById('gameButtons');
    const volumeControls = document.getElementById('volumeControls');
    if (gameCanvas) gameCanvas.style.display = 'none';
    if (gameButtons) gameButtons.style.display = 'none';
    if (volumeControls) volumeControls.style.display = 'none';
    // Show main menu
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
      mainMenu.classList.add('active');
      // Update admin visibility
      updateAdminMenuVisibility();
    }
  },
  onPauseForInstructions: () => {
    if (game.isStarted() && !game.getState().paused) {
      game.pause();
      if (ui && ui.setPauseButtonText) ui.setPauseButtonText('Resume Game');
      bgMusic.pause();
    }
  },
  onCloseInstructions: () => {
    if (game.isStarted() && game.getState().paused) {
      game.resume();
      if (ui && ui.setPauseButtonText) {
        ui.setPauseButtonText('Pause Game');
      }
      if (game.isStarted()) bgMusic.play();
    }
  },
  onStartGame: () => {
    game.start();
  }
});

// Expose callback to window for menu.js to call when closing instructions during gameplay
window.onCloseInstructionsFromMenu = () => {
  if (game.isStarted() && game.getState().paused) {
    game.resume();
    if (ui && ui.setPauseButtonText) {
      ui.setPauseButtonText('Pause Game');
    }
    if (game.isStarted()) bgMusic.play();
  }
};

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
  initializeLoginForm();
  updateAdminMenuVisibility();
  
  // Add logout button to menu if user is authenticated
  if (auth.isAuthenticated()) {
    setTimeout(() => addLogoutToMenu(), 500);
  }
});

// Handle logout action
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (btn && btn.dataset.action === 'logout') {
    auth.logout();
    window.location.reload();
  }
});

// Start with menu system
startGame();