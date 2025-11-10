-- up
-- Table definition
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email CITEXT NOT NULL CHECK (char_length(email) <= 254),
  password TEXT NOT NULL
  role TEXT NOT NULL CHECK (char_length(role) <= 10) DEFAULT 'user',
  reset_password_token TEXT CHECK (char_length(role) <= 255),,
  reset_password_expiration TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name_email ON users(name, email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

-- down
DROP TABLE users;
