# 🛒 RetailScope - Price Tracker

> **Smart supplier price tracking and comparison tool for retail shopkeepers**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://sqlite.org/)

## 🎯 Overview

RetailScope is a comprehensive price tracking solution designed specifically for retail shopkeepers to monitor supplier prices, identify the best deals, and make informed purchasing decisions. Built during a 4-day hackathon, it combines simplicity with powerful analytics to help small businesses maximize their profit margins.

## ✨ Features

### 🏪 **Core Functionality**
- **Price Tracking**: Record and monitor prices from multiple suppliers
- **Supplier Management**: Maintain detailed supplier information and reliability scores
- **Product Catalog**: Organize products with categories, brands, and specifications
- **Price Comparison**: Side-by-side comparison of supplier prices

### 📊 **Smart Analytics**
- **Dashboard Insights**: Visual overview of price trends and savings opportunities
- **Best Deal Finder**: Automatically identify the most cost-effective suppliers
- **Historical Analysis**: Track price changes over time with interactive charts
- **Savings Calculator**: Calculate potential cost savings from price optimization

### 🔔 **Automation & Alerts**
- **Price Alerts**: Get notified when prices drop below target thresholds
- **Trend Analysis**: Identify seasonal price patterns
- **Supplier Scoring**: Automatic reliability ratings based on price consistency

### 📱 **User Experience**
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Interface**: Clean, modern UI designed for ease of use
- **Quick Actions**: Fast price entry and comparison tools
- **Real-time Updates**: Live dashboard with instant price updates

## 🛠️ Tech Stack

### **Frontend**
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js for data visualization
- Responsive CSS Grid & Flexbox
- Font Awesome icons

### **Backend**
- Node.js with Express.js
- SQLite database
- Session-based authentication
- RESTful API design

### **Additional Tools**
- bcrypt for password hashing
- node-cron for scheduled tasks
- Express sessions for user management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/retailscope.git
   cd retailscope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # The SQLite database will be created automatically on first run
   # Or manually create it using the schema in /database/schema.sql
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Sample Data (Optional)
To quickly test the application with sample data:
```bash
npm run seed
```

## 📁 Project Structure

```
retailscope/
├── server/
│   ├── app.js              # Main Express server
│   ├── routes/             # API route handlers
│   ├── database/           # Database setup and schema
│   └── utils/              # Helper functions
├── public/
│   ├── index.html          # Landing page
│   ├── dashboard.html      # Main dashboard
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   └── assets/             # Images and icons
├── data/
│   └── sample-data.json    # Sample data for testing
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Add new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Price Tracking
- `POST /api/prices` - Record new price
- `GET /api/products/:id/prices` - Get price history for product
- `GET /api/dashboard` - Get dashboard analytics

### Alerts
- `POST /api/alerts` - Create price alert
- `GET /api/alerts` - Get active alerts
- `DELETE /api/alerts/:id` - Delete alert

## 🎨 Screenshots

### Dashboard Overview
![Dashboard](screenshots/dashboard.png)

### Price Comparison
![Price Comparison](screenshots/price-comparison.png)

### Mobile View
![Mobile Interface](screenshots/mobile-view.png)

## 🏗️ Development

### Running in Development Mode
```bash
# Install nodemon for auto-reload
npm install -g nodemon

# Start with auto-reload
npm run dev
```

### Adding New Features
1. Backend routes go in `/server/routes/`
2. Frontend pages go in `/public/`
3. Database changes should update `/database/schema.sql`
4. Add API documentation for new endpoints

### Database Schema
The application uses SQLite with the following main tables:
- `users` - User accounts and shop information
- `suppliers` - Supplier contact and reliability data
- `products` - Product catalog with categories
- `price_history` - Historical price records
- `price_alerts` - User-defined price alert rules

## 📊 Use Cases

### Small Retail Shops
- Track wholesale prices from different distributors
- Identify the best deals for inventory restocking
- Monitor price trends for seasonal planning

### Restaurant Owners
- Compare ingredient prices from various suppliers
- Track food cost fluctuations
- Optimize purchasing timing for cost savings

### E-commerce Sellers
- Monitor competitor and supplier pricing
- Identify profitable product opportunities
- Manage supplier relationships effectively



## 🏆 Hackathon Achievement

This project was developed during a 4-day hackathon and demonstrates:
- Rapid prototyping and development
- Real-world problem solving
- Modern web development practices
- User-centered design approach

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/retailscope/issues)
- **Email**: support@retailscope.com
- **Documentation**: [Wiki](https://github.com/yourusername/retailscope/wiki)

## 🙏 Acknowledgments

- Chart.js for beautiful data visualizations
- Font Awesome for icons
- The hackathon organizers and mentors
- Beta testers and early adopters

---

<p align="center">
  <strong>Built with ❤️ for retail shopkeepers everywhere</strong>
</p>

<p align="center">
  <a href="#top">Back to Top</a>
</p>
