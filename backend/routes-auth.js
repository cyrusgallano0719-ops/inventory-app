const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, runExecute } = require('./database');
const { JWT_SECRET } = require('./middleware');

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await runExecute(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );
    res.json({ success: true, message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, userId: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
