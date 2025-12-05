// UI module: wires DOM controls and exposes helpers for main game logic
export default function initUI(callbacks = {}) {
  const pauseBtn = document.getElementById('pauseBtn');               // Pause button
  const newGameBtn = document.getElementById('newGameBtn');           // Restart button
  const mainMenuBtn = document.getElementById('mainMenuBtn');         // Main menu button
  const instructionsBtn = document.getElementById('instructionsBtn'); // Show instructions
  const instructionsModal = document.getElementById('instructionsModal'); // Instructions modal
  const startMenu = document.getElementById('startMenu');             // Start screen
  const startGameBtn = document.getElementById('startGameBtn');       // Start game from menu
  const startInstructionsBtn = document.getElementById('startInstructionsBtn'); // Show instructions from menu

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!callbacks.getGameStarted || !callbacks.getGameStarted()) return; // Only if game started
      if (callbacks.getGameOver && callbacks.getGameOver()) return;         // Skip if game over
      
      const stateBefore = callbacks.getGameState && callbacks.getGameState();
      console.log('[UI] Pause button clicked. State before:', stateBefore?.paused ? 'paused' : 'running');
      
      callbacks.onTogglePause && callbacks.onTogglePause();                 // Toggle pause
      
      // Update button text based on NEW pause state (after toggle)
      const stateAfter = callbacks.getGameState && callbacks.getGameState();
      if (stateAfter && stateAfter.paused) {
        pauseBtn.textContent = 'Resume Game';
        console.log('[UI] Game paused, button text set to Resume Game');
      } else {
        pauseBtn.textContent = 'Pause Game';
        console.log('[UI] Game resumed, button text set to Pause Game');
      }
    });
    // Initialize button text
    pauseBtn.textContent = 'Pause Game';
  }

  if (newGameBtn) newGameBtn.addEventListener('click', () => 
    callbacks.onRestart && callbacks.onRestart()                           // Restart game
  );

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
      console.log('[UI] Instructions button clicked');
      console.log('[UI] instructionsModal element:', instructionsModal);
      console.log('[UI] instructionsModal classes before:', instructionsModal?.className);
      
      callbacks.onPauseForInstructions && callbacks.onPauseForInstructions(); // Pause game for modal
      
      if (instructionsModal) {
        console.log('[UI] Showing instructions modal');
        instructionsModal.classList.add('active');  // Show instructions using menu-overlay styling
        console.log('[UI] instructionsModal classes after:', instructionsModal?.className);
        console.log('[UI] instructionsModal computed display:', window.getComputedStyle(instructionsModal).display);
      } else {
        console.error('[UI] instructionsModal element not found!');
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