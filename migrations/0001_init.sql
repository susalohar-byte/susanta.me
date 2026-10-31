-- Site content managed from /admin

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS projects (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'other',
  category_label TEXT NOT NULL DEFAULT '',
  location       TEXT NOT NULL DEFAULT '',
  image          TEXT NOT NULL DEFAULT '',
  url            TEXT NOT NULL DEFAULT '',
  highlight      TEXT NOT NULL DEFAULT '',
  challenge      TEXT NOT NULL DEFAULT '',
  solution       TEXT NOT NULL DEFAULT '',
  metrics        TEXT NOT NULL DEFAULT '[]',
  sort           INTEGER NOT NULL DEFAULT 0,
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  result     TEXT NOT NULL DEFAULT '',
  quote      TEXT NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5,
  sort       INTEGER NOT NULL DEFAULT 0,
  published  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT '',
  cover_image  TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  published    INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL DEFAULT (date('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_published ON posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (published, sort);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews (published, sort);
