// ecommerce.js - Handling Auth, Cart, and Store Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize App
    initAuth();
    initCart();
    initStore();
});

// --- Authentication Logic ---

function initAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const authItems = document.querySelectorAll('.auth-item');

    if (user) {
        // User is logged in
        authItems.forEach(item => {
            item.innerHTML = `
                <a href="#" class="btn-sm" id="logout-btn" style="border-color: var(--accent-red); color: var(--accent-red);">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
        });

        // Add logout listener
        const logoutBtns = document.querySelectorAll('#logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        });
    }

    // Handle Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            // Dummy login
            const dummyUser = { name: 'Gamer', email: email };
            localStorage.setItem('currentUser', JSON.stringify(dummyUser));
            showToast('Login Successful!', 'success');
            setTimeout(() => window.location.href = 'store.html', 1000);
        });
    }

    // Handle Signup Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            // Dummy signup
            const dummyUser = { name: name, email: email };
            localStorage.setItem('currentUser', JSON.stringify(dummyUser));
            showToast('Account Created!', 'success');
            setTimeout(() => window.location.href = 'store.html', 1000);
        });
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'info');
    setTimeout(() => window.location.reload(), 1000);
}

// --- Cart Logic ---

function initCart() {
    updateCartCount();

    // If on cart page, render items
    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    // Check if user is logged in (optional requirement from user: "user agar logined ho toh wo order kar sacke")
    // User said: "store.index ko ek ecommerce jaisa banan hai jisme user agar logined ho toh wo order kar sacke"
    // This implies ordering (checkout) requires login, but adding to cart usually doesn't.
    // However, I'll allow adding to cart without login, but require login for checkout.
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Increased quantity of ${product.name}`, 'info');
    } else {
        cart.push({ ...product, quantity: 1 });
        showToast(`${product.name} added to cart!`, 'success');
    }

    saveCart(cart);
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => el.textContent = totalItems);
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id != id);
    saveCart(cart);
    renderCartPage();
    showToast('Item removed from cart', 'info');
}

function updateQuantity(id, change) {
    let cart = getCart();
    const item = cart.find(item => item.id == id);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
    }
    
    saveCart(cart);
    renderCartPage();
}

function renderCartPage() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartContent.style.display = 'none';
        emptyCartMsg.style.display = 'block';
        return;
    }

    cartContent.style.display = 'block';
    emptyCartMsg.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                        <i class="fas fa-box"></i>
                    </div>
                    <span>${item.name}</span>
                </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">$${item.price}</td>
            <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="btn-sm" onclick="updateQuantity('${item.id}', -1)" style="padding: 2px 8px;">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-sm" onclick="updateQuantity('${item.id}', 1)" style="padding: 2px 8px;">+</button>
                </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">$${itemTotal.toFixed(2)}</td>
            <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--accent-red); cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cartItemsContainer.appendChild(tr);
    });

    subtotalEl.textContent = `$${total.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;

    // Checkout Button
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.onclick = handleCheckout;
}

function handleCheckout() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        showToast('Please login to complete your order', 'warning');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // Process Order
    showToast('Processing Order...', 'info');
    setTimeout(() => {
        localStorage.removeItem('cart');
        renderCartPage();
        showToast('Order Placed Successfully!', 'success');
        // Ideally redirect to an order confirmation page, but for now just clear cart
    }, 2000);
}

// --- Store Logic ---

function initStore() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btn = e.target;
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price)
            };
            addToCart(product);
        });
    });
}

// --- Toast Notification Helper ---

function showToast(message, type = 'info') {
    // Create toast container if not exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const colors = {
        success: 'var(--accent-green)',
        error: 'var(--accent-red)',
        info: 'var(--accent-blue)',
        warning: '#f39c12'
    };

    toast.style.cssText = `
        background: var(--bg-card);
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        border-left: 4px solid ${colors[type] || colors.info};
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        animation: slideIn 0.3s ease-out forwards;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
    `;

    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 'info-circle';

    toast.innerHTML = `<i class="fas fa-${icon}" style="color: ${colors[type]}"></i> ${message}`;

    toastContainer.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS for toast animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);