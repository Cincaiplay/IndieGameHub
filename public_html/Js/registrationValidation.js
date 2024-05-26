// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();  // Always prevent default form submission

            // Retrieve input values and trim whitespace
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirm-password').value.trim();

            // Retrieve error display elements
            const usernameError = document.getElementById('usernameError');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            const confirmPasswordError = document.getElementById('confirmPasswordError');

            // Clear previous error messages
            usernameError.textContent = '';
            emailError.textContent = '';
            passwordError.textContent = '';
            confirmPasswordError.textContent = '';

            let error = false; // Flag to track validation errors

            // Validate username
            if (!username) {
                usernameError.textContent = 'Username is required.';
                error = true;
            }

            // Validate email
            if (!email) {
                emailError.textContent = 'Email is required.';
                error = true;
            } else if (!validateEmail(email)) {
                emailError.textContent = 'Please enter a valid email address.';
                error = true;
            }

            // Validate password
            if (!password) {
                passwordError.textContent = 'Password is required.';
                error = true;
            }

            // Validate confirm password
            if (!confirmPassword) {
                confirmPasswordError.textContent = 'Please re-enter password';
                error = true;
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                confirmPasswordError.textContent = 'Passwords do not match.';
                error = true;
            }

            // If no validation errors, proceed to submit the form
            if (!error) {
                console.log('All validations passed, ready to submit form.');
                
                // Prepare data for sending
                const formData = {
                    username: username,
                    password: password,
                    email: email
                };
                
                console.log("Sending data:", formData);

                // Send data to the server using Fetch API
                fetch('/users/registerUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                    alert('Registration successful! Go to Login now');
                    window.location.href = './Login.html';  // Redirect after successful registration
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error submitting form.');
                });
            }
        });
    }
});

// Function to validate the email format using a regular expression
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
