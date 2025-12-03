// Asteroids module: manages asteroid array, spawning, updating, and reset

import {
  ASTEROID_MIN_SIZE,
  ASTEROID_SIZE_VARIATION,
  ASTEROID_SPEED_BASE,
  ASTEROID_SPEED_VARIATION,
  ASTEROID_SPEED_GROWTH,
  TIME_SCALE
} from './config.js';

export const asteroids = []; // Array of active asteroids

// Create and add a new asteroid with random size, position, speed, rotation, and color
export function spawnAsteroid(canvasWidth, canvasHeight, elapsedTime) {
  const size = Math.random() * ASTEROID_SIZE_VARIATION + ASTEROID_MIN_SIZE;
  const y = Math.random() * (canvasHeight - size);
  const speed = Math.random() * ASTEROID_SPEED_VARIATION + ASTEROID_SPEED_BASE + elapsedTime * ASTEROID_SPEED_GROWTH;
  const rotation = Math.random() * Math.PI * 2;
  const rotationSpeed = (Math.random() - 0.5) * 0.1; // Random rotation speed
  const colors = ['#8B7355', '#A0A0A0', '#696969', '#CD853F', '#A9A9A9']; // Rock colors
  const color = colors[Math.floor(Math.random() * colors.length)];

  asteroids.push({ x: canvasWidth + size, y, size, speed, rotation, rotationSpeed, color });
}

export function updateAsteroids(deltaTime) {
  // Move asteroids left based on speed and deltaTime
  for (let asteroid of asteroids) {
    asteroid.x -= asteroid.speed * TIME_SCALE * deltaTime;
    asteroid.rotation += asteroid.rotationSpeed; // Update rotation
  }

  // Remove asteroids that have moved off-screen
  for (let i = asteroids.length - 1; i >= 0; i--) {
    if (asteroids[i].x + asteroids[i].size <= 0) asteroids.splice(i, 1);
  }
}

 // Clear all asteroids
export function resetAsteroids() {
  asteroids.length = 0;
}