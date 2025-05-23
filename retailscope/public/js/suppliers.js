document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // DOM Elements
    const addSupplierBtn = document.getElementById('addSupplierBtn');
    const addSupplierModal = document.getElementById('addSupplierModal');
    const closeModal = document.getElementById('closeModal');
    const cancelAdd = document.getElementById('cancelAdd');
    const addSupplierForm = document.getElementById('addSupplierForm');
    const suppliersTableBody = document.getElementById('suppliersTableBody');
    const viewPricesModal = document.getElementById('viewPricesModal');
    const closePricesModal = document.getElementById('closePricesModal');
    const pricesTableBody = document.getElementById('pricesTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // Load suppliers on page load
    loadSuppliers();

    // Event Listeners
    addSupplierBtn.addEventListener('click', () => {
        addSupplierModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        addSupplierModal.style.display = 'none';
        addSupplierForm.reset();
    });

    cancelAdd.addEventListener('click', () => {
        addSupplierModal.style.display = 'none';
        addSupplierForm.reset();
    });

    closePricesModal.addEventListener('click', () => {
        viewPricesModal.style.display = 'none';
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    addSupplierForm.addEventListener('submit', async(e) => {
        e.preventDefault();

        const supplierData = {
            name: document.getElementById('supplierName').value,
            contactPerson: document.getElementById('contactPerson').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            notes: document.getElementById('notes').value
        };

        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(supplierData)
            });

            const data = await response.json();

            if (response.ok) {
                addSupplierModal.style.display = 'none';
                addSupplierForm.reset();
                loadSuppliers(); // Refresh the suppliers list
                alert('Supplier added successfully!');
            } else {
                alert(data.error || 'Failed to add supplier. Please try again.');
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            alert('An error occurred while adding the supplier. Please try again.');
        }
    });

    async function loadSuppliers() {
        try {
            const response = await fetch('/api/suppliers');
            const suppliers = await response.json();

            if (response.ok) {
                displaySuppliers(suppliers);
            } else {
                console.error('Failed to load suppliers:', suppliers.error);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    }

    function displaySuppliers(suppliers) {
        suppliersTableBody.innerHTML = '';

        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.name}</td>
                <td>${supplier.contact_person}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.email}</td>
                <td>${supplier.address}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewPrices(${supplier.id})">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn btn-primary" onclick="editSupplier(${supplier.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteSupplier(${supplier.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            suppliersTableBody.appendChild(row);
        });
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
async function viewPrices(supplierId) {
    try {
        const response = await fetch(`/api/suppliers/${supplierId}/prices`);
        const prices = await response.json();

        if (response.ok) {
            displayPrices(prices);
            document.getElementById('viewPricesModal').style.display = 'flex';
        } else {
            alert(prices.error || 'Failed to load price history.');
        }
    } catch (error) {
        console.error('Error loading price history:', error);
        alert('An error occurred while loading price history.');
    }
}

function displayPrices(prices) {
    const pricesTableBody = document.getElementById('pricesTableBody');
    pricesTableBody.innerHTML = '';

    prices.forEach(price => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${price.product_name}</td>
            <td>${formatPrice(price.price)}</td>
            <td>${price.quantity}</td>
            <td>${formatPrice(price.unit_price)}</td>
            <td>${new Date(price.date_recorded).toLocaleDateString()}</td>
        `;
        pricesTableBody.appendChild(row);
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function editSupplier(supplierId) {
    // Implement edit functionality
    console.log('Edit supplier:', supplierId);
    // You could populate and show the edit modal here
}

async function deleteSupplier(supplierId) {
    if (!confirm('Are you sure you want to delete this supplier?')) {
        return;
    }

    try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Refresh the suppliers list
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete supplier. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('An error occurred while deleting the supplier. Please try again.');
    }
}