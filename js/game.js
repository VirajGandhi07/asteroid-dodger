// Game module: owns game state, loop, and orchestration
import * as api from './api.js';

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

  let highScore = 0; // Global highest score across all players
  let highScoreFetched = false; // Track if we've fetched from DB
  let gameStarted = false; // Game started flag
  let gameOver = false;    // Game over flag
  let paused = false;      // Pause flag
  let elapsedTime = 0;     // Time survived
  let lastTime = Date.now(); // Last frame timestamp
  let asteroidSpawnTimer = 0; // Timer for asteroid spawning
  let rafId = null;        // RequestAnimationFrame ID

  // onGameOver(score) optional callback
  const onGameOver = deps.onGameOver;

  // Fetch global highest score from database (across all players)
  async function fetchGlobalHighScore() {
    if (highScoreFetched) return;
    try {
      const scores = await api.getTopScores();
      if (scores && scores.length > 0) {
        // Get the highest score from all players
        highScore = Math.max(...scores.map(s => s.highScore || 0));
        console.log('[Game] Loaded global high score:', highScore);
      }
      highScoreFetched = true;
    } catch (err) {
      console.warn('[Game] Could not fetch global high score:', err);
      highScoreFetched = true;  // Don't retry
    }
  }

  function update(deltaTime) {
    if (gameOver || paused || !gameStarted) return; // Skip update if not active
    elapsedTime += deltaTime; // Increase survival time

    playerUpdate(gameOver, canvas.height); // Move player

    if (typeof updateStars === 'function') updateStars(deltaTime); // Move stars

    updateAsteroids(deltaTime); // Move asteroids

    // Check collisions
    for (let a of asteroids) {
      if (isColliding(player, a)) {
        // mark game over and notify once
        if (!gameOver) {
          gameOver = true;

          try { onGameOver && onGameOver(Math.round(elapsedTime)); } catch { }
        }

        explosionSound.currentTime = 0; // Play explosion
        explosionSound.volume = getMuted() ? 0 : bgMusic.volume;
        explosionSound.play();

        bgMusic.pause();               // Stop background music
        bgMusic.currentTime = 0;
        break;
      }
    }

    // Note: highScore is now global across all players, fetched from DB
    // Individual scores are saved to DB via onGameOver callback

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
    // Fetch global high score before starting game
    fetchGlobalHighScore().then(() => {
      if (!gameStarted) {
        gameStarted = true;
        lastTime = Date.now();
        rafId = requestAnimationFrame(loop);
        if (!bgMusic.started) {
          bgMusic.play().catch(() => {});
          bgMusic.started = true;
        }
      }
    }).catch(() => {
      // Even if fetch fails, start the game
      if (!gameStarted) {
        gameStarted = true;
        lastTime = Date.now();
        rafId = requestAnimationFrame(loop);
        if (!bgMusic.started) {
          bgMusic.play().catch(() => {});
          bgMusic.started = true;
        }
      }
    });
  }

  function restart() {
    asteroids.length = 0;                   // Clear asteroids
    player.y = canvas.height / 2 - 20;      // Reset player position
    gameOver = false; paused = false;       // Reset state
    elapsedTime = 0; lastTime = Date.now(); // Reset timers
    asteroidSpawnTimer = 0;
    highScoreFetched = false;  // Refetch high score on restart
    fetchGlobalHighScore();     // Reload global high score from database
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