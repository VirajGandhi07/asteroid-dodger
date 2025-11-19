// Utility helpers for Asteroid Dodger

// Returns the spawn interval (seconds) based on elapsed time
export function getAsteroidSpawnInterval(elapsedTime) {
  return Math.max(0.2, 1 - elapsedTime * 0.02);
}

// Collision check between player (rocket) and an asteroid
export function isColliding(player, a) {
  const ax = a.x + a.size / 2;
  const ay = a.y + a.size / 2;
  const ar = a.size / 2;

  const rx = player.x + player.width * 0.25;
  const ry = player.y + player.height * 0.2;
  const rw = player.width * 0.5;
  const rh = player.height * 0.6;

  const rcx = rx + rw / 2;
  const rcy = ry + rh / 2;

  const dx = rcx - ax;
  const dy = rcy - ay;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const rocketRadius = Math.min(rw, rh) / 2;

  return distance < ar + rocketRadius;
}