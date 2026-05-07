const express = require('express');
const { verifyToken } = require('./middleware');
const { requireProductManager } = require('./role-middleware');
const { runQuery, runExecute } = require('./database');

const router = express.Router();

// Get all products (shared across all users)
router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await runQuery('SELECT * FROM products ORDER BY id DESC', []);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product (admin or master_admin only)
router.post('/', verifyToken, requireProductManager, async (req, res) => {
  const { name, category, stock, low, cost, sell } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name required' });

  try {
    const result = await runExecute(
      'INSERT INTO products (userId, name, category, stock, low, cost, sell) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, name, category, stock || 0, low || 5, cost || 0, sell || 0]
    );
    res.json({ id: result.lastID, name, category, stock: stock || 0, low: low || 5, cost: cost || 0, sell: sell || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (admin or master_admin only)
router.put('/:id', verifyToken, requireProductManager, async (req, res) => {
  const { name, category, stock, low, cost, sell } = req.body;
  try {
    await runExecute(
      'UPDATE products SET name=?, category=?, stock=?, low=?, cost=?, sell=? WHERE id=?',
      [name, category, stock, low, cost, sell, req.params.id]
    );
    await runExecute(
      'UPDATE transactions SET productName=? WHERE productId=?',
      [name, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (admin or master_admin only)
router.delete('/:id', verifyToken, requireProductManager, async (req, res) => {
  try {
    await runExecute('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
