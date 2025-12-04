// Login/Signup Event Handlers
import * as auth from './auth.js';

export function initializeLoginForm() {
  // Initialize auth system (adds demo user if not present)
  auth.initializeAuth();
  
  // Get DOM elements
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toggleSignup = document.getElementById('toggleSignup');
  const toggleLogin = document.getElementById('toggleLogin');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  
  // Form inputs
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const signupName = document.getElementById('signupName');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const signupConfirm = document.getElementById('signupConfirm');
  
  // Safety check - ensure all elements exist
  if (!loginModal || !loginForm || !signupForm || !loginBtn || !signupBtn) {
    console.error('[Login] Missing required DOM elements:', {
      loginModal: !!loginModal,
      loginForm: !!loginForm,
      signupForm: !!signupForm,
      loginBtn: !!loginBtn,
      signupBtn: !!signupBtn
    });
    return;
  }
  
  console.log('[Login] Initializing login form');
  
  // Check if already logged in (session storage - cleared on refresh)
  if (auth.isAuthenticated()) {
    console.log('[Login] User already authenticated, hiding login modal');
    loginModal.classList.add('hidden');
    return;
  }
  
  console.log('[Login] User not authenticated, showing login modal');
  
  // Toggle between login and signup forms
  if (toggleSignup) {
    toggleSignup.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[Login] Switching to signup form');
      loginForm.style.display = 'none';
      signupForm.style.display = 'flex';
    });
  }
  
  if (toggleLogin) {
    toggleLogin.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[Login] Switching to login form');
      signupForm.style.display = 'none';
      loginForm.style.display = 'flex';
    });
  }
  
  // Handle login
  loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) {
      showError(loginForm, 'Please enter email and password');
      return;
    }
    
    const result = auth.loginUser(email, password);
    
    if (result.success) {
      showSuccess(loginForm, `Welcome, ${result.user.name}!`);
      setTimeout(() => {
        loginModal.classList.add('hidden');
        window.location.reload(); // Reload to show main game
      }, 1000);
    } else {
      showError(loginForm, result.error);
    }
  });
  
  // Handle signup
  signupBtn.addEventListener('click', () => {
    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    const isAdmin = false; // All new users are non-admin by default
    
    // Validation
    if (!name || !email || !password || !confirm) {
      showError(signupForm, 'All fields are required');
      return;
    }
    
    if (password !== confirm) {
      showError(signupForm, 'Passwords do not match');
      return;
    }
    
    const result = auth.registerUser(name, email, password, isAdmin);
    
    if (result.success) {
      showSuccess(signupForm, 'Account created! Logging you in...');
      setTimeout(() => {
        // Automatically log in the new user
        const loginResult = auth.loginUser(email, password);
        if (loginResult.success) {
          loginModal.classList.add('hidden');
          window.location.reload(); // Reload to show main game
        }
      }, 1000);
    } else {
      showError(signupForm, result.error);
    }
  });
  
  // Allow login with Enter key
  loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
  
  // Allow signup with Enter key
  signupConfirm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') signupBtn.click();
  });
}

// Show error message
function showError(formElement, message) {
  // Remove existing messages
  const existing = formElement.querySelector('.auth-error');
  if (existing) existing.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'auth-error';
  errorDiv.textContent = message;
  formElement.insertBefore(errorDiv, formElement.firstChild);
}

// Show success message
function showSuccess(formElement, message) {
  // Remove existing messages
  const existing = formElement.querySelector('.auth-success');
  if (existing) existing.remove();
  
  const successDiv = document.createElement('div');
  successDiv.className = 'auth-success';
  successDiv.textContent = message;
  formElement.insertBefore(successDiv, formElement.firstChild);
}

// Add logout button to main menu
export function addLogoutToMenu() {
  const currentUser = auth.getCurrentUser();
  if (!currentUser) return;
  
  const mainMenu = document.getElementById('mainMenu');
  if (!mainMenu) return;
  
  // Check if logout button already exists
  if (document.getElementById('logoutBtn')) return;
  
  // Create logout section
  const logoutSection = document.createElement('div');
  logoutSection.style.cssText = 'text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #0f0;';
  logoutSection.innerHTML = `
    <p style="color: #0f0; margin: 0 0 10px 0;">Logged in as: <strong>${currentUser.name}</strong></p>
    <button id="logoutBtn" class="menu-btn" data-action="logout" style="background: rgba(255, 0, 0, 0.1); border-color: #f00; color: #f00;">Logout</button>
  `;
  
  mainMenu.appendChild(logoutSection);
}
