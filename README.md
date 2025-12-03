# Asteroid Dodger

A complete 2D dodger game combining a vanilla JavaScript frontend with an ASP.NET Core backend API. Pilot your rocket to dodge incoming asteroids, track high scores, and manage player data through a RESTful API backed by SQLite.

**Status:** Full-stack implementation with browser-based game and REST API for data persistence.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Frontend – Browser Game](#frontend--browser-game)
- [Backend – ASP.NET Core API](#backend--aspnet-core-api)
- [API Documentation](#api-documentation)
- [Controls & Gameplay](#controls--gameplay)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

**Asteroid Dodger** is a full-stack web application:

- **Frontend:** HTML5 Canvas game with modular ES6 JavaScript, running on port 8000
- **Backend:** ASP.NET Core 8.0 Web API with Entity Framework Core and SQLite, running on port 5000
- **Database:** SQLite with EF migrations for players, scores, and asteroids management
- **Communication:** CORS-enabled JSON REST API

---

## Features

### Game Features
- ✅ Real-time 2D gameplay on HTML5 Canvas
- ✅ Responsive player controls (keyboard & mouse)
- ✅ Progressive difficulty scaling with survival time
- ✅ Audio system with background music and explosion effects
- ✅ Pause/Resume functionality
- ✅ Instructions modal overlay
- ✅ Volume and mute controls
- ✅ High score tracking (persistent)

### Backend Features
- ✅ RESTful API endpoints for players and asteroids
- ✅ Entity Framework Core with SQLite database
- ✅ Automatic player creation on first score post
- ✅ CRUD operations for player scores and asteroids
- ✅ Database migrations and schema management
- ✅ Legacy data migration from JSON file format
- ✅ CORS support for localhost development

---

## Quick Start

### Prerequisites
- **Node.js/Python** (for frontend HTTP server)
- **.NET 8.0 SDK** (for backend API)
- Modern browser with ES6 module support (Chrome, Firefox, Edge)

### 1. Clone & Navigate

```bash
git clone https://github.com/VirajGandhi07/asteroid-dodger.git
cd asteroid-dodger
```

### 2. Start the Backend API

```bash
cd DataManager/BackendApi

# Build the project (first time only)
dotnet build

# Run the API server (will run on http://localhost:5000)
dotnet run
```

The API will start and automatically:
- Create/migrate the SQLite database
- Seed legacy player data if found in `DataStorage/players.json`
- Listen on `http://localhost:5000`

### 3. Start the Frontend (New Terminal)

```bash
# From the asteroid-dodger root directory
python3 -m http.server 8000
```

Or use any static HTTP server:
```bash
# Alternative: using Node.js
npx http-server -p 8000
```

### 4. Play the Game

Open your browser and navigate to: **`http://localhost:8000`**

The game will automatically connect to the backend API at `http://localhost:5000`.

---

## Project Structure

```
asteroid-dodger/
├── index.html                 # Main game page
├── css/                       # Stylesheets
│   ├── main.css              # Master CSS (imports all)
│   ├── global.css
│   ├── buttons.css
│   ├── modal.css
│   ├── menu.css
│   ├── start-menu.css
│   ├── title.css
│   └── volume-controls.css
├── js/                        # ES6 module JavaScript
│   ├── main.js               # Entry point, initializes modules
│   ├── game.js               # Game loop and state management
│   ├── player.js             # Player model and keyboard input
│   ├── asteroids.js          # Asteroid spawn/update/collision
│   ├── renderer.js           # Canvas drawing and HUD
│   ├── audio.js              # Audio management
│   ├── ui.js                 # UI button handlers
│   ├── menu.js               # Menu system and event delegation
│   ├── api.js                # Frontend API client for backend
│   ├── utils.js              # Utility functions (collision, etc.)
│   └── config.js             # Game constants
├── images/                    # Game assets
│   ├── asteroid1.png
│   └── rocket1.png
├── sounds/                    # Audio assets
│   └── explosion-80108.mp3
├── DataManager/               # Backend .NET project
│   ├── BackendApi/           # Main ASP.NET Core API
│   │   ├── Program.cs        # API configuration and endpoints
│   │   ├── appsettings.json  # Settings (database, JWT, CORS)
│   │   ├── BackendApi.csproj # Project file
│   │   ├── Data/
│   │   │   ├── GameDbContext.cs        # Entity Framework context
│   │   │   ├── Migrations/             # EF migrations
│   │   │   ├── GamePlayer.cs           # Player entity
│   │   │   ├── PlayerScore.cs          # Score entity
│   │   │   ├── GameAsteroid.cs         # Asteroid entity
│   │   │   └── User.cs                 # User entity (for auth)
│   │   └── Services/
│   │       ├── EF_PlayerService.cs     # Player business logic
│   │       └── EF_AsteroidService.cs   # Asteroid business logic
│   ├── AsteroidManager/      # (Unused - legacy)
│   ├── GameLauncher/         # (Unused - legacy)
│   └── PlayerManager/        # (Unused - legacy)
├── DataStorage/              # Legacy JSON data
│   ├── players.json
│   └── asteroids.json
├── GDD.md                    # Game Design Document
└── README.md                 # This file
```

---

## Frontend – Browser Game

### Game Files (`js/`)

| File | Purpose |
|------|---------|
| `main.js` | Orchestrates initialization of all modules |
| `game.js` | Core game loop, state (started/paused/over), high score management |
| `player.js` | Player model, position, keyboard input handling |
| `asteroids.js` | Asteroid spawning, updates, collision tracking |
| `renderer.js` | Canvas drawing (player, asteroids, HUD, menus) |
| `audio.js` | Audio playback, volume/mute control |
| `ui.js` | Wires buttons to game callbacks |
| `menu.js` | Menu navigation and event delegation |
| `api.js` | HTTP client for communicating with backend |
| `utils.js` | Collision detection, spawn interval calculation |
| `config.js` | Tunable constants (speeds, timings, difficulty) |

### Key Game Features

**Controls:**
- ⬆️ Arrow Up: Move rocket up
- ⬇️ Arrow Down: Move rocket down
- **P**: Pause/Resume game
- **R**: Restart after Game Over
- **Buttons**: Pause, Instructions, Volume controls (on-screen)

**Gameplay:**
1. Game starts from menu when you click **Start**
2. Asteroids spawn randomly from the right and move left
3. Avoid collisions; your score increases with survival time
4. Difficulty increases as time progresses (faster asteroids, more spawns)
5. Collision triggers **Game Over** and plays explosion sound
6. High score is saved to `localStorage` and persists across sessions

**Audio:**
- Background music plays during gameplay
- Explosion sound on collision
- Mute and volume controls available
- Browser autoplay policy respected (user gesture required)

---

## Backend – ASP.NET Core API

### Technology Stack
- **Framework**: ASP.NET Core 8.0
- **Database**: SQLite with Entity Framework Core
- **ORM**: Entity Framework Core with code-first migrations
- **Serialization**: System.Text.Json
- **Authentication**: JWT (configured, partially implemented)

### Database Schema

**GamePlayer** (Players table)
```csharp
public int Id { get; set; }
public string Name { get; set; }  // Unique constraint
public DateTime CreatedAt { get; set; }
public DateTime UpdatedAt { get; set; }
public ICollection<PlayerScore> Scores { get; set; }  // One-to-many
```

**PlayerScore** (Scores table)
```csharp
public int Id { get; set; }
public int PlayerId { get; set; }
public int Score { get; set; }
public DateTime ScoredAt { get; set; }
public GamePlayer Player { get; set; }  // Foreign key
```

**GameAsteroid** (Asteroids table)
```csharp
public int Id { get; set; }
public float X { get; set; }
public float Y { get; set; }
public float VelocityX { get; set; }
public float VelocityY { get; set; }
public float Radius { get; set; }
public DateTime CreatedAt { get; set; }
```

---

## API Documentation

### Base URL
```
http://localhost:5000
```

### Headers
```
Content-Type: application/json
```

### Health & Status
```
GET /
```
Returns API status and version.

### Player Endpoints

**Get All Players**
```
GET /players
```
Get all players with their highest score.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Player1",
    "createdAt": "2025-12-03T10:00:00Z",
    "highScore": 1250,
    "scores": [...]
  }
]
```

---

**Create Player**
```
POST /players
Content-Type: application/json

{ "name": "NewPlayer" }
```

**Response:**
```json
{
  "id": 2,
  "name": "NewPlayer",
  "createdAt": "2025-12-03T11:00:00Z"
}
```

---

**Post Score**
```
POST /players/{name}/score
Content-Type: application/json

{ "score": 950 }
```
Automatically creates the player if they don't exist.

**Response:**
```json
{
  "message": "Score recorded",
  "player": { ... }
}
```

---

**Get Top Players**
```
GET /players/top?limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Player1",
    "highScore": 5000
  },
  ...
]
```

---

**Delete Player**
```
DELETE /players/{name}
```

**Response:**
```json
{ "message": "Player deleted" }
```

---

**Rename Player**
```
PUT /players/rename
Content-Type: application/json

{ "oldName": "OldPlayer", "newName": "NewPlayer" }
```

**Response:**
```json
{ "message": "Player renamed" }
```

---

### Asteroid Endpoints

**Get All Asteroids**
```
GET /asteroids
```

**Create Asteroid**
```
POST /asteroids
Content-Type: application/json

{ "x": 100, "y": 50, "velocityX": -5, "velocityY": 0, "radius": 20 }
```

**Delete Asteroid**
```
DELETE /asteroids/{id}
```

---

### CORS Policy
- **Allowed Origin**: `http://localhost:8000`
- **Allowed Methods**: GET, POST, PUT, DELETE
- **Allowed Headers**: `*`

### Error Responses

Standard HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Controls & Gameplay

### Keyboard Controls
| Key | Action |
|-----|--------|
| ⬆️ Arrow Up | Move rocket up |
| ⬇️ Arrow Down | Move rocket down |
| **P** | Pause / Resume |
| **R** | Restart game |

### UI Buttons
- **Start**: Launch the game
- **Pause**: Pause gameplay
- **Resume**: Resume paused game
- **Instructions**: Open game instructions
- **Volume**: Adjust sound volume
- **Mute**: Toggle sound mute
- **Reset**: Reset game state

### Game Flow

```
[Start Menu] 
    ↓
[Click Start]
    ↓
[Gameplay Active]
    ├─ Survive → Score increases
    ├─ Pause (P or button) → Game paused
    └─ Collision → Game Over
    ↓
[Game Over Screen]
    ├─ Score saved to backend
    ├─ High score updated
    └─ Press R to restart
```

---

## Architecture

### Frontend Architecture (MVC-ish)

**Separation of Concerns:**
- **Renderer** (`renderer.js`): Handles all canvas drawing
- **Game Logic** (`game.js`): Manages game state and loop
- **Entities** (`player.js`, `asteroids.js`): Model player and asteroid state
- **Audio** (`audio.js`): Isolated audio management
- **UI** (`ui.js`, `menu.js`): Event handling and user interactions
- **API** (`api.js`): All backend communication

**Data Flow:**
```
User Input (Keyboard/Mouse)
    ↓
Event Handlers (player.js, menu.js)
    ↓
Game State Updates (game.js)
    ↓
Physics & Collision (asteroids.js, utils.js)
    ↓
Render (renderer.js)
    ↓
Canvas Display
```

### Backend Architecture (Layered)

```
Program.cs (API Routes & Middleware)
    ↓
Services (Business Logic)
    ├─ EF_PlayerService
    └─ EF_AsteroidService
    ↓
Data Access (Entity Framework)
    ├─ GameDbContext
    └─ DbSets
    ↓
SQLite Database
```

**Dependency Injection:**
- Services are registered in `Program.cs`
- `GameDbContext` injected into services
- HTTP server configured with CORS and EF Core

---

## Development Setup

### Prerequisites
- **.NET 8.0 SDK** – [Download](https://dotnet.microsoft.com/download)
- **Python 3.6+** – For static server (or use Node.js alternative)
- **Git** – For cloning the repository
- **Visual Studio Code** or **Visual Studio** (optional)

### Backend Setup

```bash
cd DataManager/BackendApi

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build

# Run migrations (automatically runs on startup)
# Database created at: AsteroidDodger.db

# Start the API server
dotnet run
```

API will be available at: `http://localhost:5000`

### Frontend Setup

```bash
# From asteroid-dodger root
python3 -m http.server 8000
```

Frontend will be available at: `http://localhost:8000`

---

## Testing

### Manual Testing Checklist

**Frontend:**
- [ ] Game loads without 404 errors (check DevTools Console)
- [ ] Click "Start" → Game begins
- [ ] Arrow keys move player up/down
- [ ] Asteroids spawn and move
- [ ] Collision ends game
- [ ] Pause (P) → Game pauses, music stops
- [ ] Resume → Game resumes, music plays
- [ ] Instructions modal opens/closes
- [ ] Volume controls adjust sound
- [ ] High score persists after page refresh

**Backend:**
- [ ] API responds to `GET /` with health status
- [ ] Create player: `POST /players` with `{ "name": "Test" }`
- [ ] Get players: `GET /players` returns list
- [ ] Post score: `POST /players/TestPlayer/score` with `{ "score": 500 }`
- [ ] Check database: `AsteroidDodger.db` file created in `DataManager/BackendApi/`
- [ ] Verify CORS headers on API responses

**Integration:**
- [ ] Play game, die, score posts to backend
- [ ] Refresh page, check high score persists
- [ ] Create multiple players via game
- [ ] Verify player list updates in backend

### Automated Testing (Future)

Consider adding:
- Unit tests for collision detection (`utils.js`)
- API integration tests (xUnit for C#)
- E2E tests (Selenium/Cypress)

---

## Troubleshooting

### Frontend Issues

**Game doesn't load / 404 errors**
- Ensure you're serving from `http://localhost:8000` (not `file://`)
- Check browser console (F12 → Console) for errors
- Verify all `js/` files exist and CSS imports are correct

**Controls not responding**
- Click on the game canvas to ensure focus
- Check keyboard input in DevTools (console.log added to player.js)

**Audio not playing**
- Browsers require user gesture; click "Start" first
- Check browser autoplay policies (some browsers restrict autoplay)
- Verify `sounds/explosion-80108.mp3` exists

**API not connecting**
- Verify backend is running: `curl http://localhost:5000`
- Check CORS headers in browser DevTools (Network tab)
- Verify frontend is on `http://localhost:8000` (CORS whitelist)

### Backend Issues

**Database locked / migration fails**
```bash
# Kill any existing processes
pkill -f "dotnet"

# Delete old database and rebuild
rm AsteroidDodger.db
dotnet build
dotnet run
```

**Port 5000 already in use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or run on different port
dotnet run --urls "http://localhost:5001"
```

**Entity Framework migrations not applying**
```bash
# Force migration
dotnet ef database update

# Or recreate from scratch
dotnet ef database drop
dotnet ef database update
```

### API Issues

**CORS errors in browser**
- Verify `builder.Services.AddCors()` is configured correctly
- Check `AllowedOrigin = "http://localhost:8000"` in Program.cs
- Ensure `app.UseCors("LocalDev")` is called before `MapGet/MapPost`

**JSON serialization errors**
- Verify Entity Framework entities have proper `System.Text.Json` attributes
- Check Content-Type header is `application/json`

---

## Contributing

Contributions are welcome! Here's how to contribute:

### Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally (frontend & backend)
5. Commit with clear messages: `git commit -m "Add feature description"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### Areas for Contribution
- 🎮 Game balance and difficulty tuning
- 🎨 Visual enhancements and assets
- 🔊 Additional audio/sound effects
- 📱 Mobile/touch controls
- 🧪 Unit and E2E tests
- 📚 API documentation
- 🐛 Bug fixes and optimizations

### Guidelines
- Keep commits atomic and well-described
- Test your changes locally before submitting PR
- Follow existing code style (ES6 modules for JS, C# conventions for backend)
- Update relevant documentation

---

## Future Roadmap

### Short Term
- [ ] Add power-ups (shields, slow-time)
- [ ] Implement difficulty tiers
- [ ] Add touch controls for mobile
- [ ] Expand instructions/tutorial

### Medium Term
- [ ] User authentication (JWT login/register endpoints)
- [ ] Player leaderboard API
- [ ] Persistent user accounts
- [ ] Role-based access control

### Long Term
- [ ] Mobile app wrapper (PWA or Cordova)
- [ ] Multiplayer/competitive modes
- [ ] Advanced statistics and analytics
- [ ] Admin dashboard for content management

---

## License

This project is open source. Check the repository for license details.

---

## Credits

**Author:** VirajGandhi07

**Technologies Used:**
- HTML5 Canvas
- ES6 JavaScript Modules
- ASP.NET Core 8.0
- Entity Framework Core
- SQLite
- CSS3

**References:**
- Inspired by classic arcade dodger games
- Built as a learning project for full-stack web development

---

## Support

For issues, questions, or suggestions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review browser console for error messages
3. Open an issue on GitHub with:
   - Description of the problem
   - Steps to reproduce
   - Screenshots/error logs
   - Environment details (OS, browser, .NET version)

---

**Last Updated:** December 2025  
**Status:** Active Development
