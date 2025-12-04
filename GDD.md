# Asteroid Dodger — Game Design Document (GDD)

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Production Ready

---

## Purpose

This document describes the complete design and implementation of **Asteroid Dodger**, a full-stack browser-based 2D survival game with role-based access control, secure authentication, and persistent data storage. It serves as the definitive guide for development, testing, and future enhancements.

---

## Executive Summary

- **Genre:** 2D Survival / Dodger with Backend Integration
- **Platform:** Web (Modern Browsers with ES6 Module Support)
- **Tech Stack:** 
  - Frontend: HTML5 Canvas, CSS3, JavaScript ES6 Modules
  - Backend: ASP.NET Core 8.0, Entity Framework Core, SQLite
- **Architecture:** Full-stack application with RESTful API
- **Authentication:** Session-based with role-based access control (RBAC)
- **Scope:** Production-ready arcade game with admin management panel

---

## Design Goals

1. **Security First:** Implement secure authentication with session management
2. **Role Separation:** Clear distinction between admin and normal user experiences
3. **Fast & Responsive:** Immediate visual and audio feedback
4. **Modular Architecture:** Maintainable codebase with clear separation of concerns
5. **Data Persistence:** Reliable score tracking and player management
6. **User-Friendly:** Intuitive controls and clear visual design

---

## Target Audience

### Primary Users
- **Casual Gamers:** Looking for quick, engaging arcade gameplay
- **Normal Users:** Players who want to track their scores and improve
- **Administrators:** Game managers who need full control over data

### Secondary Users
- **Developers:** Learning full-stack game development
- **Students:** Studying modular JavaScript architecture and backend integration

---

## User Roles & Access Control

### 👑 Admin Users
**Capabilities:**
- Full game management and data control
- Player database management (CRUD operations)
- Asteroid configuration management
- Sample data generation for testing
- Access to all game features

**Menu Structure:**
```
Main Menu:
├── Play → Full Play Menu
│   ├── Existing Player
│   ├── New Player
│   ├── List of Players
│   └── Asteroids Management
├── Scoreboard
├── Generate Sample Data (Admin Only)
├── How to Play
└── Exit

Game Over Menu:
├── Play Again
├── Change Player (Admin Only)
├── New Player (Admin Only)
└── Back to Menu
```

### 👤 Normal Users
**Capabilities:**
- Play game with automatic profile creation
- View scoreboard
- Track personal scores
- Access instructions

**Menu Structure:**
```
Main Menu:
├── Play → Auto-start game
├── Scoreboard
├── How to Play
└── Exit

Game Over Menu:
├── Play Again
└── Back to Menu
```

**Auto-Play Feature:**
- Clicking "Play" immediately starts the game
- Uses the signup name as player name
- Player automatically created in database if not exists
- Scores automatically saved to their profile

---

## Core Gameplay Loop

### For Normal Users:
1. User logs in → Main menu appears
2. Click "Play" → Game starts immediately with user's name
3. Dodge asteroids → Score increases
4. Collision → Game over, score saved automatically
5. Choose "Play Again" or "Back to Menu"

### For Admin Users:
1. Admin logs in → Main menu with full options
2. Click "Play" → Play menu appears
3. Select player type (Existing/New) → Game starts
4. Dodge asteroids → Score increases
5. Collision → Game over with full management options
6. Can change player, create new, or return to menu

---

## Controls & Input

### Keyboard Controls
- **Arrow Up / W:** Move rocket up
- **Arrow Down / S:** Move rocket down
- **P:** Pause/Resume game
- **Esc:** Close instructions modal

### Mouse/Touch Controls
- **UI Buttons:** 
  - Start, Pause, Resume
  - Volume controls (Mute/Unmute)
  - Menu navigation buttons
  - Login/Signup forms

---

## Player Mechanics

### Movement
- Vertical movement only (up/down)
- Constrained within canvas boundaries
- Immediate response (no acceleration lag)
- Configurable speed constant
- Smooth animation frame updates

### Collision
- Pixel-perfect collision detection
- Immediate game over on asteroid hit
- Explosion sound effect plays
- Score saved to database automatically

---

## Asteroids & Obstacles

### Visual Design
- **Dynamic Rotation:** Each asteroid rotates at unique speed
- **Color Variation:** Random colors for visual distinction
- **Size Variance:** Multiple size categories
- **Drop Shadow:** Enhanced depth perception
- **Sprite/Fallback:** PNG images with polygon fallback

### Spawning System
- Spawn at canvas right edge
- Move left across screen
- Variable spawn intervals based on difficulty
- Speed increases with elapsed time
- Frequency scales with survival duration

### Difficulty Progression
```javascript
Spawn Interval = Base - (ElapsedTime * ScaleFactor)
Asteroid Speed = Base + (ElapsedTime * SpeedIncrease)
```

---

## Scoring System

### Score Calculation
- **Primary:** Time-based (seconds survived)
- **Display:** Real-time on HUD
- **Persistence:** Saved to SQLite database via API
- **High Score:** Tracked per player

### Score Submission
- Automatic on game over
- Associated with current player name
- Stored in `PlayerScore` table
- Retrievable via scoreboard

---

## Authentication System

### Session Management
- **Storage:** sessionStorage (cleared on refresh)
- **Security:** No persistent sessions across page loads
- **Auto-Logout:** On page refresh, tab close, or manual logout

### User Accounts
- **Storage:** localStorage for account data
- **Demo Account:** 
  ```
  Email: demo@test.com
  Password: demo123
  Role: Admin
  ```
- **Password Requirements:** Minimum 6 characters
- **Validation:** Email format, password confirmation

### Login Flow
```
Page Load → Session Check → Login Required
     ↓
Login Form → Validate → Create Session
     ↓
Main Menu → Role-Based Menu Visibility
     ↓
Game Access Based on Role
```

---

## Technical Architecture

### Frontend Modules (ES6)

| Module | Responsibility | Lines |
|--------|----------------|-------|
| `main.js` | System initialization, module orchestration | ~177 |
| `game.js` | Game loop, state management, pause/resume | ~250 |
| `player.js` | Player model, keyboard input, movement | ~120 |
| `asteroids.js` | Spawn system, updates, collision | ~180 |
| `renderer.js` | Canvas drawing, visual effects | ~220 |
| `audio.js` | Audio playback, volume controls | ~90 |
| `ui.js` | Button handlers, DOM events | ~100 |
| `menu.js` | Navigation, RBAC visibility | ~767 |
| `api.js` | Backend HTTP client | ~150 |
| `auth.js` | Authentication logic, session | ~128 |
| `login.js` | Login/signup handlers | ~182 |
| `utils.js` | Collision detection, helpers | ~80 |
| `config.js` | Constants, tuning parameters | ~50 |

### Backend Architecture

**ASP.NET Core 8.0 Web API**
```
Program.cs
├── Minimal API Endpoints
├── CORS Configuration
├── Entity Framework Core
└── SQLite Database

Data Layer:
├── GameDbContext (EF Core)
├── Entities: GamePlayer, PlayerScore, GameAsteroid, User
├── Services: EF_PlayerService, EF_AsteroidService
└── Migrations: Automatic schema management
```

---

## Runtime State Management

### Game State (`game.js`)
```javascript
{
  gameStarted: boolean,
  gameOver: boolean,
  paused: boolean,
  elapsedTime: number,
  score: number,
  highScore: number
}
```

### Player State (`player.js`)
```javascript
{
  x: number,
  y: number,
  width: number,
  height: number,
  speed: number,
  image: HTMLImageElement
}
```

### Asteroid State (`asteroids.js`)
```javascript
[
  {
    x: number,
    y: number,
    size: number,
    speed: number,
    rotation: number,        // NEW: Rotation angle
    rotationSpeed: number,   // NEW: Rotation velocity
    color: string,           // NEW: Random color
    image: HTMLImageElement
  }
]
```

---

## Data Persistence

### Frontend Storage
- **localStorage:** User accounts (email, password hash, isAdmin)
- **sessionStorage:** Current user session (cleared on refresh)

### Backend Database (SQLite)

**Tables:**
```sql
GamePlayers (Id, Name, CreatedAt)
PlayerScores (Id, PlayerId, PlayerName, Score, AchievedAt)
GameAsteroids (Id, Size, Speed, Material, Type, SpawnRate)
Users (Id, Name, Email, PasswordHash, IsAdmin)

Accessibility & UX
------------------
- Keyboard-first with visible alternate UI buttons.
- Instructions modal traps or returns focus; pause/resume behavior is explicit to avoid accidental resumes.

Mobile considerations
---------------------
- Desktop is primary focus. For mobile: add touch controls, scale UI, and reduce asset memory where needed.

Testing plan
------------
Manual tests:
- Start/Stop game flow
- Pause and Instructions modal behaviour (game pause/resume and audio state)
- Volume/mute controls and audio playback
- Keyboard controls (Up/Down/P/R)
- High score persistence

Unit-test candidates:
- `isColliding(player, asteroid)` — multiple geometric cases
- `getAsteroidSpawnInterval(elapsedTime)` — correct interval over time

Risk & mitigations
------------------
- Autoplay restrictions: play audio only after user gesture (Start). Catch and ignore play() promise rejections.
- Module loading: ES modules require HTTP serving. Document recommended local server (`python3 -m http.server`).

Roadmap & optional features
---------------------------
Short-term:
- Add UI polish and small tunings (pause button text, instructions pause guard).

Medium-term:
- Power-ups (shield, slow-time), new asteroid behaviors, difficulty tiers.
- Touch controls and responsive layout.
- Server-backed leaderboard (optional).

Long-term:
- PWA packaging or mobile wrapper.

Open questions
--------------
- Keep asteroid behavior simple or add diverse patterns (splitters, homers)?
- Server-backed leaderboard vs client-only high score?

Appendix — tuning & constants
----------------------------
- See `js/config.js` for star count, ASTEROID_* constants, TIME_SCALE, and PLAYER_SCALE.

Next actions
------------
- Expand any section into concrete tasks (e.g., create UI mockups, implement mobile controls, add unit tests), or request a backlog breakdown.
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
---

## User Interface Design

### HUD Elements (In-Game)
- **Top Left:** Current Score / Time Survived
- **Top Right:** High Score  
- **Bottom Right:** Pause Button, Volume Controls
- **Center (Paused):** "PAUSED" overlay text

### Menu System
- **Color Scheme:** Neon green (#0f0) on dark background
- **Overlays:** Semi-transparent modals
- **Buttons:** Hover glow effects, uppercase text
- **Responsive:** Adapts to window size

---

## Art & Audio Assets

### Visual Design
**Sprites:** Player ship, asteroids with rotation and color variation  
**Effects:** Drop shadows, starfield background  
**Color Palette:** Neon green primary, dark space background

### Audio System
- Background music loop
- Collision sound effects
- Volume controls with mute toggle
- Persistent volume settings

---

## API Endpoints

```
GET    /players              - List all players
POST   /players              - Create player
DELETE /players/{name}       - Delete player
POST   /players/{name}/score - Submit score
GET    /scores               - Get leaderboard
POST   /generate             - Generate sample data (admin)
```

---

## Future Enhancements

1. Power-ups (shields, slow-motion)
2. Multiple difficulty modes
3. Achievements system
4. Global leaderboards
5. Mobile touch controls
6. Multiplayer mode
7. Boss encounters
8. Enhanced visual effects
9. WebSocket real-time updates
10. Progressive Web App features

---

## Credits

**Developer:** VirajGandhi07  
**Repository:** https://github.com/VirajGandhi07/asteroid-dodger  
**Stack:** JavaScript ES6, ASP.NET Core 8.0, SQLite  
**License:** MIT

---

**Version 2.0 - December 4, 2025**
