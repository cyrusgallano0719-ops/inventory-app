const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        low INTEGER DEFAULT 5,
        cost REAL DEFAULT 0,
        sell REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        productName TEXT NOT NULL,
        type TEXT NOT NULL,
        qty INTEGER NOT NULL,
        price REAL NOT NULL,
        note TEXT,
        date DATE DEFAULT CURRENT_DATE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
  });
};

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runExecute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  runExecute
};
