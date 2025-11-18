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

  let highScore = Number(localStorage.getItem('highScore')) || 0;

  let gameStarted = false;
  let gameOver = false;
  let paused = false;
  let elapsedTime = 0;

  let lastTime = Date.now();
  let asteroidSpawnTimer = 0;

  let rafId = null;

  function update(deltaTime) {
    if (gameOver || paused || !gameStarted) return;

    elapsedTime += deltaTime;

    // update player
    playerUpdate(gameOver, canvas.height);

    // update stars if provided
    if (typeof updateStars === 'function') updateStars(deltaTime);

    // asteroids
    updateAsteroids(deltaTime);

    // collision
    for (let a of asteroids) {
      if (isColliding(player, a)) {
        gameOver = true;

        // explosion
        explosionSound.currentTime = 0;
        explosionSound.volume = getMuted() ? 0 : bgMusic.volume;
        explosionSound.play();

        bgMusic.pause();
        bgMusic.currentTime = 0;
        break;
      }
    }

    // high score
    if (elapsedTime > highScore) {
      highScore = elapsedTime;
      localStorage.setItem('highScore', highScore);
    }

    asteroidSpawnTimer += deltaTime;
    if (asteroidSpawnTimer >= getAsteroidSpawnInterval(elapsedTime)) {
      spawnAsteroid(canvas.width, canvas.height, elapsedTime);
      asteroidSpawnTimer = 0;
    }
  }

  function loop() {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    update(deltaTime);

    // render via provided renderer
    render(ctx, canvas, player, asteroids, deps.rocketImg, deps.asteroidImg, {
      elapsedTime,
      highScore,
      gameStarted,
      gameOver,
      paused,
      stars
    });

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (gameStarted) return;
    gameStarted = true;
    lastTime = Date.now();
    rafId = requestAnimationFrame(loop);
    if (!bgMusic.started) {
      bgMusic.play().catch(() => {});
      bgMusic.started = true;
    }
  }

  function restart() {
    asteroids.length = 0;
    player.y = canvas.height / 2 - 20;
    gameOver = false;
    paused = false;
    elapsedTime = 0;
    lastTime = Date.now();
    asteroidSpawnTimer = 0;

    highScore = Number(localStorage.getItem('highScore')) || 0;

    bgMusic.currentTime = 0;
    bgMusic.play();
  }

  function togglePause() {
    paused = !paused;
    if (paused) bgMusic.pause();
    else bgMusic.play();
  }

  function pause() {
    if (!paused) {
      paused = true;
      bgMusic.pause();
    }
  }

  function resume() {
    if (paused) {
      paused = false;
      bgMusic.play();
    }
  }

  function isGameOver() { return gameOver; }
  function isStarted() { return gameStarted; }

  function resetHighScore() {
    highScore = 0;
    localStorage.setItem('highScore', 0);
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
    getState() { return { gameOver, paused, elapsedTime, highScore }; }
  };
}
