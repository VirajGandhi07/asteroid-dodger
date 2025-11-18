// Asteroids module: manages asteroid array, spawning, updating, and reset

export const asteroids = [];

export function spawnAsteroid(canvasWidth, canvasHeight, elapsedTime) {
  const size = Math.random() * 30 + 20;
  const y = Math.random() * (canvasHeight - size);
  const speed = Math.random() * 2 + 2 + elapsedTime * 0.05;

  asteroids.push({ x: canvasWidth + size, y, size, speed });
}

export function updateAsteroids(deltaTime) {
  for (let asteroid of asteroids) {
    asteroid.x -= asteroid.speed * 60 * deltaTime;
  }

  // Remove off-screen asteroids (mutate array in-place)
  for (let i = asteroids.length - 1; i >= 0; i--) {
    if (asteroids[i].x + asteroids[i].size <= 0) asteroids.splice(i, 1);
  }
}

export function resetAsteroids() {
  asteroids.length = 0;
}
