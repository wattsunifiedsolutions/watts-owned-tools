CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  tool TEXT NOT NULL,
  source_host TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  payload TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_tool
  ON submissions(tool, created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
