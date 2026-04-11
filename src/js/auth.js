// Auth-related logic
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const reportSection = document.getElementById('report-section');
const loginModal = document.getElementById('login-modal');
const closeModal = document.querySelector('.close-modal');
const authForm = document.getElementById('auth-form');
const modalTitle = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-auth');
const toggleAuth = document.getElementById('toggle-auth');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

let isLoginMode = true;

// Helper to clear form inputs
function clearAuthForm() {
    emailInput.value = '';
    passwordInput.value = '';
    submitBtn.disabled = false;
    submitBtn.textContent = isLoginMode ? 'Sign In' : 'Sign Up';
}

// 1. Check if user is logged in
async function checkUser() {
    const { data: { user } } = await sb.auth.getUser();

    if (user) {
        // Logged in: Show logout and report section
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        reportSection.style.display = 'block';
        console.log('Logged in as:', user.email);
        loginModal.style.display = 'none'; // Hide modal if it's open
        clearAuthForm();
    } else {
        // Not logged in: Show login button, hide report section
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        reportSection.style.display = 'none';
    }
}

// 2. Modal Controls
loginBtn.addEventListener('click', () => {
    clearAuthForm(); // Clear whenever we open the modal
    loginModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
    clearAuthForm();
});

// Close modal if user clicks outside of the box
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
        clearAuthForm();
    }
});

// 3. Toggle between Login and Signup mode
toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        modalTitle.textContent = 'Login';
        submitBtn.textContent = 'Sign In';
        toggleAuth.textContent = 'Need an account? Sign Up';
    } else {
        modalTitle.textContent = 'Create Account';
        submitBtn.textContent = 'Sign Up';
        toggleAuth.textContent = 'Already have an account? Sign In';
    }
    // Optional: Clear password when toggling mode for better UX
    passwordInput.value = '';
});

// 4. Handle Form Submission (Login or Signup)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? 'Signing in...' : 'Creating account...';

    let result;
    if (isLoginMode) {
        result = await sb.auth.signInWithPassword({ email, password });
    } else {
        result = await sb.auth.signUp({ email, password });
    }

    const { data, error } = result;

    if (error) {
        alert('Authentication Error: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Sign In' : 'Sign Up';
    } else {
        if (!isLoginMode) {
            alert('Success! Check your email for a confirmation link.');
        }
        await checkUser(); // Wait for user state to update
    }
});

// 5. Handle Logout
logoutBtn.addEventListener('click', async () => {
    const { error } = await sb.auth.signOut();
    if (error) {
        console.error('Error logging out:', error.message);
    } else {
        await checkUser();
        clearAuthForm();
        alert('Logged out successfully.');
    }
});

// Initial check on page load
checkUser();
