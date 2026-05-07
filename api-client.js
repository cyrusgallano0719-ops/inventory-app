// API Client Helper
const API_BASE = ['localhost', '127.0.0.1', ''].includes(window.location.hostname)
  ? 'http://localhost:5000/api'
  : '/api';

let authToken = localStorage.getItem('authToken');
let authRole = localStorage.getItem('accountType') || 'user';

function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem('authToken', token);
  else localStorage.removeItem('authToken');
}

function setAuthRole(role) {
  authRole = role || 'user';
  if (role) localStorage.setItem('accountType', role);
  else localStorage.removeItem('accountType');
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

// Auth API calls
async function parseErrorResponse(response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.error || json.message || text;
  } catch {
    return text || response.statusText;
  }
}

async function apiSignup(username, password, email, accountType) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password, account_type: accountType })
  });
  if (!response.ok) throw new Error(await parseErrorResponse(response));
  return await response.json();
}

async function apiLogin(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) throw new Error(await parseErrorResponse(response));
  const data = await response.json();
  setAuthToken(data.token);
  setAuthRole(data.accountType);
  return data;
}

// Products API calls
async function apiGetProducts() {
  const response = await fetch(`${API_BASE}/products`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiAddProduct(product) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiUpdateProduct(id, product) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiDeleteProduct(id) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

// Transactions API calls
async function apiGetTransactions() {
  const response = await fetch(`${API_BASE}/transactions`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiAddTransaction(tx) {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tx)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiDeleteTransactions(filters) {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify(filters)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiGetApprovals() {
  const response = await fetch(`${API_BASE}/account-approvals`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiApproveAccount(id) {
  const response = await fetch(`${API_BASE}/account-approvals/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiRejectAccount(id) {
  const response = await fetch(`${API_BASE}/account-approvals/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiHealthCheck() {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Category API calls
async function apiGetCategories() {
  const response = await fetch(`${API_BASE}/categories`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiAddCategory(category) {
  const response = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(category)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiUpdateCategory(id, category) {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(category)
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiDeleteCategory(id) {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}
