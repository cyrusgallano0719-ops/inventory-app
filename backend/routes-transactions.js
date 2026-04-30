const express = require('express');
const { verifyToken } = require('./middleware');
const { runQuery, runExecute } = require('./database');

const router = express.Router();

// Get all transactions for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const transactions = await runQuery(
      'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC, id DESC LIMIT 100',
      [req.userId]
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add transaction
router.post('/', verifyToken, async (req, res) => {
  const { productId, productName, type, qty, price, note, date } = req.body;
  if (!productId || !type || !qty || qty < 1) return res.status(400).json({ error: 'Invalid transaction data' });

  try {
    const result = await runExecute(
      'INSERT INTO transactions (userId, productId, productName, type, qty, price, note, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, productId, productName, type, qty, price || 0, note || '', date]
    );
    res.json({ id: result.lastID, productId, productName, type, qty, price: price || 0, note: note || '', date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transactions by filter
router.delete('/', verifyToken, async (req, res) => {
  const { type, productId, date } = req.body;
  let sql = 'DELETE FROM transactions WHERE userId = ?';
  const params = [req.userId];

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
