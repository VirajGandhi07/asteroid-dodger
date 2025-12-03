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

  // Draw asteroids with rotation and color
  for (let a of asteroids) {
    ctx.save();
    
    // Move to asteroid center for rotation
    const centerX = a.x + a.size / 2;
    const centerY = a.y + a.size / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(a.rotation);
    
    // Draw asteroid with color and shadow effect
    if (asteroidImg.complete) {
      ctx.filter = `drop-shadow(0 0 8px rgba(139, 115, 85, 0.6))`;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(asteroidImg, -a.size / 2, -a.size / 2, a.size, a.size);
    } else {
      // Fallback: draw colored polygon
      ctx.fillStyle = a.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = a.size / 2 * (0.7 + Math.random() * 0.3);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.restore();
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