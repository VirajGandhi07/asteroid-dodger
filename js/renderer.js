// Renderer module: handles all canvas drawing
export function draw(ctx, canvas, player, asteroids, rocketImg, asteroidImg, state) {
  // state: { elapsedTime, highScore, gameStarted, gameOver, paused }
  const { elapsedTime, highScore, gameStarted, gameOver, paused } = state;

  // Draw stars
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  if (state.stars) {
    for (let star of state.stars) {
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  // Draw player rocket
  if (gameStarted && !gameOver && rocketImg.complete) {
    ctx.drawImage(rocketImg, player.x, player.y, player.width, player.height);
  }

  // Draw asteroids
  for (let a of asteroids) {
    ctx.drawImage(asteroidImg, a.x, a.y, a.size, a.size);
  }

  // UI info
  if (gameStarted) {
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Time: ${elapsedTime.toFixed(1)}s`, 10, 30);

    ctx.fillStyle = 'yellow';
    ctx.fillText(`High Score: ${highScore.toFixed(1)}s`, 10, 60);
  }

  // Game over
  if (gameOver) {
    ctx.save();
    ctx.fillStyle = '#0f0';
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 50px Trebuchet MS';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.shadowBlur = 10;
    ctx.font = '20px Trebuchet MS';
    ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 30);

    ctx.restore();
  }

  // Pause text
  if (paused && !gameOver && gameStarted) {
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.fillText('Paused', canvas.width / 2 - 50, canvas.height / 2);
  }
}