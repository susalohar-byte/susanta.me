-- Services, editable from /admin. Each one gets its own page at /services/{slug}.
CREATE TABLE IF NOT EXISTS services (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  tagline      TEXT NOT NULL DEFAULT '',
  summary      TEXT NOT NULL DEFAULT '',
  sticker      TEXT NOT NULL DEFAULT '',
  icon         TEXT NOT NULL DEFAULT '',
  tone         TEXT NOT NULL DEFAULT 'white',
  tags         TEXT NOT NULL DEFAULT '[]',
  card_cta     TEXT NOT NULL DEFAULT '',
  intro        TEXT NOT NULL DEFAULT '',
  visual       TEXT NOT NULL DEFAULT 'none',
  image        TEXT NOT NULL DEFAULT '',
  note         TEXT NOT NULL DEFAULT '',
  features     TEXT NOT NULL DEFAULT '[]',
  ideal_for    TEXT NOT NULL DEFAULT '[]',
  content      TEXT NOT NULL DEFAULT '',
  cta          TEXT NOT NULL DEFAULT '',
  show_on_home INTEGER NOT NULL DEFAULT 0,
  sort         INTEGER NOT NULL DEFAULT 0,
  published    INTEGER NOT NULL DEFAULT 1,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_published ON services (published, sort);
