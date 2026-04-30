const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./database');
const authRoutes = require('./routes-auth');
const productsRoutes = require('./routes-products');
const transactionsRoutes = require('./routes-transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/transactions', transactionsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
