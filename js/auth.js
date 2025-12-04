// Authentication module: handles login/signup with localStorage
// User accounts stored in localStorage, active session in sessionStorage (cleared on refresh)

const USERS_STORAGE_KEY = 'asteroid_dodger_users';
const CURRENT_USER_KEY = 'asteroid_dodger_current_user';
const DEMO_USER = {
  email: 'demo@test.com',
  password: 'demo123',
  name: 'Demo Admin',
  isAdmin: true
};

// Initialize demo user on first load
export function initializeAuth() {
  const users = getAllUsers();
  const demoIndex = users.findIndex(u => u.email === DEMO_USER.email);
  
  if (demoIndex === -1) {
    // Demo user doesn't exist, add it
    users.push({ ...DEMO_USER });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log('[Auth] Demo user created');
  } else {
    // Demo user exists, ensure it has admin flag
    if (!users[demoIndex].isAdmin) {
      users[demoIndex].isAdmin = true;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      console.log('[Auth] Demo user updated with admin flag');
    }
  }
  
  // If current user is demo user, update their session to ensure admin flag
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === DEMO_USER.email && !currentUser.isAdmin) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      isAdmin: true
    }));
    console.log('[Auth] Current demo user session updated with admin flag');
  }
}

// Get all registered users
export function getAllUsers() {
  const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJSON ? JSON.parse(usersJSON) : [];
}

// Save user to localStorage
export function registerUser(name, email, password, isAdmin = false) {
  const users = getAllUsers();
  
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    return { success: false, error: 'Email already registered' };
  }
  
  // Validate inputs
  if (!name || !name.trim()) {
    return { success: false, error: 'Name is required' };
  }
  
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Valid email is required' };
  }
  
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  // Add new user
  users.push({
    name: name.trim(),
    email: email.trim(),
    password: password, // In production, would hash this
    isAdmin: isAdmin || false
  });
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return { success: true };
}

// Login user
export function loginUser(email, password) {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, error: 'User not found. Please sign up first.' };
  }
  
  if (user.password !== password) {
    return { success: false, error: 'Incorrect password' };
  }
  
  // Set current user in sessionStorage (cleared on page refresh for security)
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin || false
  }));
  
  return { success: true, user: { name: user.name, email: user.email, isAdmin: user.isAdmin || false } };
}

// Get current logged-in user from sessionStorage
export function getCurrentUser() {
  const userJSON = sessionStorage.getItem(CURRENT_USER_KEY);
  return userJSON ? JSON.parse(userJSON) : null;
}

// Logout current user
export function logout() {
  sessionStorage.removeItem(CURRENT_USER_KEY);
}

// Check if user is authenticated
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Check if current user is admin
export function isAdmin() {
  const user = getCurrentUser();
  console.log('[Auth] isAdmin check - user:', user, 'isAdmin:', user ? user.isAdmin : 'no user');
  return user && user.isAdmin === true;
}
