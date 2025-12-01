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
  playersList: document.getElementById('playersListMenu'),
  generate: document.getElementById('generateMenu'),
  instructions: document.getElementById('instructionsModal')
};

// Game UI refs
const gameCanvas = document.getElementById('gameCanvas');
const gameButtons = document.getElementById('gameButtons');
const volumeControls = document.getElementById('volumeControls');

// Modal element refs - will be initialized when DOM is ready
let inputModal, confirmModal, alertModal;

// Dialog state
let inputResolve = null;
let confirmResolve = null;

// Initialize modals and their event listeners
function initializeModals() {
  inputModal = document.getElementById('inputModal');
  confirmModal = document.getElementById('confirmModal');
  alertModal = document.getElementById('alertModal');

  // Setup input modal
  document.getElementById('inputModalOk').addEventListener('click', () => {
    const value = document.getElementById('inputModalField').value;
    inputModal.classList.remove('active');
    if (inputResolve) {
      inputResolve(value);
      inputResolve = null;
    }
  });

  document.getElementById('inputModalCancel').addEventListener('click', () => {
    inputModal.classList.remove('active');
    if (inputResolve) {
      inputResolve(null);
      inputResolve = null;
    }
  });

  // Setup confirm modal
  document.getElementById('confirmModalYes').addEventListener('click', () => {
    confirmModal.classList.remove('active');
    if (confirmResolve) {
      confirmResolve(true);
      confirmResolve = null;
    }
  });

  document.getElementById('confirmModalNo').addEventListener('click', () => {
    confirmModal.classList.remove('active');
    if (confirmResolve) {
      confirmResolve(false);
      confirmResolve = null;
    }
  });

  // Setup alert modal
  document.getElementById('alertModalOk').addEventListener('click', () => {
    alertModal.classList.remove('active');
  });
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeModals);
} else {
  initializeModals();
}

// Custom prompt function (returns Promise)
function showPrompt(title, defaultValue = '') {
  return new Promise((resolve) => {
    document.getElementById('inputModalTitle').textContent = title;
    document.getElementById('inputModalField').value = defaultValue;
    inputResolve = resolve;
    inputModal.classList.add('active');
    document.getElementById('inputModalField').focus();
  });
}

// Custom confirm function (returns Promise)
function showConfirm(title, message) {
  return new Promise((resolve) => {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').textContent = message;
    confirmResolve = resolve;
    confirmModal.classList.add('active');
  });
}

// Custom alert function (returns Promise)
function showAlert(title, message) {
  return new Promise((resolve) => {
    document.getElementById('alertModalTitle').textContent = title;
    document.getElementById('alertModalMessage').textContent = message;
    const okBtn = document.getElementById('alertModalOk');
    const handler = () => {
      alertModal.classList.remove('active');
      okBtn.removeEventListener('click', handler);
      resolve();
    };
    okBtn.addEventListener('click', handler);
    alertModal.classList.add('active');
  });
}

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
    case 'list-players':
      previousMenu = 'play';
      loadAndShowPlayersList();
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

// Load and show players list with update/delete options
async function loadAndShowPlayersList() {
  try {
    const players = await api.getAllPlayers();
    const list = document.getElementById('playersListContent');
    if (players.length === 0) {
      list.innerHTML = '<p>No players yet.</p>';
    } else {
      // Build unique list of player names (preserve first occurrence order)
      const seen = new Set();
      const unique = [];
      for (const p of players) {
        if (!p.name) continue;
        const key = p.name.trim();
        const keyLower = key.toLowerCase();
        if (!seen.has(keyLower)) {
          seen.add(keyLower);
          unique.push(key);
        }
      }
      list.innerHTML = unique.map(name => 
        `<div class="player-item">
          <span class="player-name">${name}</span>
          <div class="player-actions">
            <button class="player-action-btn" onclick="updatePlayerName('${name.replace(/'/g, "\\'")}')">Edit</button>
            <button class="player-action-btn" onclick="deletePlayer('${name.replace(/'/g, "\\'")}')">Delete</button>
          </div>
        </div>`
      ).join('');
    }
    showMenu('playersList');
  } catch (err) {
    console.error('Failed to load players:', err);
    showAlert('Error', 'Failed to load players');
  }
}

// Update player name
async function updatePlayerName(oldName) {
  const newName = await showPrompt(`Enter new name for "${oldName}":`, oldName);
  if (!newName || !newName.trim()) return;
  if (newName.trim() === oldName) return;
  
  const trimmedNewName = newName.trim();
  
  // Check if new name already exists
  try {
    const players = await api.getAllPlayers();
    if (players.some(p => p.name.toLowerCase() === trimmedNewName.toLowerCase())) {
      await showAlert('Error', `Player "${trimmedNewName}" already exists!`);
      return;
    }
    
    // Find the old player
    const oldPlayer = players.find(p => p.name.toLowerCase() === oldName.toLowerCase());
    if (!oldPlayer) {
      await showAlert('Error', 'Player not found!');
      return;
    }
    
    // Request server to rename all entries from oldName to newName
    await api.renamePlayer(oldName, trimmedNewName);
    await showAlert('Success', `Player renamed from "${oldName}" to "${trimmedNewName}"!`);
    loadAndShowPlayersList();
  } catch (err) {
    console.error('Failed to update player:', err);
    await showAlert('Error', 'Failed to update player');
  }
}

// Delete player
async function deletePlayer(playerName) {
  const confirmed = await showConfirm('Confirm Delete', `Are you sure you want to delete "${playerName}"?\nThis will also delete their score from the scoreboard.`);
  if (!confirmed) return;
  
  try {
    await api.deletePlayer(playerName);
    await showAlert('Success', `Player "${playerName}" deleted!`);
    loadAndShowPlayersList();
  } catch (err) {
    console.error('Failed to delete player:', err);
    await showAlert('Error', 'Failed to delete player');
  }
}

// Prompt for existing player name and start game
async function promptExistingPlayer() {
  const name = await showPrompt('Enter player name:');
  if (name && name.trim()) {
    const playerName = name.trim();
    // Check if player exists
    try {
      console.log('Fetching all players...');
      const players = await api.getAllPlayers();
      console.log('Players fetched:', players);
      const playerExists = players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
      if (playerExists) {
        currentPlayerName = playerName;
        hideMenuAndStartGame();
      } else {
        await showAlert('Player Not Found', `Player "${playerName}" does not exist. Please create a new player.`);
      }
    } catch (err) {
      console.error('Error checking player:', err);
      await showAlert('Error', `Error checking player: ${err.message}`);
    }
  }
}

// Prompt for new player name and start game
async function promptNewPlayer() {
  const name = await showPrompt('Enter new player name:');
  if (name && name.trim()) {
    const playerName = name.trim();
    // Check if player already exists
    try {
      console.log('Fetching all players to check if new player exists...');
      const players = await api.getAllPlayers();
      console.log('Players fetched:', players);
      const playerExists = players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
      if (playerExists) {
        await showAlert('Player Exists', `Player "${playerName}" already exists. Please use "Existing Player" to continue.`);
      } else {
        currentPlayerName = playerName;
        // Add new player
        try {
          console.log('Adding new player:', playerName);
          await api.addPlayer(playerName);
          console.log('Player added successfully');
          hideMenuAndStartGame();
        } catch (err) {
          console.error('Error creating player:', err);
          await showAlert('Error', `Error creating player: ${err.message}`);
        }
      }
    } catch (err) {
      console.error('Error checking player:', err);
      await showAlert('Error', `Error checking player: ${err.message}`);
    }
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
async function promptAddAsteroid() {
  const size = await showPrompt('Enter size (Small/Medium/Large):');
  if (!size) return;
  const speed = parseInt(await showPrompt('Enter speed (1-10):'));
  if (isNaN(speed)) return;
  const material = await showPrompt('Enter material (Rock/Iron/Crystal):');
  if (!material) return;
  const type = await showPrompt('Enter type (Normal/Rare/Boss):');
  if (!type) return;
  const spawnRate = parseInt(await showPrompt('Enter spawn rate (1-100):'));
  if (isNaN(spawnRate)) return;

  const asteroid = { size, speed, material, type, spawnRate };
  try {
    await api.addAsteroid(asteroid);
    await showAlert('Success', 'Asteroid added!');
    loadAndShowAsteroidsList();
  } catch (err) {
    console.error('Failed to add asteroid:', err);
    await showAlert('Error', 'Failed to add asteroid');
  }
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

  api.addAsteroid(asteroid)
    .then(() => {
      showAlert('Success', 'Random asteroid added!');
      loadAndShowAsteroidsList();
    })
    .catch(err => {
      console.error('Failed to add random asteroid:', err);
      showAlert('Error', 'Failed to add asteroid');
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
    else if (action === 'back-players-list') showMenu('play');
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

// Expose functions to global scope for onclick handlers
window.updatePlayerName = updatePlayerName;
window.deletePlayer = deletePlayer;
