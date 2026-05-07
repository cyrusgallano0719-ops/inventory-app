const express = require('express');
const { verifyToken } = require('./middleware');
const { runQuery, runExecute } = require('./database');

const router = express.Router();

// Get all categories for the user
router.get('/', verifyToken, async (req, res) => {
  try {
    const categories = await runQuery('SELECT * FROM categories WHERE userId = ? ORDER BY name ASC', [req.userId]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new category (master_admin only)
router.post('/', verifyToken, async (req, res) => {
  const { name, color } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Category name required' });
  if (!color) return res.status(400).json({ error: 'Category color required' });

  // Check if user is master_admin
  const user = await runQuery('SELECT account_type FROM users WHERE id = ?', [req.userId]);
  if (!user.length || user[0].account_type !== 'master_admin') {
    return res.status(403).json({ error: 'Only master admin can manage categories' });
  }

  try {
    const existing = await runQuery('SELECT id FROM categories WHERE name = ? AND userId = ?', [name, req.userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const result = await runExecute(
      'INSERT INTO categories (userId, name, color) VALUES (?, ?, ?)',
      [req.userId, name, color]
    );
    res.json({ id: result.lastID, name, color, userId: req.userId, createdAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category (master_admin only)
router.put('/:id', verifyToken, async (req, res) => {
  const { name, color } = req.body;

  // Check if user is master_admin
  const user = await runQuery('SELECT account_type FROM users WHERE id = ?', [req.userId]);
  if (!user.length || user[0].account_type !== 'master_admin') {
    return res.status(403).json({ error: 'Only master admin can manage categories' });
  }

  try {
    const existing = await runQuery('SELECT id FROM categories WHERE name = ? AND userId = ? AND id != ?', [name, req.userId, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    await runExecute(
      'UPDATE categories SET name=?, color=? WHERE id=? AND userId=?',
      [name, color, req.params.id, req.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category (master_admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  // Check if user is master_admin
  const user = await runQuery('SELECT account_type FROM users WHERE id = ?', [req.userId]);
  if (!user.length || user[0].account_type !== 'master_admin') {
    return res.status(403).json({ error: 'Only master admin can manage categories' });
  }

  try {
    // Check if category is used by any products
    const used = await runQuery('SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?) AND userId = ?', [req.params.id, req.userId]);
    if (used[0].count > 0) {
      return res.status(400).json({ error: `Cannot delete category with ${used[0].count} product(s). Update products first.` });
    }

    await runExecute('DELETE FROM categories WHERE id=? AND userId=?', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
