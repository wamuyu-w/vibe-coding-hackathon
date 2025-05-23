const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(
    path.join(__dirname, 'retail_tracker.db'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error('Error opening database:', err);
        } else {
            console.log('Connected to the SQLite database');
            // Enable foreign keys
            db.run('PRAGMA foreign_keys = ON');
        }
    }
);

// Promisify database methods
db.asyncGet = function(sql, params) {
    return new Promise((resolve, reject) => {
        this.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.asyncAll = function(sql, params) {
    return new Promise((resolve, reject) => {
        this.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

db.asyncRun = function(sql, params) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

// Handle database errors
db.on('error', (err) => {
    console.error('Database error:', err);
});

// Handle process termination
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

module.exports = db;