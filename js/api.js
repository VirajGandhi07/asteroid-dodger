const API_BASE = 'http://localhost:5000';

export async function getTopScores() {
  const res = await fetch(`${API_BASE}/players/top`);
  if (!res.ok) throw new Error('Failed to fetch top scores');
  return res.json();
}

export async function postScore(name, highScore) {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, highScore })
  });
  if (!res.ok) throw new Error('Failed to post score');
}

export async function getAsteroids() {
  const res = await fetch(`${API_BASE}/asteroids`);
  if (!res.ok) throw new Error('Failed to fetch asteroids');
  return res.json();
}

export async function postAsteroid(asteroid) {
  const res = await fetch(`${API_BASE}/asteroids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asteroid)
  });
  if (!res.ok) throw new Error('Failed to post asteroid');
}
