const express = require('express');
const { verifyToken } = require('./middleware');
const { requireApprovalRole } = require('./role-middleware');
const { runQuery, runExecute } = require('./database');

const router = express.Router();

// List pending accounts for master admin approval
router.get('/', verifyToken, requireApprovalRole, async (req, res) => {
  try {
    const pendingUsers = await runQuery(
      "SELECT id, username, email, account_type, status, createdAt FROM users WHERE status = 'pending' ORDER BY createdAt DESC"
    );
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a pending account
router.post('/:id/approve', verifyToken, requireApprovalRole, async (req, res) => {
  try {
    await runExecute('UPDATE users SET status = ? WHERE id = ? AND status = ?', ['active', req.params.id, 'pending']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject a pending account
router.post('/:id/reject', verifyToken, requireApprovalRole, async (req, res) => {
  try {
    await runExecute('UPDATE users SET status = ? WHERE id = ? AND status = ?', ['rejected', req.params.id, 'pending']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
