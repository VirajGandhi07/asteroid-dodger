const API_BASE = 'http://localhost:5000';

export async function getTopScores() {
  const res = await fetch(`${API_BASE}/players/top`);
  if (!res.ok) throw new Error('Failed to fetch top scores');
  return res.json();
}

export async function getAllPlayers() {
  try {
    const res = await fetch(`${API_BASE}/players`);
    if (!res.ok) {
      console.error(`getAllPlayers failed: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch all players: ${res.status}`);
    }
    const data = await res.json();
    console.log('getAllPlayers success:', data);
    return data;
  } catch (err) {
    console.error('getAllPlayers error:', err);
    throw err;
  }
}

export async function addPlayer(name) {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to add player');
  return res.json();
}

export async function postScore(name, score) {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(name)}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score })
  });
  if (!res.ok) throw new Error('Failed to post score');
  return res.json();
}

export async function deletePlayer(name) {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to delete player');
}

export async function renamePlayer(oldName, newName) {
  const res = await fetch(`${API_BASE}/players/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldName, newName })
  });
  if (!res.ok) throw new Error('Failed to rename player');
}

export async function getAsteroids() {
  const res = await fetch(`${API_BASE}/asteroids`);
  if (!res.ok) throw new Error('Failed to fetch asteroids');
  return res.json();
}

export async function addAsteroid(asteroid) {
  const res = await fetch(`${API_BASE}/asteroids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asteroid)
  });
  if (!res.ok) throw new Error('Failed to add asteroid');
  return res.json();
}
