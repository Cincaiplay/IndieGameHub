// Add click event listeners to each item in the list group
document.querySelectorAll('.list-group-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        // Remove 'active' class from all list group items
        document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        
        // Display the selected tab content
        const selectedContentId = this.getAttribute('aria-controls');
        document.getElementById(selectedContentId).style.display = 'block';
        // Add 'active' class to the clicked list group item
        this.classList.add('active');
    });
});

// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display all games
    fetch('/games/getAllGames')
    .then(response => response.json())
    .then(games => {
        const container = document.getElementById('gamesContainer');
        container.innerHTML = ''; // Clear existing content

        // Create HTML for each game and add it to the container
        games.forEach(game => {
            const gameCardHTML = `
                <div class="col-3 pt-3">
                    <div class="card">
                        <img src="images/Games/${game.ImagePath}" class="card-img-top" alt="${game.Title}">
                        <div class="card-body">
                            <h5 class="card-title">${game.Title}</h5>
                            <p class="card-text">Price: $${game.Price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += gameCardHTML;
        });
    })
    .catch(error => {
        console.error('Failed to fetch games:', error);
    });

    var storedUserID = sessionStorage.getItem('userID');

    // Fetch and display transaction history for the logged-in user
    fetch('/transactions/getTransactions?userID=' + storedUserID)
    .then(response => response.json())
    .then(transactions => {
        console.log('Transactions found');
        const tbody = document.querySelector('#paymentHistory tbody');
        tbody.innerHTML = ''; // Clear existing rows
        // Create HTML for each transaction and add it to the table body
        transactions.forEach((transaction, index) => {
            const row = `
                <tr>
                    <th scope="row">${index + 1}</th>
                    <td>${new Date(transaction.Purchase_Date).toLocaleDateString()}</td>
                    <td>$${transaction.Amount.toFixed(2)}</td>
                    <td>${transaction.GameName}</td>
                    <td>${transaction.Payment_Method}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    })
    .catch(error => {
        console.error('Error loading transactions:', error);
    });
});

// Function to handle game submission
function submitGame() {
    const gameName = document.getElementById('gameName').value;
    const gamePrice = document.getElementById('gamePrice').value;
    const gameDescription = document.getElementById('gameDescription').value;
    const gameFile = document.getElementById('gameFile').files[0];

    // Validate that all fields are filled in
    if (!gameName || !gameFile || !gamePrice || !gameDescription) {
        alert('Please fill in all fields.');
        return;
    }

    const formData = new FormData();
    formData.append('name', gameName);
    formData.append('price', gamePrice);
    formData.append('description', gameDescription);
    formData.append('file', gameFile);

    // Submit the game data to the server
    fetch('/games/uploadGame', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Game uploaded successfully!');
        var myModal = bootstrap.Modal.getInstance(document.getElementById('uploadGameModal'));
        myModal.hide(); // Hide the modal using Bootstrap 5 instance method
        location.reload(); // Reload the page to update the game list
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading game.');
    });
}
