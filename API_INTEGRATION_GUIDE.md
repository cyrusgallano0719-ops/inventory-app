# Frontend to Backend Migration Guide

## Step 1: Add the API Client

The `api-client.js` file provides helper functions for all API calls:
- `apiLogin(username, password)` - Authenticate user
- `apiGetProducts()` - Fetch user's products
- `apiAddProduct(product)` - Create product
- `apiUpdateProduct(id, product)` - Update product
- `apiDeleteProduct(id)` - Delete product
- `apiGetTransactions()` - Fetch user's transactions
- `apiAddTransaction(tx)` - Record transaction
- `apiDeleteTransactions(filters)` - Clear transactions

## Step 2: Add to index.html

Include before the closing `</head>`:
```html
<script src="api-client.js"></script>
```

## Step 3: Add Login UI

Add a login page div to show before the main app loads:
```html
<div id="auth-page" class="auth-container">
  <div class="auth-form">
    <h1>Inventra</h1>
    <input id="auth-username" placeholder="Username" type="text">
    <input id="auth-password" placeholder="Password" type="password">
    <button onclick="handleLogin()">Login</button>
    <p><small>Don't have an account? <a href="#" onclick="toggleSignup()">Sign up</a></small></p>
  </div>
</div>
```

## Step 4: Example Migration - Get Products

### Before (in-memory):
```javascript
function renderInventory() {
  const filtered = products.filter(...);
  // render...
}
```

### After (with API):
```javascript
async function renderInventory() {
  try {
    products = await apiGetProducts();
    const filtered = products.filter(...);
    // render...
  } catch (err) {
    alert('Error loading products: ' + err.message);
  }
}
```

## Step 5: Example Migration - Add Product

### Before:
```javascript
function saveProduct() {
  products.push({ id: nextId++, ... });
  renderInventory();
}
```

### After:
```javascript
async function saveProduct() {
  try {
    const product = {
      name: document.getElementById('f-name').value,
      category: document.getElementById('f-cat').value,
      stock: parseInt(document.getElementById('f-stock').value),
      low: parseInt(document.getElementById('f-low').value),
      cost: parseFloat(document.getElementById('f-cost').value),
      sell: parseFloat(document.getElementById('f-sell').value)
    };
    await apiAddProduct(product);
    closeModal('add-modal');
    renderInventory();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}
```

## Step 6: Auth Token Management

The `api-client.js` automatically:
- Stores JWT token in localStorage after login
- Includes token in Authorization header for all requests
- Clears token on logout

## Step 7: Migrate All Functions

Apply the same pattern to:
- `openTxModal()` - Load products list
- `saveTx()` - Record transaction via API
- `clearTransactions()` - Use API delete endpoint
- `deleteProduct()` - Use API delete endpoint
- All chart and stats rendering functions

## Deployment

When deploying to Vercel:
1. Backend should be deployed to a separate service (e.g., Render, Railway, Heroku)
2. Update API_BASE in `api-client.js` to point to production backend
3. Or use environment variables in the frontend

## Testing

1. Start backend: `npm run backend`
2. Start frontend: `npm start`
3. Backend API will be on http://localhost:5000/api
4. Frontend on http://localhost:3000
