export async function initializeDatabase(db: D1Database): Promise<void> {
  try {
    await db.exec('PRAGMA foreign_keys = ON;');
  } catch (error) {
    console.warn('Could not enforce PRAGMA foreign_keys = ON in D1 exec', error);
  }

  const schema = `
-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  headline TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  auto_sync_interval TEXT DEFAULT '12h',
  theme TEXT DEFAULT 'dark',
  notifications_enabled INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

-- 3. Platform Accounts (Connected Coding Profiles)
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

-- 4. Unified Problem Catalog
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

-- 5. User Problem Solves (Relational Map)
CREATE TABLE IF NOT EXISTS user_problems (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solved_at TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  metadata TEXT,
  UNIQUE(user_id, problem_id)
);

-- 6. Historical Statistics Snapshots
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

-- 7. Daily Activity Records (Submissions & Heatmap)
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

-- 8. Goals
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

-- 9. Contests
CREATE TABLE IF NOT EXISTS contests (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  external_contest_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contest_date TEXT NOT NULL,
  url TEXT,
  UNIQUE(platform, external_contest_id)
);

-- 10. User Contest Participations & Rating History
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

-- 11. Sync Audit Logs
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

-- 12. Normalized Platform Topic Counts
CREATE TABLE IF NOT EXISTS platform_topics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  topic TEXT NOT NULL,
  problem_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, platform, topic)
);

-- Production Performance Indexes
CREATE INDEX IF NOT EXISTS idx_platform_accounts_user ON platform_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stat_snapshots_platform ON stat_snapshots(platform_account_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_activity_records_user_date ON activity_records(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_user_problems_solved ON user_problems(user_id, solved_at);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON sync_logs(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_contest_results_user ON contest_results(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_topics_user ON platform_topics(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_problems_platform_external ON problems(platform, external_problem_id);
  `;

  await db.exec(schema);
}
