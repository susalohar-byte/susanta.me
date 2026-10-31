-- Pricing plans and FAQs, editable from /admin
CREATE TABLE IF NOT EXISTS plans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  badge       TEXT NOT NULL DEFAULT '',
  price       TEXT NOT NULL DEFAULT '',
  period      TEXT NOT NULL DEFAULT 'one-time',
  description TEXT NOT NULL DEFAULT '',
  features    TEXT NOT NULL DEFAULT '[]',
  cta         TEXT NOT NULL DEFAULT 'Choose plan',
  popular     INTEGER NOT NULL DEFAULT 0,
  sort        INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS faqs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category     TEXT NOT NULL DEFAULT 'General',
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL DEFAULT '',
  show_on_home INTEGER NOT NULL DEFAULT 0,
  sort         INTEGER NOT NULL DEFAULT 0,
  published    INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_plans_published ON plans (published, sort);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs (published, sort);
