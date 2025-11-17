# Asteroid Dodger - Game Design Document

## Game Overview

**Title:** Asteroid Dodger  
**Genre:** 2D Dodger / Survival  
**Platform:** Web (HTML5, CSS, JavaScript)  
**Target Audience:** Casual gamers, anyone who enjoys simple browser games  

**Game Description:**  
Asteroid Dodger is a simple 2D game where the player controls a spaceship (or an object) to dodge falling asteroids. The longer the player survives, the higher the score.

---

## Gameplay Mechanics

**Controls:**  
- Arrow keys (`↑`, `↓`) to move the player.

**Objectives:**  
- Avoid asteroids falling from the top of the screen.  
- Survive as long as possible to maximize score.

**Scoring System:**  
- Score increases over time based on survival duration.  
- Optional: Extra points for narrowly avoiding asteroids (can be added in future versions).

**Game Over Conditions:**  
- The game ends when the player collides with an asteroid.

---

## Game World

**Environment:**  
- 2D canvas with a static background (space theme optional).  
- Asteroids spawn randomly from the top and move downward at increasing speed over time.

**Entities:**  
1. **Player** – The object controlled by the player.  
2. **Asteroids** – Obstacles that fall from the top of the screen.  
3. **Score Display** – Shows the current score in real-time.  

---

## Art & Audio

**Art Style:**  
- Simple 2D shapes (rectangles, circles) for prototype.  
- Optional: Pixel art or sprite images for player and asteroids.

**Audio:**  
- Background music.  
- Collision sound effects.

---

## Development

**Technologies:**  
- HTML5 Canvas – Rendering the game.  
- CSS – Basic styling.  
- JavaScript – Game logic and mechanics.

**Future Features (Optional):**  
- Power-ups (shields, slow motion).  
- Increasing difficulty over time.  
- Leaderboards for high scores.  
- Mobile touch controls.

---

## References

- Inspired by classic dodger-style games.
- Built using standard web technologies.