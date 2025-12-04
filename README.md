# Asteroid Dodger

A full-stack 2D space survival game featuring role-based access control, secure authentication, and real-time gameplay. Pilot your rocket through an asteroid field while the game tracks your performance through a complete ASP.NET Core backend with SQLite persistence.

**Status:** Production-ready full-stack application with secure authentication, admin controls, and persistent data storage.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Authentication & Security](#authentication--security)
- [User Roles](#user-roles)
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

**Asteroid Dodger** is a complete full-stack web application featuring:

- **Frontend:** Modular ES6 JavaScript game with HTML5 Canvas rendering (Port 8000)
- **Backend:** ASP.NET Core 8.0 Web API with Entity Framework Core (Port 5000)
- **Database:** SQLite with automatic migrations
- **Authentication:** Secure session-based login with role-based access control
- **Features:** Admin management panel, player scoring system, dynamic asteroid rendering

---

## Features

### 🎮 Game Features
- ✅ Real-time 2D gameplay with HTML5 Canvas
- ✅ Dynamic asteroid spawning with rotation and color variation
- ✅ Progressive difficulty scaling
- ✅ Background music and sound effects
- ✅ Pause/Resume functionality
- ✅ Interactive instructions modal
- ✅ Volume controls with mute toggle
- ✅ Persistent high score tracking

### 🔐 Authentication & Security
- ✅ Secure login/signup system
- ✅ Session-based authentication (cleared on page refresh)
- ✅ Role-based access control (Admin vs Normal users)
- ✅ Password validation (minimum 6 characters)
- ✅ Demo admin account for testing
- ✅ Automatic session cleanup on logout

### 👥 User Management
- ✅ Two user roles: Admin and Normal User
- ✅ Admin panel with full game management
- ✅ Normal users auto-start game with their profile
- ✅ Automatic player creation in database
- ✅ Score persistence per player

### 🛠️ Backend Features
- ✅ RESTful API endpoints
- ✅ Entity Framework Core with SQLite
- ✅ Automatic database migrations
- ✅ CRUD operations for players, scores, and asteroids
- ✅ Sample data generation for testing
- ✅ CORS support for local development
- ✅ Global error handling

---

## Quick Start

### Prerequisites
- **Python 3** or **Node.js** (for frontend HTTP server)
- **.NET 8.0 SDK** (for backend API)
- Modern browser with ES6 module support

### 1. Clone Repository

```bash
git clone https://github.com/VirajGandhi07/asteroid-dodger.git
cd asteroid-dodger
```

### 2. Start Backend API

```bash
cd DataManager/BackendApi
dotnet build
dotnet run
```

API will start on `http://localhost:5000` and automatically create/migrate the database.

### 3. Start Frontend Server

```bash
# From the asteroid-dodger root directory
python3 -m http.server 8000
```

Or using Node.js:
```bash
npx http-server -p 8000
```

### 4. Access the Game

Navigate to **`http://localhost:8000`** in your browser.

### 5. Login

Use the demo admin account:
- **Email:** `demo@test.com`
- **Password:** `demo123`

Or create a new normal user account via the signup form.

---

## Authentication & Security

### Login System
- **Session-based authentication** using `sessionStorage`
- Sessions are cleared on:
  - Page refresh
  - Browser tab/window close
  - Manual logout
- No persistent sessions across page loads for enhanced security

### Demo Account
```
Email: demo@test.com
Password: demo123
Role: Admin
```

### User Registration
- Users can sign up with name, email, and password
- All new users are registered as **Normal Users** by default
- Minimum password length: 6 characters
- Email validation required

---

## User Roles

### 👑 Admin Users
**Menu Access:**
- Play (with full sub-menu)
- Scoreboard
- Generate Sample Data
- How to Play
- Exit

**Play Menu:**
- Existing Player
- New Player
- List of Players
- Asteroids Management

**Game Over Options:**
- Play Again
- Change Player
- New Player
- Back to Menu

**Capabilities:**
- Full player management (create, rename, delete)
- Asteroid database management
- Generate sample data for testing
- View all players and scores

### 👤 Normal Users
**Menu Access:**
- Play (auto-starts game)
- Scoreboard
- How to Play
- Exit

**Game Flow:**
- Clicking "Play" immediately starts the game with their signup name
- Player automatically created in database
- Scores saved to their profile

**Game Over Options:**
- Play Again
- Back to Menu

**Limitations:**
- Cannot access player management
- Cannot generate sample data
- Cannot manage asteroids database

---

## Project Structure

```
asteroid-dodger/
├── index.html                 # Main game page with login modal
├── css/                       # Modular stylesheets
│   ├── main.css              # Master CSS imports
│   ├── global.css            # Base styles
│   ├── buttons.css           # Button styles
│   ├── modal.css             # Modal overlays
│   ├── menu.css              # Game menus
│   ├── login.css             # Login/signup modal
│   ├── start-menu.css
│   ├── title.css
│   └── volume-controls.css
├── js/                        # ES6 modules
│   ├── main.js               # Entry point
│   ├── game.js               # Game loop and state
│   ├── player.js             # Player mechanics
│   ├── asteroids.js          # Asteroid system
│   ├── renderer.js           # Canvas rendering
│   ├── audio.js              # Audio system
│   ├── ui.js                 # UI controls
│   ├── menu.js               # Menu navigation & RBAC
│   ├── api.js                # Backend API client
│   ├── auth.js               # Authentication logic
│   ├── login.js              # Login/signup handlers
│   ├── utils.js              # Utilities
│   └── config.js             # Configuration
├── images/                    # Game sprites
│   ├── asteroid1.png
│   └── rocket1.png
├── sounds/                    # Audio files
│   └── explosion-80108.mp3
├── DataManager/BackendApi/   # ASP.NET Core API
│   ├── Program.cs            # API endpoints & configuration
│   ├── appsettings.json      # Settings
│   ├── BackendApi.csproj     # Project file
│   ├── Data/
│   │   ├── GameDbContext.cs  # EF Core context
│   │   ├── Migrations/       # Database migrations
│   │   ├── GamePlayer.cs     # Player entity
│   │   ├── PlayerScore.cs    # Score entity
│   │   ├── GameAsteroid.cs   # Asteroid entity
│   │   └── User.cs           # User entity
│   └── Services/
│       ├── EF_PlayerService.cs
│       └── EF_AsteroidService.cs
├── GDD.md                    # Game Design Document
└── README.md                 # This file
```

---

## Frontend – Browser Game

### JavaScript Modules (`js/`)

| Module | Responsibility |
|--------|----------------|
| `main.js` | Initializes all game systems and orchestrates modules |
| `game.js` | Game loop, state management, pause/resume logic |
| `player.js` | Player movement, keyboard input, boundaries |
| `asteroids.js` | Spawn system, asteroid updates, collision detection |
| `renderer.js` | Canvas rendering with rotation and visual effects |
| `audio.js` | Background music, sound effects, volume controls |
| `ui.js` | UI button event handlers |
| `menu.js` | Menu system, navigation, role-based visibility |
| `api.js` | HTTP client for backend communication |
| `auth.js` | User authentication, session management, role checking |
| `login.js` | Login/signup form handlers |
| `utils.js` | Collision detection, helper functions |
| `config.js` | Game constants and tuning parameters |

### Visual Features

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

### Authentication (JWT)

The API supports JWT (JSON Web Token) authentication for protected endpoints. Protected endpoints require an `Authorization: Bearer <token>` header.

**Protected Endpoints:**
- `POST /players` - Create player
- `DELETE /players/{name}` - Delete player
- `PUT /players/rename` - Rename player
- `POST /asteroids` - Create asteroid
- `DELETE /asteroids/{id}` - Delete asteroid

#### Register a New User
```
POST /auth/register
Content-Type: application/json

{
  "username": "myuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "myuser",
    "email": "user@example.com",
    "createdAt": "2025-12-03T12:00:00Z",
    "isActive": true
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "myuser",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "myuser",
    "email": "user@example.com",
    "createdAt": "2025-12-03T12:00:00Z",
    "isActive": true
  }
}
```

#### Using JWT Token in Requests

Once you have a token, include it in the `Authorization` header for protected endpoints:

```bash
curl -X POST http://localhost:5000/players \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"name": "AuthenticatedPlayer"}'
```

**Demo Credentials:**
- Username: `demo`
- Password: `demo123`

(These are automatically seeded when the database is initialized)

**Token Details:**
- Algorithm: HS256
- Expiration: 60 minutes from issuance
- Issuer: `AsteroidDodgerApi`
- Audience: `AsteroidDodgerClients`

### Error Responses

Standard HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "details": "Additional error information",
  "timestamp": "2025-12-03T12:00:00Z"
}
```

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
