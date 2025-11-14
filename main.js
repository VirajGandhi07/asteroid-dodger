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

// Game state
let startTime = null;
let gameOver = false;

// Spawn asteroid on right side
function spawnAsteroid() {
  const size = Math.random() * 30 + 20; // 20 to 50
  const y = Math.random() * (canvas.height - size);
  const speed = Math.random() * 2 + 2; // 2 to 4
  asteroids.push({ x: canvas.width + size, y, size, speed });
}

// Update positions
function update() {
  // Move asteroids left
  for (let asteroid of asteroids) {
    asteroid.x -= asteroid.speed;
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
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
  if (startTime !== null) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Time: ${elapsed}s`, 10, 30);
  }

  // Game Over
  if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px sans-serif';
    ctx.fillText('Game Over!', canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press R to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
  }
}

// Game loop
function gameLoop() {
  if (!startTime) startTime = Date.now();
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

// Player controls (up/down)
document.addEventListener('keydown', e => {
  if (!gameOver) {
    if (e.key === 'ArrowUp' && player.y > 0) player.y -= player.speed;
    else if (e.key === 'ArrowDown' && player.y + player.height < canvas.height) player.y += player.speed;
  }
  // Restart game
  if (gameOver && e.key === 'r') restartGame();
});

// Spawn asteroids every second
setInterval(() => {
  if (!gameOver) spawnAsteroid();
}, 1000);

// Restart game
function restartGame() {
  asteroids = [];
  player.y = canvas.height / 2 - 20;
  gameOver = false;
  startTime = null;
  gameLoop();
}

// Start game
gameLoop();