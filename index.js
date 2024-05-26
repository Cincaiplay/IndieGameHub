// The package for the web server
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
// Additional package for logging of HTTP requests/responses
const morgan = require('morgan');
const app = express();
const port = 3000;

// Include the logging for all requests
app.use(morgan('common'));

// Tell our application to serve all the files under the `public_html` directory
app.use(express.static('public_html'));
app.use(bodyParser.json()); // Parsing JSON bodies

// Routers
const gamesRouter = require('./routes/games');
const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews');
const transactionsRouter = require('./routes/transactions');

// Use routers
app.use('/games', gamesRouter);
app.use('/users', usersRouter);
app.use('/reviews', reviewsRouter);
app.use('/transactions', transactionsRouter);

app.get('/', (req, resp) =>{
    resp.redirect('Home.html');
})

// Open the database (temporary for database viewing.)
let db = new sqlite3.Database('./gameHubDb.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
});

app.get('/checkDB', (req, res) => {
    let responseData = {}; // Object to hold all response data

    db.serialize(() => {
        db.all("SELECT * FROM users", (err, rows) => {
            if (err) {
                console.error("Error fetching user data:", err.message);
                return res.status(500).send("Error fetching user data: " + err.message);
            }
            responseData.users = { tableName: 'users', data: rows };

            // Query for games
            db.all("SELECT * FROM Games", (err, rows) => {
                if (err) {
                    console.error("Error fetching game data:", err.message);
                    return res.status(500).send("Error fetching game data: " + err.message);
                }
                responseData.games = { tableName: 'games', data: rows };

                // Query for reviews
                db.all("SELECT * FROM Reviews", (err, rows) => {
                    if (err) {
                        console.error("Error fetching review data:", err.message);
                        return res.status(500).send("Error fetching review data: " + err.message);
                    }
                    responseData.reviews = { tableName: 'reviews', data: rows };

                    // Query for transactions
                    db.all("SELECT * FROM Transactions", (err, rows) => {
                        if (err) {
                            console.error("Error fetching transaction data:", err.message);
                            return res.status(500).send("Error fetching transaction data: " + err.message);
                        }
                        responseData.transactions = { tableName: 'transactions', data: rows };

                        // Send all data as a single JSON response
                        res.json(responseData);
                    });
                });
            });
        });
    });
});




app.use( (error, request, response, next)  => {
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    let errorStatus = error.status || 500;
    response.status(errorStatus);
    response.send('ERROR('+errorStatus+'): ' + error.toString());
 })


// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, () => {
   // When the application starts, print to the console that our app is
   // running at http://localhost:3000. Print another message indicating
   // how to shut the server down.
   console.log(`Web server running at: http://localhost:${port}`);
   console.log(`Type Ctrl+C to shut down the web server`);
})