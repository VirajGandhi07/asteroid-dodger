// Game module: owns game state, loop, and orchestration
export default function createGame(deps) {
  const {
    canvas,
    ctx,
    player,
    playerUpdate,
    asteroids,
    spawnAsteroid,
    updateAsteroids,
    updateStars,
    isColliding,
    getAsteroidSpawnInterval,
    render,
    bgMusic,
    explosionSound,
    getMuted,
    stars
  } = deps;

  let highScore = Number(localStorage.getItem('highScore')) || 0; // Track high score
  let gameStarted = false; // Game started flag
  let gameOver = false;    // Game over flag
  let paused = false;      // Pause flag
  let elapsedTime = 0;     // Time survived
  let lastTime = Date.now(); // Last frame timestamp
  let asteroidSpawnTimer = 0; // Timer for asteroid spawning
  let rafId = null;        // RequestAnimationFrame ID

  function update(deltaTime) {
    if (gameOver || paused || !gameStarted) return; // Skip update if not active
    elapsedTime += deltaTime; // Increase survival time

    playerUpdate(gameOver, canvas.height); // Move player

    if (typeof updateStars === 'function') updateStars(deltaTime); // Move stars

    updateAsteroids(deltaTime); // Move asteroids

    // Check collisions
    for (let a of asteroids) {
      if (isColliding(player, a)) {
        gameOver = true;

        explosionSound.currentTime = 0; // Play explosion
        explosionSound.volume = getMuted() ? 0 : bgMusic.volume;
        explosionSound.play();

        bgMusic.pause();               // Stop background music
        bgMusic.currentTime = 0;
        break;
      }
    }

    // Update high score
    if (elapsedTime > highScore) {
      highScore = elapsedTime;
      localStorage.setItem('highScore', highScore);
    }

    // Spawn new asteroids if interval reached
    asteroidSpawnTimer += deltaTime;
    if (asteroidSpawnTimer >= getAsteroidSpawnInterval(elapsedTime)) {
      spawnAsteroid(canvas.width, canvas.height, elapsedTime);
      asteroidSpawnTimer = 0;
    }
  }

  function loop() {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000; // Seconds elapsed
    lastTime = now;

    update(deltaTime); // Update game state

    render(ctx, canvas, player, asteroids, deps.rocketImg, deps.asteroidImg, { // Draw everything
      elapsedTime,
      highScore,
      gameStarted,
      gameOver,
      paused,
      stars
    });

    rafId = requestAnimationFrame(loop); // Next frame
  }

  function start() {
    if (gameStarted) return; // Only start once
    gameStarted = true;
    lastTime = Date.now();
    rafId = requestAnimationFrame(loop); // Start loop
    if (!bgMusic.started) { // Play background music
      bgMusic.play().catch(() => {});
      bgMusic.started = true;
    }
  }

  function restart() {
    asteroids.length = 0;                   // Clear asteroids
    player.y = canvas.height / 2 - 20;      // Reset player position
    gameOver = false; paused = false;       // Reset state
    elapsedTime = 0; lastTime = Date.now(); // Reset timers
    asteroidSpawnTimer = 0;
    highScore = Number(localStorage.getItem('highScore')) || 0; // Reload high score
    bgMusic.currentTime = 0; bgMusic.play(); // Restart music
  }

  function togglePause() {
    paused = !paused;           // Toggle pause
    if (paused) bgMusic.pause(); else bgMusic.play(); // Music sync
  }

  function pause() { if (!paused) { paused = true; bgMusic.pause(); } } // Pause game
  function resume() { if (paused) { paused = false; bgMusic.play(); } } // Resume game

  function isGameOver() { return gameOver; } // Check game over
  function isStarted() { return gameStarted; } // Check started

  function resetHighScore() {
    highScore = 0;
    localStorage.setItem('highScore', 0); // Clear saved high score
  }

  return {
    start,
    restart,
    togglePause,
    pause,
    resume,
    isGameOver,
    isStarted,
    resetHighScore,
    getState() { return { gameOver, paused, elapsedTime, highScore }; } // Expose state
  };
}