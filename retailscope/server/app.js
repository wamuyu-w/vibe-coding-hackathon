// server/app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const { requireAuth, handleLogin, handleRegister, handleLogout } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('retail_tracker.db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'retail-tracker-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// Routes

// Authentication routes
app.post('/api/register', handleRegister);
app.post('/api/login', handleLogin);
app.post('/api/logout', handleLogout);

// Suppliers routes
app.get('/api/suppliers', requireAuth, (req, res) => {
    db.all('SELECT * FROM suppliers WHERE user_id = ? ORDER BY name', [req.session.userId], (err, suppliers) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(suppliers);
        }
    });
});

app.post('/api/suppliers', requireAuth, (req, res) => {
    const { name, contactPerson, phone, email, address, notes } = req.body;

    db.run(
        'INSERT INTO suppliers (user_id, name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.session.userId, name, contactPerson, phone, email, address, notes],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Failed to add supplier' });
            } else {
                res.json({ message: 'Supplier added successfully', id: this.lastID });
            }
        }
    );
});

// Products routes
app.get('/api/products', requireAuth, (req, res) => {
    db.all('SELECT * FROM products WHERE user_id = ? ORDER BY name', [req.session.userId], (err, products) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(products);
        }
    });
});

app.post('/api/products', requireAuth, (req, res) => {
    const { name, category, brand, unit, barcode, description } = req.body;

    db.run(
        'INSERT INTO products (user_id, name, category, brand, unit, barcode, description) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.session.userId, name, category, brand, unit, barcode, description],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Failed to add product' });
            } else {
                res.json({ message: 'Product added successfully', id: this.lastID });
            }
        }
    );
});

// Price tracking routes
app.post('/api/prices', requireAuth, (req, res) => {
    const { productId, supplierId, price, quantity = 1, notes } = req.body;
    const unitPrice = price / quantity;

    db.run(
        'INSERT INTO price_history (product_id, supplier_id, price, quantity, unit_price, notes) VALUES (?, ?, ?, ?, ?, ?)', [productId, supplierId, price, quantity, unitPrice, notes],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Failed to record price' });
            } else {
                res.json({ message: 'Price recorded successfully', id: this.lastID });
            }
        }
    );
});

// Get price comparison for a product
app.get('/api/products/:id/prices', requireAuth, (req, res) => {
    const query = `
        SELECT ph.*, s.name as supplier_name, p.name as product_name
        FROM price_history ph
        JOIN suppliers s ON ph.supplier_id = s.id
        JOIN products p ON ph.product_id = p.id
        WHERE ph.product_id = ? AND s.user_id = ?
        ORDER BY ph.date_recorded DESC
    `;

    db.all(query, [req.params.id, req.session.userId], (err, prices) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(prices);
        }
    });
});

// Dashboard analytics
app.get('/api/dashboard', requireAuth, async(req, res) => {
    try {
        // Get dashboard data
        const stats = {
            totalProducts: 0,
            totalSuppliers: 0,
            priceAlerts: 0,
            totalSavings: 0,
            bestDeals: [],
            recentPrices: []
        };

        // Get total products
        const productsResult = await db.asyncGet(
            'SELECT COUNT(*) as count FROM products WHERE user_id = ?', [req.user.id]
        );
        stats.totalProducts = productsResult.count;

        // Get total suppliers
        const suppliersResult = await db.asyncGet(
            'SELECT COUNT(*) as count FROM suppliers WHERE user_id = ?', [req.user.id]
        );
        stats.totalSuppliers = suppliersResult.count;

        // Get price alerts
        const alertsResult = await db.asyncGet(
            'SELECT COUNT(*) as count FROM price_alerts WHERE user_id = ? AND is_active = 1', [req.user.id]
        );
        stats.priceAlerts = alertsResult.count;

        // Get best deals
        const bestDeals = await db.asyncAll(`
            SELECT p.name as product_name, s.name as best_supplier,
                   MIN(ph.price) as best_price,
                   (SELECT price FROM price_history 
                    WHERE product_id = p.id 
                    ORDER BY date_recorded DESC LIMIT 1) - MIN(ph.price) as savings
            FROM products p
            JOIN price_history ph ON p.id = ph.product_id
            JOIN suppliers s ON ph.supplier_id = s.id
            WHERE p.user_id = ?
            GROUP BY p.id
            HAVING savings > 0
            ORDER BY savings DESC
            LIMIT 5
        `, [req.user.id]);
        stats.bestDeals = bestDeals;

        // Get recent price updates
        const recentPrices = await db.asyncAll(`
            SELECT p.name as product_name, ph.price, ph.date_recorded
            FROM price_history ph
            JOIN products p ON ph.product_id = p.id
            WHERE p.user_id = ?
            ORDER BY ph.date_recorded DESC
            LIMIT 10
        `, [req.user.id]);
        stats.recentPrices = recentPrices;

        res.json(stats);
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// Price alerts
app.post('/api/alerts', requireAuth, (req, res) => {
    const { productId, targetPrice, alertType } = req.body;

    db.run(
        'INSERT INTO price_alerts (user_id, product_id, target_price, alert_type) VALUES (?, ?, ?, ?)', [req.session.userId, productId, targetPrice, alertType],
        function(err) {
            if (err) {
                res.status(500).json({ error: 'Failed to create alert' });
            } else {
                res.json({ message: 'Alert created successfully', id: this.lastID });
            }
        }
    );
});

// Scheduled task to check for price alerts (runs every hour)
cron.schedule('0 * * * *', () => {
    console.log('Checking price alerts...');
    // Implementation for checking alerts and sending notifications
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;