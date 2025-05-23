document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // Set shop name
    document.getElementById('userShopName').textContent = user.shopName;

    // Initialize charts and load data
    initializeCharts();
    loadDashboardData();

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});

async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        if (response.ok) {
            updateDashboardStats(data);
            updateBestDeals(data.bestDeals);
            updateRecentActivity(data.recentPrices);
        } else {
            console.error('Failed to load dashboard data:', data.error);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateDashboardStats(data) {
    document.getElementById('totalProducts').textContent = data.totalProducts || 0;
    document.getElementById('totalSuppliers').textContent = data.totalSuppliers || 0;
    document.getElementById('priceAlerts').textContent = data.priceAlerts || 0;
    document.getElementById('totalSavings').textContent = formatPrice(data.totalSavings || 0);
}

function updateBestDeals(deals) {
    const bestDealsList = document.getElementById('bestDealsList');
    bestDealsList.innerHTML = '';

    if (!deals || deals.length === 0) {
        bestDealsList.innerHTML = '<p class="text-secondary">No deals available</p>';
        return;
    }

    deals.forEach(deal => {
        const dealElement = document.createElement('div');
        dealElement.className = 'best-deals-item';
        dealElement.innerHTML = `
            <div class="deal-info">
                <h4>${deal.product_name}</h4>
                <div class="deal-supplier">${deal.best_supplier}</div>
            </div>
            <div class="deal-savings">
                <div class="savings-amount">${formatPrice(deal.savings)}</div>
                <div class="deal-supplier">Best: ${formatPrice(deal.best_price)}</div>
            </div>
        `;
        bestDealsList.appendChild(dealElement);
    });
}

function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = '';

    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<p class="text-secondary">No recent activity</p>';
        return;
    }

    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        activityElement.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.product_name} price updated</div>
                <div class="activity-time">${new Date(activity.date_recorded).toLocaleString()}</div>
            </div>
            <div class="price-badge">
                ${formatPrice(activity.price)}
            </div>
        `;
        activityList.appendChild(activityElement);
    });
}

function initializeCharts() {
    const ctx = document.getElementById('priceTrendsChart').getContext('2d');

    // Sample data - replace with actual data from API
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Average Price',
            data: [65, 59, 80, 81, 56, 55],
            fill: false,
            borderColor: '#667eea',
            tension: 0.4
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Price Trends Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });

        if (response.ok) {
            localStorage.removeItem('user');
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}