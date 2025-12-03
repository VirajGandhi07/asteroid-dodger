// UI module: wires DOM controls and exposes helpers for main game logic
export default function initUI(callbacks = {}) {
  const pauseBtn = document.getElementById('pauseBtn');               // Pause button
  const newGameBtn = document.getElementById('newGameBtn');           // Restart button
  const resetScoreBtn = document.getElementById('resetScoreBtn');     // Reset high score
  const instructionsBtn = document.getElementById('instructionsBtn'); // Show instructions
  const instructionsModal = document.getElementById('instructionsModal'); // Instructions modal
  const startMenu = document.getElementById('startMenu');             // Start screen
  const startGameBtn = document.getElementById('startGameBtn');       // Start game from menu
  const startInstructionsBtn = document.getElementById('startInstructionsBtn'); // Show instructions from menu

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!callbacks.getGameStarted || !callbacks.getGameStarted()) return; // Only if game started
      if (callbacks.getGameOver && callbacks.getGameOver()) return;         // Skip if game over
      callbacks.onTogglePause && callbacks.onTogglePause();                 // Toggle pause
      
      // Update button text based on NEW pause state (after toggle with setTimeout)
      setTimeout(() => {
        const state = callbacks.getGameState && callbacks.getGameState();
        if (state && state.paused) {
          pauseBtn.textContent = 'Resume Game';
        } else {
          pauseBtn.textContent = 'Pause Game';
        }
      }, 0);
    });
    // Initialize button text
    pauseBtn.textContent = 'Pause Game';
  }

  if (newGameBtn) newGameBtn.addEventListener('click', () => 
    callbacks.onRestart && callbacks.onRestart()                           // Restart game
  );

  if (resetScoreBtn) resetScoreBtn.addEventListener('click', () => 
    callbacks.onResetHighScore && callbacks.onResetHighScore()            // Reset high score
  );

  if (instructionsBtn) {
    instructionsBtn.addEventListener('click', () => {
      callbacks.onPauseForInstructions && callbacks.onPauseForInstructions(); // Pause game for modal
      if (instructionsModal) {
        instructionsModal.classList.add('active');  // Show instructions using menu-overlay styling
      }
    });
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      callbacks.onStartGame && callbacks.onStartGame();                     // Start game
      if (startMenu) startMenu.style.display = 'none';                      // Hide menu
    });
  }

  if (startInstructionsBtn) {
    startInstructionsBtn.addEventListener('click', () => {
      if (startMenu) startMenu.style.display = 'none';                      // Hide start menu
      if (instructionsModal) instructionsModal.classList.add('active');    // Show instructions modal
    });
  }

  // Public helpers to control UI elements
  return {
    setPauseButtonText(text) { if (pauseBtn) pauseBtn.textContent = text; }, // Change pause button label
    showStartMenu() { if (startMenu) startMenu.style.display = 'flex'; },   // Show start menu
    hideStartMenu() { if (startMenu) startMenu.style.display = 'none'; },   // Hide start menu
    showInstructions() { if (instructionsModal) instructionsModal.style.display = 'flex'; }, // Show instructions
    hideInstructions() { if (instructionsModal) instructionsModal.style.display = 'none'; }  // Hide instructions
  };
}