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

  let highScore = 0;
  let highScoreFetched = false;
  let gameStarted = false;
  let gameOver = false;
  let paused = false;
  let elapsedTime = 0;
  let lastTime = Date.now();
  let asteroidSpawnTimer = 0;
  let rafId = null;

  const onGameOver = deps.onGameOver;

  async function fetchGlobalHighScore() {
    if (highScoreFetched) return;
    try {
      const scores = await api.getTopScores();
      if (scores && scores.length > 0) {
        highScore = Math.max(...scores.map(s => s.highScore || 0));
        console.log('[Game] Loaded global high score:', highScore);
      }
      highScoreFetched = true;
    } catch (err) {
      console.warn('[Game] Could not fetch global high score:', err);
      highScoreFetched = true;
    }
  }

  function update(deltaTime) {
    if (gameOver || paused || !gameStarted) return;
    
    elapsedTime += deltaTime;
    playerUpdate(gameOver, canvas.height);
    if (typeof updateStars === 'function') updateStars(deltaTime);
    updateAsteroids(deltaTime);

    // Check collisions
    for (let a of asteroids) {
      if (isColliding(player, a)) {
        if (!gameOver) {
          gameOver = true;
          try { onGameOver && onGameOver(Math.round(elapsedTime)); } catch { }
        }

        explosionSound.currentTime = 0;
        explosionSound.volume = getMuted() ? 0 : bgMusic.volume;
        explosionSound.play();
        bgMusic.pause();
        bgMusic.currentTime = 0;
        break;
      }
    }

    // Spawn new asteroids
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
    asteroids.length = 0;
    player.y = canvas.height / 2 - 20;
    gameOver = false;
    paused = false;
    elapsedTime = 0;
    lastTime = Date.now();
    asteroidSpawnTimer = 0;
    highScoreFetched = false;
    fetchGlobalHighScore();
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

  return {
    start,
    restart,
    togglePause,
    pause,
    resume,
    isGameOver,
    isStarted,
    getState() { return { gameOver, paused, elapsedTime, highScore }; }
  };
}