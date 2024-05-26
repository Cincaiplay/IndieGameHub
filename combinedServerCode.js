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


const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../db/database');

// Setup multer for file handling
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public_html/images/Games')  // save to this file
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, `${file.originalname}-${Date.now()}.${ext}`);
    }
});

const upload = multer({ storage: storage });

router.post('/uploadGame', upload.single('file'), (req, res) => {
    console.log("Received data:", req.body);
    const { name, price, description } = req.body;  
    const file = req.file;

    console.log('File uploaded: ', file.path);
    console.log('Game Name: ', name);
    
    if (!file || !name || !price || !description) {
        return res.status(400).send('All game details are required.');
    }

    // Query to insert a new game into the database
    const sql = `INSERT INTO Games (Title, Description, Price, ImagePath) VALUES (?, ?, ?, ?)`;

    db.run(sql, [name, description, price, file.filename], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Game uploaded and added to database:', name);
        res.json({ message: 'Game uploaded successfully', id: this.lastID, filePath: file.path });
    });
});


router.get('/getAllGames', (req, res) => {
    let sql = 'SELECT * FROM Games WHERE 1=1';
    const params = [];

    if (req.query.search) {
        sql += ' AND Title LIKE ?';
        params.push('%' + req.query.search + '%');
    }
    
    if (req.query.price && req.query.price < 2000) {
        sql += ' AND Price <= ?';
        params.push(req.query.price);
    }

    if (!req.query.sort || req.query.sort == 'Choose...') {
    }
    else{
        sql += ' ORDER BY Title ' + (req.query.sort === 'aToZ' ? 'ASC' : 'DESC');
    }
    // console.log(sql);

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).send({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


router.get('/getGames', (req, res) => {
    // Set a default limit or use the provided query parameter
    const limit = req.query.limit ? parseInt(req.query.limit) : 1;  // Default to 1 if no limit is provided

    if (isNaN(limit) || limit < 1 || limit > 50) { // Set a reasonable max limit to prevent abuse
        return res.status(400).json({ error: 'Invalid limit' });
    }

    console.log(`Fetching ${limit} games`);
    const sql = `SELECT * FROM Games ORDER BY Game_ID LIMIT ?`;
    
    db.all(sql, [limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.get('/getGamebyID/:gameId', (req, res) => {
    const gameId = req.params.gameId;
    db.get('SELECT * FROM Games WHERE Game_ID = ?', [gameId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).send('Game not found');
        }
    });
});

router.get('/searchGame/:name')

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/addReview', (req, res) => {
    const { game_id, user_id, rating, comment } = req.body;
    
    // Basic validation
    if (!game_id || !user_id || !rating || !comment) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Prepare SQL query to insert data
    const sql = `
        INSERT INTO Reviews (Game_ID, User_ID, Rating, Comment, Review_Date)
        VALUES (?, ?, ?, ?, ?)
    `;
    const params = [game_id, user_id, rating, comment, new Date()]; // new Date() to capture the current date

    // Execute SQL query
    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error inserting review into database:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Review added successfully', review_id: this.lastID });
    });
});

router.get('/getReviews', (req, res) => {
    const gameId = req.query.gameId;  // Assume game ID is passed as a query parameter

    if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
    }

    const sql = 'SELECT Reviews.*, Users.username FROM Reviews JOIN Users ON Reviews.User_ID = Users.User_ID WHERE Game_ID = ?';
    db.all(sql, [gameId], (err, reviews) => {
        if (err) {
            console.log(gameId);
            return res.status(500).json({ error: err.message });
        }
        res.json(reviews);
    });
});


module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db/database');


router.post('/CreateTransaction', (req, res) => {
    const { userId, gameId, amount, paymentMethod } = req.body;
    console.log(req.body);
    if (!userId || !gameId || !amount || !paymentMethod) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO Transactions (User_ID, Game_ID, Purchase_Date, Amount, Payment_Method) VALUES (?, ?, datetime('now'), ?, ?)`;
    const params = [userId, gameId, amount, paymentMethod];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Transaction recorded', transactionId: this.lastID });
    });
});

router.get('/getTransactions', (req, res) => {
    const userId = req.query.userID; 
    // console.log('Session User ID:', userId);

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized - User ID not found in session' });
    }
    // console.log('went to here');

    const sql = `SELECT Transactions.*, Games.Title AS GameName 
                 FROM Transactions 
                 JOIN Games ON Transactions.Game_ID = Games.Game_ID
                 WHERE Transactions.User_ID = ?`;
    // console.log(sql);

    db.all(sql, [userId], (err, transactions) => {
    if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: err.message });
    }
    res.json(transactions);
});

});



module.exports = router;


const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/database');

// POST endpoint for registering a user
router.post('/registerUser', async (req, res) => {
    console.log("Received data:", req.body);
    const { username, password, email } = req.body;

    // Basic validation
    if (!username || !password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Query to insert a new user into the database with the hashed password
        const sql = `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`;
        db.run(sql, [username, hashedPassword, email], function(err) {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'User registered successfully' });
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/loginUser', (req, res) => {
    console.log("Received data:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;

    db.get(sql, [username], async (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (user) {
            // Compare hashed password
            console.log("here");

            const isValid = await bcrypt.compare(password, user.Password);

            if (isValid) {
                res.json({ isValid: true });
            } else {
                res.json({ isValid: false, error: "Invalid credentials" });
            }
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

router.get('/getUserID', (req, res) => {
    const username = req.query.username; 
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    const sql = `SELECT User_ID FROM Users WHERE Username = ?`;
    db.get(sql, [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

router.get('/SaveUserID', (req, res) => {
    const { username } = req.query; 
    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    const sql = `SELECT User_ID FROM Users WHERE Username = ?`;
    db.get(sql, [username], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ User_ID: row.User_ID });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});


module.exports = router;
