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
