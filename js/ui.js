// UI module: wires DOM controls and exposes helpers for main game logic
export default function initUI(callbacks = {}) {
  const pauseBtn = document.getElementById('pauseBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  const resetScoreBtn = document.getElementById('resetScoreBtn');
  const instructionsBtn = document.getElementById('instructionsBtn');
  const instructionsModal = document.getElementById('instructionsModal');
  const closeInstructionsBtn = document.getElementById('closeInstructionsBtn');
  const startMenu = document.getElementById('startMenu');
  const startGameBtn = document.getElementById('startGameBtn');
  const startInstructionsBtn = document.getElementById('startInstructionsBtn');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!callbacks.getGameStarted || !callbacks.getGameStarted()) return;
      if (callbacks.getGameOver && callbacks.getGameOver()) return;
      callbacks.onTogglePause && callbacks.onTogglePause();
    });
  }

  if (newGameBtn) newGameBtn.addEventListener('click', () => callbacks.onRestart && callbacks.onRestart());

  if (resetScoreBtn) resetScoreBtn.addEventListener('click', () => {
    callbacks.onResetHighScore && callbacks.onResetHighScore();
  });

  if (instructionsBtn) {
    instructionsBtn.addEventListener('click', () => {
      callbacks.onPauseForInstructions && callbacks.onPauseForInstructions();
      if (instructionsModal) instructionsModal.style.display = 'flex';
    });
  }

  if (closeInstructionsBtn) {
    closeInstructionsBtn.addEventListener('click', () => {
      if (instructionsModal) instructionsModal.style.display = 'none';

      if (callbacks.getGameStarted && !callbacks.getGameStarted()) {
        if (startMenu) startMenu.style.display = 'flex';
        return;
      }

      callbacks.onCloseInstructions && callbacks.onCloseInstructions();
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
      if (instructionsModal) instructionsModal.style.display = 'flex';
    });
  }

  return {
    setPauseButtonText(text) {
      if (pauseBtn) pauseBtn.textContent = text;
    },
    showStartMenu() {
      if (startMenu) startMenu.style.display = 'flex';
    },
    hideStartMenu() {
      if (startMenu) startMenu.style.display = 'none';
    },
    showInstructions() {
      if (instructionsModal) instructionsModal.style.display = 'flex';
    },
    hideInstructions() {
      if (instructionsModal) instructionsModal.style.display = 'none';
    }
  };
}
