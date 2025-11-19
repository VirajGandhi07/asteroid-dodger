// Shared configuration constants for Asteroid Dodger
export const STAR_COUNT = 100;
export const STAR_SPEED = 50; // pixels per second

export const PLAYER_SCALE = 0.15; // rocket image scale

// Asteroid size and speed configuration
export const ASTEROID_MIN_SIZE = 20;
export const ASTEROID_SIZE_VARIATION = 30; // size = random * variation + min
export const ASTEROID_SPEED_BASE = 2;
export const ASTEROID_SPEED_VARIATION = 2; // random * variation
export const ASTEROID_SPEED_GROWTH = 0.05; // per second

// Time scaling constant used when moving objects per-frame
export const TIME_SCALE = 60;