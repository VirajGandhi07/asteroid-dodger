// Audio module for Asteroid Dodger
export const bgMusic = new Audio("sounds/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 1;
bgMusic.started = false;

export const explosionSound = new Audio("sounds/explosion.mp3");
explosionSound.volume = 0.5;

let isMuted = false;
const volumeStep = 0.1;

export function getMuted() {
  return isMuted;
}

export function setMuted(val) {
  isMuted = !!val;
  const muteBtn = document.getElementById('muteBtn');
  if (isMuted) {
    bgMusic.volume = 0;
    explosionSound.volume = 0;
    if (muteBtn) muteBtn.classList.add('active');
  } else {
    bgMusic.volume = 0.75;
    explosionSound.volume = bgMusic.volume;
    if (muteBtn) muteBtn.classList.remove('active');
  }
}

export function initAudio() {
  const volUpBtn = document.getElementById('volUp');
  const volDownBtn = document.getElementById('volDown');
  const muteBtn = document.getElementById('muteBtn');

  if (volUpBtn) {
    volUpBtn.addEventListener('click', () => {
      if (isMuted) {
        isMuted = false;
        if (muteBtn) muteBtn.classList.remove('active');
      }
      bgMusic.volume = Math.min(bgMusic.volume + volumeStep, 1);
      explosionSound.volume = bgMusic.volume;
    });
  }

  if (volDownBtn) {
    volDownBtn.addEventListener('click', () => {
      if (isMuted) {
        isMuted = false;
        if (muteBtn) muteBtn.classList.remove('active');
      }
      bgMusic.volume = Math.max(bgMusic.volume - volumeStep, 0);
      explosionSound.volume = bgMusic.volume;
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      setMuted(isMuted);
    });
  }
}

// Ensure initial sync
setMuted(isMuted);
