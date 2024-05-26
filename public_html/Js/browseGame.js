// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Extract search term from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') || '';

    // Fetch all games with default values or based on search term
    fetchGames(searchTerm, '', 2000); // Default values to fetch all games

    // Get the sorting form element
    const form = document.getElementById('sortingForm'); 

    // Add an event listener to the form for the 'submit' event
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get the values from the form inputs
        const searchInput = document.getElementById('searchName').value;
        const sortOption = document.getElementById('sortName').value;
        const priceRange = document.getElementById('priceRange').value;

        // Fetch games based on the input values
        fetchGames(searchInput, sortOption, priceRange);
    });
});

// Function to fetch games based on search term, sort option, and price range
function fetchGames(searchTerm, sortOption, priceRange) {
    // Construct the URL with query parameters
    let url = `/games/getAllGames?search=${encodeURIComponent(searchTerm)}&sort=${sortOption}`;
    if(priceRange < 2000) {
        url += `&price=${priceRange}`;
    }

    // Fetch data from the server
    fetch(url)
    .then(response => response.json()) // Parse the JSON response
    .then(displayGames) // Display the games
    .catch(console.error); // Log any errors to the console
}

// Function to display the games on the web page
function displayGames(games) {
    const gamesContainer = document.querySelector('.game-list'); // Get the container element for the games
    gamesContainer.innerHTML = ''; // Clear any existing content

    // Iterate over each game and create HTML for it
    games.forEach(game => {
        gamesContainer.innerHTML += `
        <div class="game-entry m-3 p-2 border">
            <div class="row">
                <div class="col-md-3">
                    <img src="/images/Games/${game.ImagePath}" alt="${game.Title}" class="img-fluid">
                </div>
                <div class="col-md-6">
                    <h5>${game.Title}</h5>
                    <p>Game Description: ${game.Description}</p>
                </div>
                <div class="col-md-3 text-end">
                    <p class="game-price">$${game.Price.toFixed(2)}</p>
                    <a href="./Details.html?gameId=${game.Game_ID}" class="btn btn-primary">View</a>
                </div>
            </div>
        </div>`;
    });
}

// Function to update the price range label
function updatePriceRangeLabel(value) {
    let label = '$0 - $' + value; // Create the label text
    if (value == 2000) { // Special case for maximum value
        label = '> $2000';
    }
    document.getElementById('priceRangeLabel').textContent = label; // Update the label on the web page
}
