// UI module: wires DOM controls and exposes helpers for main game logic
export default function initUI(callbacks = {}) {
  const pauseBtn = document.getElementById('pauseBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  const mainMenuBtn = document.getElementById('mainMenuBtn');
  const instructionsBtn = document.getElementById('instructionsBtn');
  const instructionsModal = document.getElementById('instructionsModal');
  const startMenu = document.getElementById('startMenu');
  const startGameBtn = document.getElementById('startGameBtn');
  const startInstructionsBtn = document.getElementById('startInstructionsBtn');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!callbacks.getGameStarted || !callbacks.getGameStarted()) return;
      if (callbacks.getGameOver && callbacks.getGameOver()) return;
      
      callbacks.onTogglePause && callbacks.onTogglePause();
      
      // Update button text based on pause state
      const state = callbacks.getGameState && callbacks.getGameState();
      pauseBtn.textContent = (state && state.paused) ? 'Resume Game' : 'Pause Game';
    });
    pauseBtn.textContent = 'Pause Game';
  }

  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => callbacks.onRestart && callbacks.onRestart());
  }

  if (mainMenuBtn) mainMenuBtn.addEventListener('click', async () => {
    // Pause the game first
    if (callbacks.onPause) callbacks.onPause();
    
    // Show custom confirmation modal
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmModalTitle');
    const confirmMessage = document.getElementById('confirmModalMessage');
    const confirmYes = document.getElementById('confirmModalYes');
    const confirmNo = document.getElementById('confirmModalNo');
    
    if (confirmModal && confirmTitle && confirmMessage && confirmYes && confirmNo) {
      confirmTitle.textContent = 'Return to Main Menu?';
      confirmMessage.textContent = 'Your current score will NOT be saved.';
      confirmModal.classList.add('active');
      
      // Handle Yes button
      const handleYes = () => {
        confirmModal.classList.remove('active');
        confirmYes.removeEventListener('click', handleYes);
        confirmNo.removeEventListener('click', handleNo);
        // Return to main menu without saving score
        callbacks.onReturnToMenu && callbacks.onReturnToMenu();
      };
      
      // Handle No button
      const handleNo = () => {
        confirmModal.classList.remove('active');
        confirmYes.removeEventListener('click', handleYes);
        confirmNo.removeEventListener('click', handleNo);
        // Resume the game if user cancels
        if (callbacks.onResume) callbacks.onResume();
      };
      
      confirmYes.addEventListener('click', handleYes);
      confirmNo.addEventListener('click', handleNo);
    }
  });

  if (instructionsBtn) {
    instructionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      callbacks.onPauseForInstructions && callbacks.onPauseForInstructions();
      
      if (instructionsModal) {
        instructionsModal.classList.add('active');
      }
    });
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      callbacks.onStartGame && callbacks.onStartGame();
      if (startMenu) startMenu.style.display = 'none';
    });
  }

  if (startInstructionsBtn) {
    startInstructionsBtn.addEventListener('click', () => {
      if (startMenu) startMenu.style.display = 'none';
      if (instructionsModal) instructionsModal.classList.add('active');
    });
  }

  return {
    setPauseButtonText(text) { 
      if (pauseBtn) pauseBtn.textContent = text;
    }
  };
}