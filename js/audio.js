// Audio module for Asteroid Dodger

// Background music
export const bgMusic = new Audio("sounds/background.mp3");

bgMusic.loop = true;                                         // Loop the music
bgMusic.volume = 1;                                         // Default volume
bgMusic.started = false;                                     // Track if music started

// Explosion effect
export const explosionSound = new Audio("sounds/explosion.mp3");
explosionSound.volume = 0.5;

 // Track mute state
let isMuted = false;

// Increment/decrement step for volume
const volumeStep = 0.1;

// Return current mute state
export function getMuted() {
  return isMuted;
}

export function setMuted(val) {
  isMuted = !!val; // Update mute state
  const muteBtn = document.getElementById('muteBtn');
  if (isMuted) {
    bgMusic.volume = 0;
    explosionSound.volume = 0;
    if (muteBtn) muteBtn.classList.add('active'); // Highlight mute button
  } else {
    bgMusic.volume = 0.75;           // Restore background volume
    explosionSound.volume = bgMusic.volume; // Sync explosion volume
    if (muteBtn) muteBtn.classList.remove('active'); // Remove highlight
  }
}

export function initAudio() {
  const volUpBtn = document.getElementById('volUp');     // Volume up button
  const volDownBtn = document.getElementById('volDown'); // Volume down button
  const muteBtn = document.getElementById('muteBtn');    // Mute button

  if (volUpBtn) {
    volUpBtn.addEventListener('click', () => {
      if (isMuted) { isMuted = false; if (muteBtn) muteBtn.classList.remove('active'); }
      bgMusic.volume = Math.min(bgMusic.volume + volumeStep, 1); // Increase volume
      explosionSound.volume = bgMusic.volume;                     // Sync effect volume
    });
  }

  if (volDownBtn) {
    volDownBtn.addEventListener('click', () => {
      if (isMuted) { isMuted = false; if (muteBtn) muteBtn.classList.remove('active'); }
      bgMusic.volume = Math.max(bgMusic.volume - volumeStep, 0); // Decrease volume
      explosionSound.volume = bgMusic.volume;                     // Sync effect volume
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;      // Toggle mute
      setMuted(isMuted);       // Apply mute state
    });
  }
}

// Initial sync of audio volumes
setMuted(isMuted);