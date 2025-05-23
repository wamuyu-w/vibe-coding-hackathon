document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // DOM Elements
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeModal = document.getElementById('closeModal');
    const cancelAdd = document.getElementById('cancelAdd');
    const addProductForm = document.getElementById('addProductForm');
    const productsTableBody = document.getElementById('productsTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Load products on page load
    loadProducts();

    // Event Listeners
    addProductBtn.addEventListener('click', () => {
        addProductModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        addProductModal.style.display = 'none';
        addProductForm.reset();
    });

    cancelAdd.addEventListener('click', () => {
        addProductModal.style.display = 'none';
        addProductForm.reset();
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    addProductForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('category').value,
            brand: document.getElementById('brand').value,
            unit: document.getElementById('unit').value,
            barcode: document.getElementById('barcode').value,
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();

            if (response.ok) {
                addProductModal.style.display = 'none';
                addProductForm.reset();
                loadProducts(); // Refresh the products list
                alert('Product added successfully!');
            } else {
                alert(data.error || 'Failed to add product. Please try again.');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('An error occurred while adding the product. Please try again.');
        }
    });

    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();

            if (response.ok) {
                displayProducts(products);
            } else {
                console.error('Failed to load products:', products.error);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    function displayProducts(products) {
        productsTableBody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.brand}</td>
                <td>${product.unit}</td>
                <td>${formatPrice(product.latest_price)}</td>
                <td>${formatPrice(product.best_price)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewPrices(${product.id})">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn btn-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    }

    function formatPrice(price) {
        if (!price) return 'N/A';
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
});

// Global functions for table actions
function viewPrices(productId) {
    // Implement price history view functionality
    console.log('View prices for product:', productId);
    // You could open a modal here showing price history
}

function editProduct(productId) {
    // Implement edit functionality
    console.log('Edit product:', productId);
    // You could populate and show the edit modal here
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Refresh the products list
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete product. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while deleting the product. Please try again.');
    }
}