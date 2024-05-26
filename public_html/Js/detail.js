// Function to get the game ID from the URL query parameters
function getGameId() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get('gameId');
}

// Function to update the page with game details
function updatePageWithGameDetails(game) {
    document.querySelector('h1').textContent = game.name; // Update main heading
    document.querySelector('h1.mb-3').textContent = game.Title; // Update the main game title
    document.querySelector('.carousel-inner').innerHTML = `
        <div class="carousel-item active">
            <img src="/images/Games/${game.ImagePath}" class="d-block w-100" alt="Game Image 1">
        </div>`;
    document.querySelector('.card-body p').textContent = game.Description; // Update game description
    document.querySelectorAll('.game-price').forEach(el => el.textContent = `$${game.Price}`); // Update game price

    let checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        console.log('Button found');
        checkoutButton.setAttribute('href', './Checkout.html?gameID=' + game.Game_ID); // Update checkout button link
    }
}

// Function to fetch game details from the server
function fetchGameDetails(gameId) {
    fetch(`/games/getGamebyID/${gameId}`) // Adjust the URL based on your API endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(game => {
            updatePageWithGameDetails(game); // Update page with fetched game details
        })
        .catch(error => {
            console.error('Error loading the game details:', error);
        });
}

// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    const gameId = getGameId(); // Get the game ID from the URL
    if (gameId) {
        fetchGameDetails(gameId); // Fetch and display game details
        fetchReviews(gameId); // Fetch and display game reviews
    } else {
        console.error('Game ID is missing from the URL');
    }

    const addReviewButton = document.getElementById('addReviewButton');
    const reviewForm = document.getElementById('reviewForm');

    if (addReviewButton) {
        addReviewButton.addEventListener('click', function() {
            $('#addReviewModal').modal('show'); // Use jQuery to show the modal
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            const rating = document.getElementById('reviewRating').value;
            const reviewText = document.getElementById('reviewText').value;

            var storedUsername = sessionStorage.getItem('username');
            if (storedUsername) {
                fetch(`/users/getUserID?username=${encodeURIComponent(storedUsername)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch user ID');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('User ID:', data.User_ID);
                        submitReview(gameId, data.User_ID, rating, reviewText); // Submit review
                        alert('Review submitted successfully!');
                    })
                    .catch(error => console.error('Error:', error));
            } else {
                alert('User is not logged in');
            }

            $('#addReviewModal').modal('hide'); // Hide the modal after submission
            // Optionally refresh or update the page content here
        });
    }
});

// Function to submit a review to the server
function submitReview(gameId, userId, rating, comment) {
    fetch('/reviews/addReview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId, user_id: userId, rating: rating, comment: comment })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Review submitted:', data);
        alert('Review added successfully!');
    })
    .catch(error => console.error('Error submitting review:', error));
}

// Function to fetch reviews for a game from the server
function fetchReviews(gameId) {
    fetch(`/reviews/getReviews?gameId=${gameId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }
        return response.json();
    })
    .then(reviews => {
        const reviewsContainer = document.getElementById('reviewCard');
        reviewsContainer.innerHTML = '';  // Clear existing content

        // Iterate over each review and create HTML for it
        reviews.forEach(review => {
            reviewsContainer.innerHTML += `
                <div class="card mb-3">
                    <div class="card-header">
                        <h4>${review.Username}</h4>
                        Rating: ${getRatingStars(review.Rating)}
                    </div>
                    <div class="card-body">
                        <p>${review.Comment}</p>
                    </div>
                </div>
            `;
        });
    })
    .catch(error => {
        console.error('Error loading reviews:', error);
    });
}

// Function to generate star ratings for reviews
function getRatingStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '★'; // Filled star
        } else {
            stars += '☆'; // Empty star
        }
    }
    return stars;
}
