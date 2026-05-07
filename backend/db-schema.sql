-- Database migration for role-based access control and account approval

ALTER TABLE users
  ADD COLUMN account_type TEXT NOT NULL DEFAULT 'user' CHECK(account_type IN ('user', 'cashier', 'admin', 'master_admin'));

ALTER TABLE users
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'rejected'));

-- Seed a master admin account manually if not already present.
-- Replace the password value below with a bcrypt hash if you are importing directly.
-- INSERT INTO users (username, password, email, account_type, status, createdAt)
-- VALUES ('masteradmin', '<bcrypt-password-hash>', 'masteradmin@example.com', 'master_admin', 'active', CURRENT_TIMESTAMP);
