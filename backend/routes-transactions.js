const express = require('express');
const { verifyToken } = require('./middleware');
const { requireTransactionRole, requireRole } = require('./role-middleware');
const { runQuery, runExecute } = require('./database');

const router = express.Router();

// Get all transactions (shared across all users)
router.get('/', verifyToken, requireTransactionRole, async (req, res) => {
  try {
    const transactions = await runQuery(
      'SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT 100',
      []
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add transaction
router.post('/', verifyToken, requireTransactionRole, async (req, res) => {
  const { productId, type, qty, price, note, date } = req.body;
  if (!productId || !type || !qty || qty < 1) return res.status(400).json({ error: 'Invalid transaction data' });

  try {
    const products = await runQuery('SELECT * FROM products WHERE id = ?', [productId]);
    if (!products.length) return res.status(404).json({ error: 'Product not found' });
    const product = products[0];

    if (type === 'out' && product.stock < qty) {
      return res.status(400).json({ error: 'Insufficient stock for sale' });
    }

    const newStock = type === 'out' ? product.stock - qty : product.stock + qty;
    await runExecute('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);

    const txDate = date || new Date().toISOString().split('T')[0];
    const result = await runExecute(
      'INSERT INTO transactions (userId, productId, productName, type, qty, price, note, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, productId, product.name, type, qty, price || 0, note || '', txDate]
    );
    res.json({ id: result.lastID, productId, productName: product.name, type, qty, price: price || 0, note: note || '', date: txDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transactions by filter (admin or master_admin only)
router.delete('/', verifyToken, requireRole(['admin', 'master_admin']), async (req, res) => {
  const { ids, type, productId, date } = req.body;
  let sql = 'DELETE FROM transactions WHERE 1=1';
  const params = [];

  if (Array.isArray(ids) && ids.length) {
    sql += ` AND id IN (${ids.map(() => '?').join(',')})`;
    params.push(...ids);
  }
  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (productId) { sql += ' AND productId = ?'; params.push(productId); }
  if (date) { sql += ' AND date = ?'; params.push(date); }

  try {
    await runExecute(sql, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
