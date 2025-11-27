import * as api from './api.js';

// Menu state
let currentMenu = 'main';
let currentPlayerName = null;
let gameInstance = null;
let previousMenu = null;

// Menu element refs
const menuElements = {
  main: document.getElementById('mainMenu'),
  play: document.getElementById('playMenu'),
  scoreboard: document.getElementById('scoreboardMenu'),
  asteroids: document.getElementById('asteroidsMenu'),
  asteroidsList: document.getElementById('asteroidsList'),
  generate: document.getElementById('generateMenu'),
  instructions: document.getElementById('instructionsModal')
};

// Game UI refs
const gameCanvas = document.getElementById('gameCanvas');
const gameButtons = document.getElementById('gameButtons');
const volumeControls = document.getElementById('volumeControls');

// Show menu and hide others; also hide game UI
function showMenu(menuName) {
  Object.values(menuElements).forEach(el => {
    if (el) el.classList.remove('active');
  });
  if (menuElements[menuName]) {
    menuElements[menuName].classList.add('active');
    currentMenu = menuName;
  }
  // Hide game elements when showing menu
  if (gameCanvas) gameCanvas.style.display = 'none';
  if (gameButtons) gameButtons.style.display = 'none';
  if (volumeControls) volumeControls.style.display = 'none';
}

// Show game and hide menus
function showGame() {
  Object.values(menuElements).forEach(el => {
    if (el) el.classList.remove('active');
  });
  // Show game elements
  if (gameCanvas) gameCanvas.style.display = 'block';
  if (gameButtons) gameButtons.style.display = 'flex';
  if (volumeControls) volumeControls.style.display = 'flex';
}

// Handle main menu actions
function handleMainMenuAction(action) {
  switch (action) {
    case 'play':
      previousMenu = 'main';
      showMenu('play');
      break;
    case 'scoreboard':
      previousMenu = 'main';
      loadAndShowScoreboard();
      break;
    case 'generate':
      previousMenu = 'main';
      showMenu('generate');
      break;
    case 'instructions':
      previousMenu = 'main';
      showMenu('instructions');
      break;
    case 'exit':
      if (confirm('Exit game?')) {
        window.close();
      }
      break;
  }
}

// Handle play menu actions
function handlePlayMenuAction(action) {
  switch (action) {
    case 'existing-player':
      promptExistingPlayer();
      break;
    case 'new-player':
      promptNewPlayer();
      break;
    case 'asteroids':
      previousMenu = 'play';
      showMenu('asteroids');
      break;
    case 'back':
      showMenu('main');
      break;
  }
}

// Handle asteroids menu actions
function handleAsteroidsMenuAction(action) {
  switch (action) {
    case 'list-asteroids':
      loadAndShowAsteroidsList();
      break;
    case 'add-asteroid':
      promptAddAsteroid();
      break;
    case 'random-asteroid':
      addRandomAsteroid();
      break;
    case 'back-asteroids':
      showMenu('play');
      break;
  }
}

// Load scoreboard from backend
async function loadAndShowScoreboard() {
  try {
    const scores = await api.getTopScores();
    const list = document.getElementById('scoreboardList');
    if (scores.length === 0) {
      list.innerHTML = '<p>No scores yet.</p>';
    } else {
      list.innerHTML = scores.map((p, i) => 
        `<div class="scoreboard-item">${i + 1}. ${p.name} - ${p.highScore}</div>`
      ).join('');
    }
    showMenu('scoreboard');
  } catch (err) {
    console.error('Failed to load scoreboard:', err);
    alert('Failed to load scoreboard');
  }
}

// Load asteroids list
async function loadAndShowAsteroidsList() {
  try {
    const asteroids = await api.getAsteroids();
    const list = document.getElementById('asteroidsListContent');
    if (asteroids.length === 0) {
      list.innerHTML = '<p>No asteroids.</p>';
    } else {
      list.innerHTML = asteroids.map(a => 
        `<div class="asteroid-item">ID:${a.id} Size:${a.size} Speed:${a.speed} Material:${a.material} Type:${a.type}</div>`
      ).join('');
    }
    showMenu('asteroidsList');
  } catch (err) {
    console.error('Failed to load asteroids:', err);
    alert('Failed to load asteroids');
  }
}

// Prompt for existing player name and start game
function promptExistingPlayer() {
  const name = prompt('Enter player name:');
  if (name && name.trim()) {
    const playerName = name.trim();
    // Check if player exists by fetching top scores
    api.getTopScores()
      .then(players => {
        const playerExists = players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (playerExists) {
          currentPlayerName = playerName;
          hideMenuAndStartGame();
        } else {
          alert(`Player "${playerName}" does not exist. Please create a new player.`);
        }
      })
      .catch(err => {
        console.error('Error checking player:', err);
        alert('Error checking player. Please try again.');
      });
  }
}

// Prompt for new player name and start game
function promptNewPlayer() {
  const name = prompt('Enter new player name:');
  if (name && name.trim()) {
    const playerName = name.trim();
    // Check if player already exists
    api.getTopScores()
      .then(players => {
        const playerExists = players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (playerExists) {
          alert(`Player "${playerName}" already exists. Please use "Existing Player" to continue.`);
        } else {
          currentPlayerName = playerName;
          // Post initial score of 0 to create the player
          api.postScore(playerName, 0)
            .then(() => {
              hideMenuAndStartGame();
            })
            .catch(err => {
              console.error('Error creating player:', err);
              alert('Error creating player. Please try again.');
            });
        }
      })
      .catch(err => {
        console.error('Error checking player:', err);
        alert('Error checking player. Please try again.');
      });
  }
}

// Hide menu and start the game
function hideMenuAndStartGame() {
  showGame();
  if (gameInstance && gameInstance.start) {
    gameInstance.start();
  }
}

// Prompt to add asteroid manually
function promptAddAsteroid() {
  const size = prompt('Enter size (Small/Medium/Large):');
  if (!size) return;
  const speed = parseInt(prompt('Enter speed (1-10):'));
  if (isNaN(speed)) return;
  const material = prompt('Enter material (Rock/Iron/Crystal):');
  if (!material) return;
  const type = prompt('Enter type (Normal/Rare/Boss):');
  if (!type) return;
  const spawnRate = parseInt(prompt('Enter spawn rate (1-100):'));
  if (isNaN(spawnRate)) return;

  const asteroid = { size, speed, material, type, spawnRate };
  api.postAsteroid(asteroid)
    .then(() => {
      alert('Asteroid added!');
      loadAndShowAsteroidsList();
    })
    .catch(err => {
      console.error('Failed to add asteroid:', err);
      alert('Failed to add asteroid');
    });
}

// Add random asteroid
function addRandomAsteroid() {
  const sizes = ['Small', 'Medium', 'Large'];
  const materials = ['Rock', 'Iron', 'Crystal'];
  const types = ['Normal', 'Rare', 'Boss'];

  const asteroid = {
    size: sizes[Math.floor(Math.random() * sizes.length)],
    speed: Math.floor(Math.random() * 10) + 1,
    material: materials[Math.floor(Math.random() * materials.length)],
    type: types[Math.floor(Math.random() * types.length)],
    spawnRate: Math.floor(Math.random() * 100) + 1
  };

  api.postAsteroid(asteroid)
    .then(() => {
      alert('Random asteroid added!');
      loadAndShowAsteroidsList();
    })
    .catch(err => {
      console.error('Failed to add random asteroid:', err);
      alert('Failed to add asteroid');
    });
}

// Generate sample data
function handleGenerateConfirm() {
  const playerCount = parseInt(document.getElementById('playerCount').value) || 5;
  const asteroidCount = parseInt(document.getElementById('asteroidCount').value) || 10;

  const promises = [];

  // Generate players
  for (let i = 0; i < playerCount; i++) {
    const name = `Player${i + 1}`;
    const score = Math.floor(Math.random() * 100);
    promises.push(api.postScore(name, score));
  }

  // Generate asteroids
  const sizes = ['Small', 'Medium', 'Large'];
  const materials = ['Rock', 'Iron', 'Crystal'];
  const types = ['Normal', 'Rare', 'Boss'];

  for (let i = 0; i < asteroidCount; i++) {
    const asteroid = {
      size: sizes[Math.floor(Math.random() * sizes.length)],
      speed: Math.floor(Math.random() * 10) + 1,
      material: materials[Math.floor(Math.random() * materials.length)],
      type: types[Math.floor(Math.random() * types.length)],
      spawnRate: Math.floor(Math.random() * 100) + 1
    };
    promises.push(api.postAsteroid(asteroid));
  }

  Promise.all(promises)
    .then(() => {
      alert(`Generated ${playerCount} players and ${asteroidCount} asteroids!`);
      showMenu('main');
    })
    .catch(err => {
      console.error('Failed to generate data:', err);
      alert('Failed to generate data');
    });
}

// Wire up menu button handlers
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const action = e.target.dataset.action;

    if (currentMenu === 'main') handleMainMenuAction(action);
    else if (currentMenu === 'play') handlePlayMenuAction(action);
    else if (currentMenu === 'asteroids') handleAsteroidsMenuAction(action);
    else if (action === 'back-scoreboard') showMenu('main');
    else if (action === 'back-asteroids') showMenu('play');
    else if (action === 'back-list') showMenu('asteroids');
    else if (action === 'back-generate') showMenu('main');
    else if (action === 'back-instructions') {
      // Return to previous menu when closing instructions
      if (previousMenu) showMenu(previousMenu);
      else showMenu('main');
    }
    else if (action === 'generate-confirm') handleGenerateConfirm();
  });
});

// Export public API for main.js to call
export function setGameInstance(game) {
  gameInstance = game;
}

export function startGame() {
  showMenu('main');
}

export function onGameOver(score) {
  if (currentPlayerName) {
    api.postScore(currentPlayerName, score)
      .then(() => showMenu('main'))
      .catch(err => {
        console.error('Failed to post score:', err);
        showMenu('main');
      });
  } else {
    showMenu('main');
  }
}
