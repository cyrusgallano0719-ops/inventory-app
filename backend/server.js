const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./database');
const authRoutes = require('./routes-auth');
const productsRoutes = require('./routes-products');
const transactionsRoutes = require('./routes-transactions');
const approvalsRoutes = require('./routes-approvals');
const categoriesRoutes = require('./routes-categories');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and then start server
initializeDatabase()
  .then(() => {
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productsRoutes);
    app.use('/api/transactions', transactionsRoutes);
    app.use('/api/account-approvals', approvalsRoutes);
    app.use('/api/categories', categoriesRoutes);

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
