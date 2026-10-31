-- Enquiries submitted through the website forms (shown in /admin → Leads)
CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT '',
  requirement   TEXT NOT NULL DEFAULT '',
  page          TEXT NOT NULL DEFAULT '',
  source        TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'new',
  note          TEXT NOT NULL DEFAULT '',
  ip_hash       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ip ON leads (ip_hash, created_at);
