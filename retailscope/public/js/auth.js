document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerCard = document.getElementById('registerCard');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.parentElement.style.display = 'none';
        registerCard.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.parentElement.style.display = 'block';
        registerCard.style.display = 'none';
    });

    // Handle Login
    loginForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard.html';
            } else {
                // Login failed
                showError(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred during login. Please try again.');
        }
    });

    // Handle Registration
    registerForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const shopName = document.getElementById('registerShopName').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (password !== confirmPassword) {
            showError('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long!');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    shopName
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Registration successful
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard.html';
            } else {
                // Registration failed
                showError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred during registration. Please try again.');
        }
    });

    // Error handling function
    function showError(message) {
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create and show new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background-color: #fee2e2;
            color: #dc2626;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            text-align: center;
            font-size: 0.9rem;
        `;
        errorDiv.textContent = message;

        // Insert error message after the form
        const activeForm = document.querySelector('.auth-form');
        activeForm.parentNode.insertBefore(errorDiv, activeForm.nextSibling);

        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Add loading state to buttons
    function setLoading(form, isLoading) {
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    // Add loading states to forms
    loginForm.addEventListener('submit', () => setLoading(loginForm, true));
    registerForm.addEventListener('submit', () => setLoading(registerForm, true));
});