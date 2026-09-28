-- Migration 001: Initial CodePulse Schema
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  headline TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  auto_sync_interval TEXT DEFAULT '12h',
  theme TEXT DEFAULT 'dark',
  notifications_enabled INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'connected',
  last_synced_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  external_problem_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT,
  url TEXT,
  difficulty TEXT NOT NULL,
  topic TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(platform, external_problem_id)
);

CREATE TABLE IF NOT EXISTS user_problems (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solved_at TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  metadata TEXT,
  UNIQUE(user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS stat_snapshots (
  id TEXT PRIMARY KEY,
  platform_account_id TEXT NOT NULL REFERENCES platform_accounts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  total_solved INTEGER NOT NULL DEFAULT 0,
  easy_solved INTEGER NOT NULL DEFAULT 0,
  medium_solved INTEGER NOT NULL DEFAULT 0,
  hard_solved INTEGER NOT NULL DEFAULT 0,
  rating REAL,
  rank INTEGER,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_submissions INTEGER NOT NULL DEFAULT 0,
  active_days INTEGER NOT NULL DEFAULT 0,
  recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  activity_date TEXT NOT NULL,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  submissions INTEGER NOT NULL DEFAULT 0,
  rating_change REAL DEFAULT 0,
  metadata TEXT,
  UNIQUE(user_id, platform, activity_date)
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  target REAL NOT NULL,
  platform TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contests (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  external_contest_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contest_date TEXT NOT NULL,
  url TEXT,
  UNIQUE(platform, external_contest_id)
);

CREATE TABLE IF NOT EXISTS contest_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contest_id TEXT NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  rank INTEGER,
  problems_solved INTEGER,
  rating_before REAL,
  rating_after REAL,
  rating_change REAL,
  recorded_at TEXT NOT NULL,
  UNIQUE(user_id, contest_id)
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  records_processed INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS platform_topics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  topic TEXT NOT NULL,
  problem_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, platform, topic)
);
