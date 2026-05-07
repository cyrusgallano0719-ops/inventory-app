const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.pkg
  ? path.join(path.dirname(process.execPath), 'inventory.db')
  : path.join(__dirname, 'inventory.db');

const MASTER_ADMIN_USERNAME = process.env.MASTER_ADMIN_USERNAME || 'admin123';
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL || 'admin123@example.com';
const MASTER_ADMIN_PASSWORD = process.env.MASTER_ADMIN_PASSWORD || '123qwe';
const SECOND_MASTER_ADMIN_USERNAME = 'masteradmin123';
const SECOND_MASTER_ADMIN_EMAIL = 'masteradmin123@example.com';
const SECOND_MASTER_ADMIN_PASSWORD = '123qweasd';

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
});

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
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const addColumnIfMissing = async (table, columnName, definition) => {
  const columns = await runQuery(`PRAGMA table_info(${table})`);
  const hasColumn = columns.some((column) => column.name === columnName);
  if (!hasColumn) {
    await runExecute(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
};

const seedMasterAdmin = async () => {
  const seedAccount = async (username, email, password) => {
    const existing = await runQuery('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await runExecute(
        'INSERT INTO users (username, password, email, account_type, status) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, 'master_admin', 'active']
      );
      console.log('Seeded master admin account:', username);
    }
  };

  await seedAccount(MASTER_ADMIN_USERNAME, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD);
  await seedAccount(SECOND_MASTER_ADMIN_USERNAME, SECOND_MASTER_ADMIN_EMAIL, SECOND_MASTER_ADMIN_PASSWORD);
};

const seedDefaultCategories = async () => {
  try {
    const masterAdmins = await runQuery("SELECT id FROM users WHERE account_type = 'master_admin' LIMIT 1");
    if (masterAdmins.length === 0) return;

    const userId = masterAdmins[0].id;
    const defaultCategories = [
      { name: 'Electronics', color: '#185FA5' },
      { name: 'Food & Beverage', color: '#1D9E75' },
      { name: 'Clothing', color: '#D85A30' },
      { name: 'Tools', color: '#BA7517' },
      { name: 'Other', color: '#7F77DD' }
    ];

    for (const cat of defaultCategories) {
      const existing = await runQuery('SELECT id FROM categories WHERE name = ? AND userId = ?', [cat.name, userId]);
      if (existing.length === 0) {
        await runExecute(
          'INSERT INTO categories (userId, name, color) VALUES (?, ?, ?)',
          [userId, cat.name, cat.color]
        );
      }
    }
  } catch (err) {
    console.error('Error seeding default categories:', err);
  }
};

const initializeDatabase = async () => {
  await runExecute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      account_type TEXT NOT NULL DEFAULT 'user' CHECK(account_type IN ('user', 'cashier', 'admin', 'master_admin')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'rejected')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await addColumnIfMissing(
    'users',
    'account_type',
    "account_type TEXT NOT NULL DEFAULT 'user' CHECK(account_type IN ('user', 'cashier', 'admin', 'master_admin'))"
  );
  await addColumnIfMissing(
    'users',
    'status',
    "status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'rejected'))"
  );

  await runExecute(`
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

  await runExecute(`
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

  await runExecute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#185FA5',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await seedMasterAdmin();
  await seedDefaultCategories();
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  runExecute
};
