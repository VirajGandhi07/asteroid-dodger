import * as api from './api.js';
import * as auth from './auth.js';

// Menu state
let currentMenu = 'main';
let currentPlayerName = null;
let gameInstance = null;
let previousMenu = null;

// Menu element refs
const menuElements = {
  main: document.getElementById('mainMenu'),
  play: document.getElementById('playMenu'),
  gameOver: document.getElementById('gameOverMenu'),
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
  console.log('[Menu] showMenu called:', menuName);
  
  // Don't hide the instructions modal if it's currently active
  const instructionsActive = menuElements.instructions && menuElements.instructions.classList.contains('active');
  
  Object.values(menuElements).forEach(el => {
    if (el) {
      // Keep instructions modal active if it's open
      if (instructionsActive && el === menuElements.instructions) {
        console.log('[Menu] Keeping instructions modal active');
        return;
      }
      el.classList.remove('active');
    }
  });
  
  if (menuElements[menuName]) {
    menuElements[menuName].classList.add('active');
    currentMenu = menuName;
    
    // Update admin visibility when showing main, play, or game over menu
    if (menuName === 'main' || menuName === 'play' || menuName === 'gameOver') {
      updateAdminMenuVisibility();
    }
  }
  // Hide game elements when showing menu
  if (gameCanvas) gameCanvas.style.display = 'none';
  if (gameButtons) gameButtons.style.display = 'none';
  if (volumeControls) volumeControls.style.display = 'none';
  
  // Pause game when showing menu (except instructions which has its own handler)
  if (gameInstance && gameInstance.pause && menuName !== 'instructions') {
    gameInstance.pause();
  }
}

// Show game and hide menus
function showGame() {
  console.log('[Menu] showGame called');
  
  // Don't hide the instructions modal if it's currently active
  const instructionsActive = menuElements.instructions && menuElements.instructions.classList.contains('active');
  
  Object.values(menuElements).forEach(el => {
    if (el) {
      // Keep instructions modal active if it's open
      if (instructionsActive && el === menuElements.instructions) {
        console.log('[Menu] Keeping instructions modal active in showGame');
        return;
      }
      el.classList.remove('active');
    }
  });
  // Show game elements
  if (gameCanvas) gameCanvas.style.display = 'block';
  if (gameButtons) gameButtons.style.display = 'flex';
  if (volumeControls) volumeControls.style.display = 'flex';
  
  // Resume game if it was paused by menu (but not if game not started yet)
  if (gameInstance && gameInstance.resume && gameInstance.isStarted && gameInstance.isStarted()) {
    gameInstance.resume();
  }
}

// Handle main menu actions
function handleMainMenuAction(action) {
  switch (action) {
    case 'play':
      previousMenu = 'main';
      // Check if user is admin
      const isUserAdmin = auth.isAdmin();
      console.log('[Menu] Play clicked. Is admin:', isUserAdmin);
      if (isUserAdmin) {
        // Admin sees the play menu with all options
        console.log('[Menu] Admin user - showing play menu');
        showMenu('play');
      } else {
        // Normal user: auto-start game with their signup name
        console.log('[Menu] Normal user - auto-starting game');
        const user = auth.getCurrentUser();
        if (user && user.name) {
          autoStartGameForNormalUser(user.name);
        } else {
          showAlert('Error', 'Unable to retrieve user information');
        }
      }
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

// Handle game over menu actions
function handleGameOverMenuAction(action) {
  switch (action) {
    case 'play-again':
      // Resume game with same player
      if (gameInstance && currentPlayerName) {
        gameInstance.restart();
        showGame(); // Hide menu and show game
      }
      break;
    case 'change-player':
      // Show play menu to select different player
      currentPlayerName = null;
      showMenu('play');
      break;
    case 'new-player-gameover':
      // Prompt for new player name and start game
      currentPlayerName = null;
      promptNewPlayer();
      break;
    case 'back-to-menu':
      // Return to main menu
      currentPlayerName = null;
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
    case 'delete-asteroid':
      promptDeleteAsteroid();
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
  if (gameInstance) {
    // Restart the game to ensure fresh state
    if (gameInstance.restart) {
      gameInstance.restart();
    }
    if (gameInstance.start) {
      gameInstance.start();
    }
  }
}

// Auto-start game for normal users with their signup name
async function autoStartGameForNormalUser(playerName) {
  currentPlayerName = playerName;
  console.log('[Menu] Normal user auto-starting game with player:', currentPlayerName);
  
  // Check if player exists in database, if not create them
  try {
    const players = await api.getAllPlayers();
    const playerExists = players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    if (!playerExists) {
      console.log('[Menu] Creating new player in database:', playerName);
      await api.addPlayer(playerName);
    }
    
    hideMenuAndStartGame();
  } catch (err) {
    console.error('[Menu] Error setting up player:', err);
    // Still start the game even if database operation fails
    hideMenuAndStartGame();
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

// Delete asteroid by ID
async function promptDeleteAsteroid() {
  const idInput = await showPrompt('Enter asteroid ID to delete:');
  if (!idInput) return;

  const id = parseInt(idInput);
  if (isNaN(id) || id <= 0) {
    await showAlert('Error', 'Invalid asteroid ID. Please enter a valid number.');
    return;
  }

  try {
    const confirmed = await showConfirm('Delete Asteroid', `Are you sure you want to delete asteroid with ID ${id}?`);
    if (!confirmed) return;

    await api.deleteAsteroid(id);
    await showAlert('Success', `Asteroid with ID ${id} has been deleted!`);
    loadAndShowAsteroidsList();
  } catch (err) {
    console.error('Failed to delete asteroid:', err);
    await showAlert('Error', `Failed to delete asteroid: ${err.message}`);
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
async function handleGenerateConfirm() {
  const playerCountValue = document.getElementById('playerCount').value;
  const asteroidCountValue = document.getElementById('asteroidCount').value;
  
  const playerCount = parseInt(playerCountValue) || 0;
  const asteroidCount = parseInt(asteroidCountValue) || 0;

  console.log(`[Generate] Starting generation: ${playerCount} players, ${asteroidCount} asteroids`);

  let generatedPlayers = 0;
  let generatedAsteroids = 0;
  const promises = [];

  // Generate players first with addPlayer, then post their scores
  for (let i = 0; i < playerCount; i++) {
    const name = `GenPlayer${Date.now()}_${i}`;
    const score = Math.floor(Math.random() * 41); // Generate score between 0-40
    
    // Create promise chain: addPlayer -> postScore
    const playerPromise = api.addPlayer(name)
      .then(() => {
        generatedPlayers++;
        console.log(`[Generate] Created player: ${name}`);
        return api.postScore(name, score);
      })
      .catch(err => {
        console.error(`[Generate] Failed to create player ${name}:`, err);
        throw err;
      });
    
    promises.push(playerPromise);
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
    
    const asteroidPromise = api.addAsteroid(asteroid)
      .then(() => {
        generatedAsteroids++;
        console.log(`[Generate] Created asteroid ${i + 1}`);
      })
      .catch(err => {
        console.error(`[Generate] Failed to create asteroid ${i + 1}:`, err);
        throw err;
      });
    
    promises.push(asteroidPromise);
  }

  try {
    await Promise.all(promises);
    console.log(`[Generate] SUCCESS: ${generatedPlayers} players and ${generatedAsteroids} asteroids generated`);
    await showAlert('Success', `Generated ${playerCount} players and ${asteroidCount} asteroids!`);
    showMenu('main');
  } catch (err) {
    console.error('[Generate] Failed to generate data:', err);
    await showAlert('Error', `Failed to generate data: ${err.message}`);
  }
}

// Wire up menu button handlers with event delegation
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  
  const action = btn.dataset.action;
  console.log('[Menu] Action clicked:', action, 'currentMenu:', currentMenu);

  if (currentMenu === 'main') handleMainMenuAction(action);
  else if (currentMenu === 'play') handlePlayMenuAction(action);
  else if (currentMenu === 'gameOver') handleGameOverMenuAction(action);
  else if (currentMenu === 'asteroids') handleAsteroidsMenuAction(action);
  else if (action === 'back-scoreboard') showMenu('main');
  else if (action === 'back-asteroids') showMenu('play');
  else if (action === 'back-players-list') showMenu('play');
  else if (action === 'back-list') showMenu('asteroids');
  else if (action === 'back-generate') showMenu('main');
  else if (action === 'back-instructions') {
    console.log('[Menu] Back-instructions clicked. Game started?', gameInstance && gameInstance.isStarted && gameInstance.isStarted());
    
    // Hide instructions modal first
    if (menuElements.instructions) {
      menuElements.instructions.classList.remove('active');
      console.log('[Menu] Instructions modal hidden');
    }
    
    // If game is running, resume it and update UI
    if (gameInstance && gameInstance.isStarted && gameInstance.isStarted()) {
      console.log('[Menu] Game is running, resuming...');
      // Call the resume callback from main.js which handles game resume and button text update
      if (window.onCloseInstructionsFromMenu) {
        window.onCloseInstructionsFromMenu();
      }
    } else {
      console.log('[Menu] Game not running, showing previous menu');
      // Return to previous menu if not in game
      if (previousMenu && previousMenu !== 'instructions') showMenu(previousMenu);
      else showMenu('main');
    }
  }
  else if (action === 'generate-confirm') handleGenerateConfirm();
});

// Export public API for main.js to call
export function setGameInstance(game) {
  gameInstance = game;
}

// Get current player name
export function getCurrentPlayerName() {
  return currentPlayerName;
}

// Update admin-only menu visibility based on user role
export function updateAdminMenuVisibility() {
  const isUserAdmin = auth.isAdmin();
  const adminElements = document.querySelectorAll('.menu-btn.admin-only');
  
  console.log('[Menu] Updating admin visibility. Is admin:', isUserAdmin, 'Elements found:', adminElements.length);
  
  adminElements.forEach(el => {
    if (isUserAdmin) {
      // Show admin buttons by removing the admin-only class and re-adding without the hiding
      el.style.display = 'block';
      el.style.setProperty('display', 'block', 'important');
    } else {
      // Hide admin buttons
      el.style.display = 'none';
      el.style.setProperty('display', 'none', 'important');
    }
  });
}

export function startGame() {
  updateAdminMenuVisibility(); // Show/hide admin options
  showMenu('main');
}

export function onGameOver(score) {
  if (currentPlayerName) {
    console.log('onGameOver: currentPlayerName=', currentPlayerName, 'score=', score);
    api.postScore(currentPlayerName, score)
      .then(() => {
        document.getElementById('gameOverScore').textContent = score;
        document.getElementById('gameOverPlayer').textContent = currentPlayerName;
        showMenu('gameOver');
      })
      .catch(err => {
        console.error('Failed to post score:', err);
        document.getElementById('gameOverScore').textContent = score;
        document.getElementById('gameOverPlayer').textContent = currentPlayerName;
        showMenu('gameOver');
      });
  } else {
    document.getElementById('gameOverScore').textContent = score;
    document.getElementById('gameOverPlayer').textContent = '-';
    showMenu('gameOver');
  }
}

// Expose functions to global scope for onclick handlers
window.updatePlayerName = updatePlayerName;
window.deletePlayer = deletePlayer;
