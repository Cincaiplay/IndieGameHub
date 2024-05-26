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
