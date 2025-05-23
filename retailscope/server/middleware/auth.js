const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../database/db');

// Authentication middleware
const requireAuth = async(req, res, next) => {
    try {
        const sessionToken = req.cookies.sessionToken;

        if (!sessionToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify session token
        const session = await db.get(
            'SELECT * FROM sessions WHERE session_token = ? AND expires_at > datetime("now")', [sessionToken]
        );

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Get user data
        const user = await db.get('SELECT * FROM users WHERE id = ?', [session.user_id]);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.account_locked) {
            return res.status(403).json({ error: 'Account is locked. Please contact support.' });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            shopName: user.shop_name
        };

        // Log successful authentication
        await logAudit(req.user.id, 'AUTH_SUCCESS', req.ip, req.headers['user-agent']);

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login handler with security features
const handleLogin = async(req, res) => {
    try {
        const { username, password } = req.body;

        // Get user
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            await logAudit(null, 'AUTH_FAILED', req.ip, req.headers['user-agent'], username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.account_locked) {
            return res.status(403).json({ error: 'Account is locked. Please contact support.' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            // Increment failed login attempts
            await db.run(
                'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [user.id]
            );

            // Check if we should lock the account
            const updatedUser = await db.get('SELECT failed_login_attempts FROM users WHERE id = ?', [user.id]);
            if (updatedUser.failed_login_attempts >= 5) {
                await db.run('UPDATE users SET account_locked = 1 WHERE id = ?', [user.id]);
                return res.status(403).json({ error: 'Account locked due to too many failed attempts' });
            }

            await logAudit(user.id, 'AUTH_FAILED', req.ip, req.headers['user-agent']);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Reset failed login attempts
        await db.run(
            'UPDATE users SET failed_login_attempts = 0, last_login = datetime("now") WHERE id = ?', [user.id]
        );

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session
        await db.run(
            'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)', [user.id, sessionToken, expiresAt]
        );

        // Set session cookie
        res.cookie('sessionToken', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expiresAt
        });

        // Log successful login
        await logAudit(user.id, 'LOGIN_SUCCESS', req.ip, req.headers['user-agent']);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                shopName: user.shop_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Registration handler with security features
const handleRegister = async(req, res) => {
    try {
        const { username, email, password, shopName } = req.body;

        // Check if username or email already exists
        const existingUser = await db.get(
            'SELECT * FROM users WHERE username = ? OR email = ?', [username, email]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.run(
            'INSERT INTO users (username, email, password_hash, shop_name) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, shopName]
        );

        // Log registration
        await logAudit(result.lastID, 'REGISTER_SUCCESS', req.ip, req.headers['user-agent']);

        res.json({
            message: 'Registration successful',
            user: {
                id: result.lastID,
                username,
                shopName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Logout handler
const handleLogout = async(req, res) => {
    try {
        const sessionToken = req.cookies.sessionToken;

        if (sessionToken) {
            // Remove session from database
            await db.run('DELETE FROM sessions WHERE session_token = ?', [sessionToken]);

            // Log logout
            if (req.user) {
                await logAudit(req.user.id, 'LOGOUT', req.ip, req.headers['user-agent']);
            }
        }

        // Clear session cookie
        res.clearCookie('sessionToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Audit logging function
async function logAudit(userId, action, ipAddress, userAgent, additionalInfo = null) {
    try {
        await db.run(
            'INSERT INTO audit_log (user_id, action, ip_address, user_agent, additional_info) VALUES (?, ?, ?, ?, ?)', [userId, action, ipAddress, userAgent, additionalInfo]
        );
    } catch (error) {
        console.error('Audit logging error:', error);
    }
}

module.exports = {
    requireAuth,
    handleLogin,
    handleRegister,
    handleLogout
};