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
