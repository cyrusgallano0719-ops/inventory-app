// API Client Helper
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : '/api';

let authToken = localStorage.getItem('authToken');

function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem('authToken', token);
  else localStorage.removeItem('authToken');
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

// Auth API calls
async function apiSignup(username, password, email) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password, email })
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

async function apiLogin(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  setAuthToken(data.token);
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

async function apiHealthCheck() {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
