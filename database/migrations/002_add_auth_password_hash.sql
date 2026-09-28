-- Migration 002: Add authentication fields to users
ALTER TABLE users ADD COLUMN password_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
