const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, runExecute } = require('./database');
const { JWT_SECRET } = require('./middleware');
const { REGISTERABLE_ROLES } = require('./role-config');

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { username, password, email, account_type } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const accountType = REGISTERABLE_ROLES.includes(account_type) ? account_type : 'user';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await runExecute(
      'INSERT INTO users (username, password, email, account_type, status) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email || null, accountType, 'pending']
    );
    res.json({ success: true, message: 'User created' });
  } catch (err) {
    let message = 'Unable to create user';
    if (err.message.includes('users.username')) message = 'Username already exists';
    else if (err.message.includes('users.email')) message = 'Email already exists';
    else if (err.message.toLowerCase().includes('unique')) message = 'Username or email already exists';
    res.status(400).json({ error: message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const users = await runQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is awaiting approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, accountType: user.account_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, userId: user.id, username: user.username, accountType: user.account_type, status: user.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
