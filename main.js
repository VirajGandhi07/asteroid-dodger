const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player object
const player = {
  x: 280,
  y: 350,
  width: 40,
  height: 40,
  speed: 5
};

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && player.x > 0) {
    player.x -= player.speed;
  } else if (e.key === 'ArrowRight' && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }
});

gameLoop();