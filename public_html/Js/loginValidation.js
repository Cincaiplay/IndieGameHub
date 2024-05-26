// Add an event listener to the window load event
window.addEventListener('load', function() {
    const form = document.getElementById('loginForm');
    var storedUsername = sessionStorage.getItem('username');

    // Redirect to the homepage if the user is already logged in
    if (storedUsername) {
        window.location.href = './';
    }
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();  // Prevent the default form submission behavior

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const usernameError = document.getElementById('usernameError');
            const passwordError = document.getElementById('passwordError');

            // Clear previous errors
            usernameError.textContent = '';
            passwordError.textContent = '';

            if (username && password) {
                console.log('Validation passed, attempting login...');
                // Validate credentials
                AccValidation(username, password).then(isValid => {
                    if (isValid) {
                        // Store username in session storage and redirect to homepage
                        sessionStorage.setItem('username', username);
                        console.log('Redirecting...');
                        fetchAndStoreUserID();
                        window.location.href = './';
                    } else {
                        // Display error if credentials are invalid
                        console.error('Login failed: Invalid credentials.');
                        passwordError.textContent = 'Invalid username or password.';
                    }
                }).catch(err => {
                    // Display server error
                    console.error('Login error:', err);
                    passwordError.textContent = 'Server error. Try again later.';
                });
            } else {
                // Display error messages for missing fields
                if (!username) {
                    usernameError.textContent = 'Username is required.';
                }
                if (!password) {
                    passwordError.textContent = 'Password is required.';
                }
            }
        });
    } else {
        console.error("Form not found");
    }
});

// Function to validate account credentials
function AccValidation(username, password) {
    return fetch('/users/loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => data.isValid) // Return whether the credentials are valid
    .catch(error => {
        console.error('Fetch error:', error);
        throw error;
    });
}

// Function to fetch user ID and store it in session storage
function fetchAndStoreUserID() {
    const username = sessionStorage.getItem('username');
    console.log(username);
    if (!username) {
        console.log("Username not stored in session");
        return;
    }

    fetch(`/users/SaveUserID?username=${encodeURIComponent(username)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user ID');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.User_ID) {
            sessionStorage.setItem('userID', data.User_ID); // Store user ID in sessionStorage
        } else {
            console.error('User ID not found in response');
        }
    })
    .catch(error => console.error('Failed to fetch user ID:', error));
}
