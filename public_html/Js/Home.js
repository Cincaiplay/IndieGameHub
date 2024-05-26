// Fetch and display games for ads carousel on page load
document.addEventListener('DOMContentLoaded', function() {
    fetch('/games/getGames?limit=3')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(games => {
        console.log('Ads Games loaded');
        if (games && games.length) {
            const carouselIndicators = document.querySelector('#AdsCarousel .carousel-indicators');
            const carouselInner = document.querySelector('#AdsCarousel .carousel-inner');

            // Create carousel indicators and items for each game
            games.forEach((game, index) => {
                // Create carousel indicator for each game
                const indicator = document.createElement('button');
                indicator.setAttribute('type', 'button');
                indicator.setAttribute('data-bs-target', '#AdsCarousel');
                indicator.setAttribute('data-bs-slide-to', index);
                indicator.className = index === 0 ? 'active' : '';
                indicator.setAttribute('aria-current', index === 0 ? 'true' : 'false');
                indicator.setAttribute('aria-label', `Slide ${index + 1}`);
                carouselIndicators.appendChild(indicator);

                // Create carousel item for each game
                const item = document.createElement('div');
                item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                item.innerHTML = `
                    <a href="/Details.html?gameId=${game.Game_ID}">
                        <img src="images/Games/${game.ImagePath}" alt="${game.Title}" class="d-block w-100">
                        <div class="carousel-caption d-none d-md-block">
                            <h3>${game.Title}</h3>
                        </div>
                    </a>
                `;
                carouselInner.appendChild(item);
            });
        }
    })
    .catch(error => console.error('Failed to load games:', error));
});

// Fetch and display featured games carousel on page load
document.addEventListener('DOMContentLoaded', function() {
    fetch('/games/getGames?limit=8')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(games => {
        console.log('Featured Games loaded');
        if (games && games.length) {
            const carouselIndicators = document.querySelector('#featuredGamesCarousel .carousel-indicators');
            const carouselInner = document.querySelector('#featuredGamesCarousel .carousel-inner');
            let itemsHtml = '';
            let indicatorsHtml = '';
            let itemActiveClass = 'active';

            // Group games into slides
            for (let i = 0; i < games.length; i += 4) {
                let rowContent = '';
                for (let j = i; j < i + 4 && j < games.length; j++) {
                    rowContent += `
                        <div class="col-12 col-md-3 mb-3 pt-2 pb-4">
                            <a href="./Details.html?gameId=${games[j].Game_ID}">
                                <div class="card">
                                    <img src="images/Games/${games[j].ImagePath}" class="card-img-top" alt="${games[j].Title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${games[j].Title}</h5>
                                        <p class="card-text">${truncateDescription(games[j].Description, 80)}</p>
                                        <p class="price">$${games[j].Price}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
                }

                // Add the row to the carousel item
                itemsHtml += `
                    <div class="carousel-item ${itemActiveClass}">
                        <div class="row">${rowContent}</div>
                    </div>
                `;

                // Add indicator
                indicatorsHtml += `
                    <button type="button" data-bs-target="#featuredGamesCarousel" data-bs-slide-to="${i / 4}" class="${itemActiveClass}" aria-current="true" aria-label="Slide ${i / 4 + 1}"></button>
                `;

                itemActiveClass = ''; // Only the first item should be active
            }

            carouselInner.innerHTML = itemsHtml;
            carouselIndicators.innerHTML = indicatorsHtml;

            // Initialize or refresh the carousel using Bootstrap's JavaScript
            var carouselElement = document.querySelector('#featuredGamesCarousel');
            var carouselInstance = new bootstrap.Carousel(carouselElement, {
                interval: 5000,
                wrap: true
            });
        }
    })
    .catch(error => console.error('Error loading games:', error));
});

// Function to truncate long descriptions
function truncateDescription(description, maxChars) {
    if (description.length > maxChars) {
        return description.substring(0, maxChars) + "...";
    }
    return description;
}

// Fetch and display all games for browsing on page load
document.addEventListener('DOMContentLoaded', function() {
    var storedUsername = sessionStorage.getItem('username');
    var userID = sessionStorage.getItem('userID');
    console.log(storedUsername);
    console.log(userID);
    fetch('/games/getGames?limit=8')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(games => {
        const container = document.getElementById('BrowseAllGames');
        games.forEach(game => {
            const gameCol = document.createElement('div');
            gameCol.className = 'col-md-3 mb-4';
            gameCol.innerHTML = `
                <div class="bg-light border">
                    <a href="./Details.html?gameId=${game.Game_ID}">
                        <img src="images/Games/${game.ImagePath}" alt="${game.Title}" class="img-fluid">
                    </a>
                </div>
            `;
            container.appendChild(gameCol);
        });
    })
    .catch(error => console.error('Error loading games:', error));
});
