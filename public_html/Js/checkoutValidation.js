// Wait until the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('form');
    UpdateSummary(); // Update the order summary on page load
    
    // Add an event listener to the form for the 'submit' event
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        
        // Validate form inputs
        let formIsValid = Validation();
        console.log(formIsValid);
        if (formIsValid) {
            saveTransaction(); // Save the transaction if form is valid
        }
    });
});

// Function to validate the card number
function validateCardNumber(number) {
    return number.length === 16; // Simple length check
}

// Function to validate the expiry date
function validateExpiryDate(date) {
    return /^\d{2}\/\d{2}$/.test(date); // Check for MM/YY format
}

// Function to validate the CVC code
function validateCVC(cvc) {
    return /^[0-9]{3,4}$/.test(cvc); // Check for 3 or 4 digit numeric value
}

// Function to save the transaction
async function saveTransaction() {
    var storedUsername = sessionStorage.getItem('username');
    let userID;

    // Check if the user is logged in
    if (!storedUsername) {
        console.error('User is not logged in');
        return null; // Return if no username is provided
    } else {
        try {
            // Fetch user ID from the server
            const response = await fetch(`/users/getUserID?username=${encodeURIComponent(storedUsername)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user ID');
            }
            data = await response.json();
            userID = data.User_ID;
        } catch (error) {
            console.error('Error:', error);
            return null; // Return null on error
        }
    }
    
    console.log(userID);
    const GameID = getQueryParam('gameID'); // Get the game ID from the URL
    let game = await fetchGameDetail(GameID); // Fetch game details

    // Calculate subtotal
    const subtotal = game.Price + (game.Price * 0.05) + (game.Price * 0.1);
    const transactionData = {
        userId: userID, 
        gameId: GameID, 
        amount: subtotal.toFixed(2), 
        paymentMethod: 'Credit Card'
    };
    console.log("Subtotal: " + subtotal);

    // Save transaction data to the server
    fetch('/transactions/CreateTransaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        alert('Purchase Successfully! You can play the game now.');
        window.location.href = './'; // Redirect after successful transaction
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to record transaction.');
    });
}

// Function to validate the form inputs
function Validation() {
    const nameOnCard = document.getElementById('nameOnCard');
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvc = document.getElementById('cvc');

    // Error elements
    const nameError = document.getElementById('nameOnCardError');
    const numberError = document.getElementById('cardNumberError');
    const expiryError = document.getElementById('expiryDateError');
    const cvcError = document.getElementById('cvcError');

    let formIsValid = true;

    // Clear previous errors
    nameError.textContent = '';
    numberError.textContent = '';
    expiryError.textContent = '';
    cvcError.textContent = '';

    // Validate Name on Card
    if (!nameOnCard.value.trim()) {
        nameError.textContent = 'Name on card is required.';
        formIsValid = false;
    }

    // Validate Card Number
    if (!cardNumber.value.trim()) {
        numberError.textContent = 'Card number is required.';
        formIsValid = false;
    } else if (!validateCardNumber(cardNumber.value)) {
        numberError.textContent = 'Invalid card number.';
        formIsValid = false;
    }

    // Validate Expiry Date
    if (!expiryDate.value.trim()) {
        expiryError.textContent = 'Expiry date is required.';
        formIsValid = false;
    } else if (!validateExpiryDate(expiryDate.value)) {
        expiryError.textContent = 'Invalid expiry date.';
        formIsValid = false;
    }

    // Validate CVC
    if (!cvc.value.trim()) {
        cvcError.textContent = 'CVC is required.';
        formIsValid = false;
    } else if (!validateCVC(cvc.value)) {
        cvcError.textContent = 'Invalid CVC.';
        formIsValid = false;
    }

    return formIsValid; // Return the overall form validation status
}

// Function to update the order summary with game details
async function UpdateSummary() {
    const gameId = getQueryParam('gameID'); // Get the game ID from the URL
    console.log('gameID: ' + gameId);

    try {
        let game = await fetchGameDetail(gameId); // Fetch game details
        if (game) {
            // Update the order summary with game details
            document.querySelector('.card-body').innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <p>${game.Title}:</p>
                    <p>$ ${game.Price.toFixed(2)}</p>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <p>Tax:</p>
                    <p>$ ${(game.Price * 0.05).toFixed(2)}</p> <!-- 5% tax -->
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <p>Charge:</p>
                    <p>$ ${(game.Price * 0.1).toFixed(2)}</p> <!-- 10% charge -->
                </div>
                <hr>
                <div class="d-flex justify-content-end">
                    <p><strong>Subtotal: $ ${(game.Price * 1.15).toFixed(2)}</strong></p>
                </div>`;
        } else {
            console.log('Game not found');
        }
    } catch (error) {
        console.error('Failed to load game details:', error);
    }
}

// Function to fetch game details by game ID
async function fetchGameDetail(gameID) {
    try {
        const response = await fetch(`/games/getGameByID/${gameID}`);  
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to load game details:', error);
        return null;  // Return null or appropriate value on error
    }
}

// Function to extract query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
