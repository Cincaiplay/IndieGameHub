const sqlite3 = require('sqlite3').verbose();

// Connect to a database named users.db, or create it if it doesn't exist
const db = new sqlite3.Database('./gameHubDB.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Database Created.');
    }
});