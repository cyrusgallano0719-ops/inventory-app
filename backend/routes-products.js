const express = require('express');
const { verifyToken } = require('./middleware');
const { runQuery, runExecute } = require('./database');

const router = express.Router();

// Get all products for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await runQuery('SELECT * FROM products WHERE userId = ? ORDER BY id DESC', [req.userId]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product
router.post('/', verifyToken, async (req, res) => {
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

// Update product
router.put('/:id', verifyToken, async (req, res) => {
  const { name, category, stock, low, cost, sell } = req.body;
  try {
    await runExecute(
      'UPDATE products SET name=?, category=?, stock=?, low=?, cost=?, sell=? WHERE id=? AND userId=?',
      [name, category, stock, low, cost, sell, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await runExecute('DELETE FROM products WHERE id=? AND userId=?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
