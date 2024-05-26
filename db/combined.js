createDB.js 
const sqlite3 = require('sqlite3').verbose(); 
 
// Connect to a database named users.db, or create it if it doesn't exist 
const db = new sqlite3.Database('./gameHubDB.db', sqlite3.OPEN_READWRITE | 
sqlite3.OPEN_CREATE, (err) => { 
    if (err) { 
        console.error('Error opening database ' + err.message); 
    } else { 
        console.log('Database Created.'); 
    } 
}); 
 
createTables.js 
const sqlite3 = require('sqlite3').verbose(); 
 
// Connect to the database 
const db = new sqlite3.Database('./gameHubDB.db', (err) => { 
    if (err) { 
        console.error('Error opening database ' + err.message); 
    } else { 
        console.log('Connected to the game hub database.'); 
    } 
}); 
 
db.serialize(() => { 
    // create the Users table 
    db.run(` 
    CREATE TABLE IF NOT EXISTS Users ( 
        User_ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        Username TEXT NOT NULL, 
        Password TEXT NOT NULL, 
        Email TEXT NOT NULL, 
        FirstName TEXT, 
        LastName TEXT, 
        ProfilePicture TEXT, 
        BillingAddress TEXT, 
        City TEXT, 
        PostalCode TEXT, 
        State TEXT 
    );`, (err) => { 
        if (err) console.error('Error creating Users table ' + err.message); 
        else console.log('Users table created successfully.'); 
    }); 
 
    // create the Games table 
    db.run(` 
    CREATE TABLE IF NOT EXISTS Games ( 
        Game_ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        Title TEXT NOT NULL, 
        Description TEXT, 
        Price REAL, 
        ImagePath TEXT 
    );`, (err) => { 
        if (err) console.error('Error creating Games table ' + err.message); 
        else console.log('Games table created successfully.'); 
    }); 
 
    // create the Reviews table 
    db.run(` 
    CREATE TABLE IF NOT EXISTS Reviews ( 
        Review_ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        Game_ID INTEGER, 
        User_ID INTEGER, 
        Rating INTEGER, 
        Comment TEXT, 
        Review_Date DATE, 
        FOREIGN KEY (Game_ID) REFERENCES Games (Game_ID), 
        FOREIGN KEY (User_ID) REFERENCES Users (User_ID) 
    );`, (err) => { 
        if (err) console.error('Error creating Reviews table ' + err.message); 
        else console.log('Reviews table created successfully.'); 
    }); 
 
    // create the Transactions table 
    db.run(` 
    CREATE TABLE IF NOT EXISTS Transactions ( 
        Transaction_ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        User_ID INTEGER, 
        Game_ID INTEGER, 
        Purchase_Date DATE, 
        Amount REAL, 
        Payment_Method TEXT, 
        FOREIGN KEY (User_ID) REFERENCES Users (User_ID), 
        FOREIGN KEY (Game_ID) REFERENCES Games (Game_ID) 
    );`, (err) => { 
        if (err) console.error('Error creating Transactions table ' + 
err.message); 
        else console.log('Transactions table created successfully.'); 
    }); 
}); 
 
// Close the database connection 
db.close((err) => { 
    if (err) { 
        console.error('Error closing database ' + err.message); 
    } else { 
        console.log('Database connection closed.'); 
    } 
}); 
 
 
Database.js 
const sqlite3 = require('sqlite3').verbose(); 
let db = new sqlite3.Database('gameHubDb.db', sqlite3.OPEN_READWRITE, (err) => { 
    if (err) { 
        return console.error(err.message); 
    } 
    console.log('Connected to the gameHub database.'); 
}); 
 
module.exports = db; 
 
 