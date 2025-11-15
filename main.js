// Get high score as number
let highScore = Number(localStorage.getItem("highScore")) || 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load rocket image
const rocketImg = new Image();
rocketImg.src = "images/rocket1.png";

// Load asteroid image
const asteroidImg = new Image();
asteroidImg.src = "images/asteroid1.png";

// Player (temp size before image loads)
const player = {
  x: 50,
  y: canvas.height / 2 - 20,
  width: 60,
  height: 40,
  speed: 3
};

// Auto-scale rocket when loaded
rocketImg.onload = () => {
  const scale = 0.15;
  player.width = rocketImg.width * scale;
  player.height = rocketImg.height * scale;
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
let elapsedTime = 0;

// Key tracking
let keys = {};

// Timing
let lastTime = Date.now();
let asteroidSpawnTimer = 0;
const asteroidSpawnInterval = 1;

// Key listeners
document.addEventListener('keydown', e => {
  keys[e.key] = true;

  if (gameOver && e.key.toLowerCase() === 'r') restartGame();

  if (!gameOver && e.key.toLowerCase() === 'p') {
    paused = !paused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = paused ? "Resume Game" : "Pause Game";
  }
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// Spawn asteroid
function spawnAsteroid() {
  const size = Math.random() * 30 + 20;
  const y = Math.random() * (canvas.height - size);
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
    star.x -= 50 * deltaTime;
    if (star.x < 0) star.x = canvas.width;
  }
}

// Update everything
function update(deltaTime) {
  if (gameOver || paused) return;

  elapsedTime += deltaTime;

  updatePlayer();
  updateStars(deltaTime);

  for (let asteroid of asteroids) {
    asteroid.x -= asteroid.speed * 60 * deltaTime;
  }

  asteroids = asteroids.filter(a => a.x + a.size > 0);

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
      // Explosion removed
    }
  }

  // High score update
  if (elapsedTime > highScore) {
    highScore = elapsedTime;
    localStorage.setItem("highScore", highScore);
  }

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

  // Draw rocket only if game is not over
  if (!gameOver && rocketImg.complete) {
    ctx.drawImage(rocketImg, player.x, player.y, player.width, player.height);
  }

  // Draw asteroids
  for (let a of asteroids) {
    ctx.drawImage(asteroidImg, a.x, a.y, a.size, a.size);
  }

  // UI
  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Time: ${elapsedTime.toFixed(1)}s`, 10, 30);

  ctx.fillStyle = 'yellow';
  ctx.fillText(`High Score: ${highScore.toFixed(1)}s`, 10, 60);

  // Game over text
  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px sans-serif';
    ctx.fillText('Game Over!', canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press R to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
  }

  // Pause text
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

  requestAnimationFrame(gameLoop);
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
}

// Buttons
document.getElementById('pauseBtn').addEventListener('click', () => {
  if (!gameOver) {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume Game" : "Pause Game";
  }
});

document.getElementById('newGameBtn').addEventListener('click', restartGame);

document.getElementById('resetScoreBtn').addEventListener('click', () => {
  highScore = 0;
  localStorage.setItem("highScore", highScore);
  draw();
});

// Instructions modal
const instructionsBtn = document.getElementById('instructionsBtn');
const instructionsModal = document.getElementById('instructionsModal');
const closeInstructionsBtn = document.getElementById('closeInstructionsBtn');

instructionsBtn.addEventListener('click', () => {
  paused = true;
  pauseBtn.textContent = "Resume Game";
  instructionsModal.style.display = "flex";
});

closeInstructionsBtn.addEventListener('click', () => {
  instructionsModal.style.display = "none";
  paused = false;
  pauseBtn.textContent = "Pause Game";
});

// Start game loop
gameLoop();