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
