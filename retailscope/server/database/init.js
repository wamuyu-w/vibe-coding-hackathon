const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'retail_tracker.db'));

// Initialize database
async function initializeDatabase() {
    try {
        // Enable foreign keys
        await db.run('PRAGMA foreign_keys = ON');

        // Create users table with additional security fields
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                shop_name VARCHAR(100) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                failed_login_attempts INTEGER DEFAULT 0,
                account_locked BOOLEAN DEFAULT 0,
                reset_token VARCHAR(255),
                reset_token_expires DATETIME
            )
        `);

        // Create sessions table for better session management
        await db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create audit log for security tracking
        await db.run(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action VARCHAR(50) NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Create a test user
async function createTestUser() {
    try {
        // First, clear any existing test user
        await db.run('DELETE FROM users WHERE username = ?', ['test_user']);

        // Create new test user
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        await db.run(`
            INSERT INTO users (username, email, password_hash, shop_name)
            VALUES (?, ?, ?, ?)
        `, ['test_user', 'test@example.com', hashedPassword, 'Test Shop']);

        console.log('Test user created successfully');
        console.log('Username: test_user');
        console.log('Password: Test123!');
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

// Initialize database and create test user
initializeDatabase()
    .then(() => createTestUser())
    .then(() => {
        console.log('Database setup complete');
        process.exit(0);
    })
    .catch(error => {
        console.error('Database setup failed:', error);
        process.exit(1);
    });

// Using promises
const user = await db.asyncGet('SELECT * FROM users WHERE id = ?', [userId]);

// Using callbacks
db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log(row);
    }
});