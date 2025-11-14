// Get high score as number
let highScore = Number(localStorage.getItem("highScore")) || 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
  x: 50,
  y: canvas.height / 2 - 20,
  width: 40,
  height: 40,
  speed: 6
};

// Asteroids
let asteroids = [];

// Stars for background
let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 });
}

// Game state
let gameOver = false;
let paused = false;
let elapsedTime = 0; // in seconds

// Key tracking for smooth movement
let keys = {};

// Timing
let lastTime = Date.now();
let asteroidSpawnTimer = 0;
const asteroidSpawnInterval = 1; // seconds

// Event listeners
document.addEventListener('keydown', e => {
  keys[e.key] = true;

  if (gameOver && e.key.toLowerCase() === 'r') restartGame();
  if (!gameOver && e.key.toLowerCase() === 'p') {
    paused = !paused;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.textContent = paused ? "Resume Game" : "Pause Game";
  }
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// Spawn asteroid
function spawnAsteroid() {
  const size = Math.random() * 30 + 20;
  const y = Math.random() * (canvas.height - size);

  // Increase speed over time
  const speed = Math.random() * 2 + 2 + elapsedTime * 0.05;

  asteroids.push({ x: canvas.width + size, y, size, speed });
}

// Update player
function updatePlayer() {
  if (!gameOver) {
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y + player.height < canvas.height) player.y += player.speed;
  }
}

// Update stars
function updateStars(deltaTime) {
  for (let star of stars) {
    star.x -= 50 * deltaTime; // 50 px/sec
    if (star.x < 0) star.x = canvas.width;
  }
}

// Update everything
function update(deltaTime) {
  if (gameOver || paused) return;

  elapsedTime += deltaTime;

  updatePlayer();
  updateStars(deltaTime);

  // Move asteroids
  for (let asteroid of asteroids) {
    asteroid.x -= asteroid.speed * 60 * deltaTime;
  }

  // Remove off-screen asteroids
  asteroids = asteroids.filter(a => a.x + a.size > 0);

  // Collision detection
  for (let a of asteroids) {
    if (
      player.x < a.x + a.size &&
      player.x + player.width > a.x &&
      player.y < a.y + a.size &&
      player.y + player.height > a.y
    ) {
      gameOver = true;
    }
  }

  // Update high score
  if (elapsedTime > highScore) {
    highScore = elapsedTime;
    localStorage.setItem("highScore", highScore);
  }

  // Spawn asteroids
  asteroidSpawnTimer += deltaTime;
  if (asteroidSpawnTimer >= asteroidSpawnInterval) {
    spawnAsteroid();
    asteroidSpawnTimer = 0;
  }
}

// Draw stars
function drawStars() {
  ctx.fillStyle = 'white';
  for (let star of stars) {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStars();

  // Player
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Asteroids
  ctx.fillStyle = 'gray';
  for (let a of asteroids) {
    ctx.beginPath();
    ctx.arc(a.x + a.size / 2, a.y + a.size / 2, a.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Score
  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Time: ${elapsedTime.toFixed(1)}s`, 10, 30);

  // High Score
  ctx.fillStyle = 'yellow';
  ctx.font = '20px sans-serif';
  ctx.fillText(`High Score: ${highScore.toFixed(1)}s`, 10, 60);

  // Game Over
  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px sans-serif';
    ctx.fillText('Game Over!', canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press R to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
  }

  // Pause message
  if (paused && !gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.fillText('Paused', canvas.width / 2 - 50, canvas.height / 2);
  }
}

// Game loop
function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  update(deltaTime);
  draw();

  if (!gameOver) requestAnimationFrame(gameLoop);
}

// Restart game
function restartGame() {
  asteroids = [];
  player.y = canvas.height / 2 - 20;
  gameOver = false;
  paused = false;
  elapsedTime = 0;
  lastTime = Date.now();
  asteroidSpawnTimer = 0;
  gameLoop();
}

// Start game
gameLoop();

// Pause/Resume button
const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
  if (!gameOver) {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume Game" : "Pause Game";
  }
});

// New Game button
const newGameBtn = document.getElementById('newGameBtn');
newGameBtn.addEventListener('click', () => {
  restartGame();
});