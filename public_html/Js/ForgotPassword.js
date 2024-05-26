// Function to send a password reset link to the provided email address
function sendResetLink() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value;
    
    if (!validateEmail(email)) {
        // Show an error message if the email is invalid
        emailInput.classList.add('is-invalid');
        return;  // Stop the function if the email is invalid
    } else {
        emailInput.classList.remove('is-invalid');  // Remove error class if previously added
    }

    console.log('Sending password reset link to:', email);

    // Simulate sending email
    updateModalContent();
}

// Function to validate the email format
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()); // Use regular expression to validate email format
}

// Function to update the modal content with a success message
function updateModalContent() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    // Update the modal content for success message
    modalTitle.textContent = 'Reset Link Sent';
    modalBody.innerHTML = `<p>A password reset link has been sent to your email address. Please check your inbox to continue.</p>
                           <button type="button" class="btn btn-success" data-bs-dismiss="modal">Close</button>`;
}
