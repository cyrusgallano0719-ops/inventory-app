const jwt = require('jsonwebtoken');
const { runQuery } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await runQuery('SELECT id, username, account_type, status FROM users WHERE id = ?', [decoded.id]);
    if (!users.length) return res.status(401).json({ error: 'Invalid token' });

    const user = users[0];
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is awaiting approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your account has been rejected.' });
    }

    req.userId = user.id;
    req.username = user.username;
    req.accountType = user.account_type;
    req.userStatus = user.status;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken, JWT_SECRET };
