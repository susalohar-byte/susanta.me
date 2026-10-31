// D1 access for settings and the three content tables.
import { slugify } from './templates.js';

export const SETTING_KEYS = [
  'logo', 'logo_white', 'favicon',
  'hero_image', 'hero_note', 'hero_title', 'hero_subtitle',
  'whatsapp', 'phone_display', 'email', 'location',
  'instagram', 'facebook', 'linkedin', 'youtube',
  'stat_1_value', 'stat_1_label', 'stat_2_value', 'stat_2_label',
  'stat_3_value', 'stat_3_label', 'stat_4_value', 'stat_4_label',
  'og_image',
];

export async function getSettings(env) {
  if (!env.DB) return {};
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(results.filter((r) => r.value !== '').map((r) => [r.key, r.value]));
}

export async function saveSettings(env, settings) {
  const stmts = [];
  for (const key of SETTING_KEYS) {
    if (!(key in settings)) continue;
    let value = String(settings[key] ?? '').trim();
    if (key === 'whatsapp') value = value.replace(/\D/g, '');
    stmts.push(value === ''
      ? env.DB.prepare('DELETE FROM settings WHERE key = ?').bind(key)
      : env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, value));
  }
  if (stmts.length) await env.DB.batch(stmts);
}

const int = (v, d = 0) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : d);
const str = (v, max = 5000) => String(v ?? '').trim().slice(0, max);
const bool = (v) => (v === true || v === 1 || v === '1' || v === 'true' ? 1 : 0);

// Per-table column definitions: name → normaliser.
export const TABLES = {
  projects: {
    order: 'sort ASC, id ASC',
    cols: {
      slug: (v, row) => slugify(v || row.title),
      title: (v) => str(v, 200),
      category: (v) => (['education', 'travel', 'health', 'beauty', 'retail', 'other'].includes(v) ? v : 'other'),
      category_label: (v) => str(v, 80),
      location: (v) => str(v, 120),
      image: (v) => str(v, 500),
      url: (v) => { const u = str(v, 300); return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; },
      highlight: (v) => str(v, 60),
      challenge: (v) => str(v, 2000),
      solution: (v) => str(v, 2000),
      metrics: (v) => JSON.stringify((Array.isArray(v) ? v : [])
        .filter((m) => m && (m.value || m.label)).slice(0, 4)
        .map((m) => ({ value: str(m.value, 30), label: str(m.label, 60) }))),
      sort: (v) => int(v),
      published: bool,
    },
    required: ['title'],
  },
  reviews: {
    order: 'sort ASC, id ASC',
    cols: {
      name: (v) => str(v, 120),
      role: (v) => str(v, 160),
      result: (v) => str(v, 80),
      quote: (v) => str(v, 2000),
      rating: (v) => Math.min(5, Math.max(1, int(v, 5))),
      sort: (v) => int(v),
      published: bool,
    },
    required: ['name', 'quote'],
  },
  plans: {
    order: 'sort ASC, id ASC',
    cols: {
      name: (v) => str(v, 80),
      badge: (v) => str(v, 40),
      price: (v) => str(v, 20),
      period: (v) => str(v, 30) || 'one-time',
      description: (v) => str(v, 300),
      features: (v) => JSON.stringify((Array.isArray(v) ? v : String(v ?? '').split('\n')).map((f) => str(f, 120)).filter(Boolean).slice(0, 15)),
      cta: (v) => str(v, 40) || 'Choose plan',
      popular: bool,
      sort: (v) => int(v),
      published: bool,
    },
    required: ['name', 'price'],
  },
  faqs: {
    order: 'sort ASC, id ASC',
    cols: {
      category: (v) => str(v, 60) || 'General',
      question: (v) => str(v, 300),
      answer: (v) => str(v, 3000),
      show_on_home: bool,
      sort: (v) => int(v),
      published: bool,
    },
    required: ['question', 'answer'],
  },
  posts: {
    order: 'published_at DESC, id DESC',
    cols: {
      slug: (v, row) => slugify(v || row.title),
      title: (v) => str(v, 200),
      excerpt: (v) => str(v, 400),
      category: (v) => str(v, 60),
      cover_image: (v) => str(v, 500),
      content: (v) => str(v, 100000),
      published: bool,
      published_at: (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : new Date().toISOString().slice(0, 10)),
    },
    required: ['title'],
    touch: true,
  },
};

const JSON_COLS = { projects: ['metrics'], plans: ['features'] };
const decode = (table, row) => {
  for (const col of (row && JSON_COLS[table]) || []) {
    try { row[col] = JSON.parse(row[col] || '[]'); } catch { row[col] = []; }
  }
  return row;
};

export async function listRows(env, table, { publishedOnly = false, limit } = {}) {
  const t = TABLES[table];
  let sql = `SELECT * FROM ${table}`;
  if (publishedOnly) sql += ' WHERE published = 1';
  sql += ` ORDER BY ${t.order}`;
  if (limit) sql += ` LIMIT ${int(limit, 10)}`;
  const { results } = await env.DB.prepare(sql).all();
  return results.map((r) => decode(table, r));
}

export async function getRow(env, table, id) {
  return decode(table, await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first());
}

export async function getPostBySlug(env, slug) {
  return env.DB.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').bind(slug).first();
}

function normalise(table, body) {
  const t = TABLES[table];
  const row = {};
  for (const [col, fn] of Object.entries(t.cols)) row[col] = fn(body[col], body);
  for (const r of t.required) if (!row[r]) throw new Error(`${r} is required`);
  return row;
}

async function assertUniqueSlug(env, table, slug, id = 0) {
  if (!('slug' in TABLES[table].cols)) return;
  const hit = await env.DB.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).bind(slug, id).first();
  if (hit) {
    const e = new Error(`The address "${slug}" is already used. Please change the slug.`);
    e.status = 409;
    throw e;
  }
}

export async function insertRow(env, table, body) {
  const row = normalise(table, body);
  await assertUniqueSlug(env, table, row.slug);
  const cols = Object.keys(row);
  const res = await env.DB.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
    .bind(...Object.values(row)).run();
  return getRow(env, table, res.meta.last_row_id);
}

export async function updateRow(env, table, id, body) {
  const row = normalise(table, body);
  await assertUniqueSlug(env, table, row.slug, id);
  const sets = Object.keys(row).map((c) => `${c} = ?`);
  if (TABLES[table].touch) sets.push("updated_at = datetime('now')");
  const res = await env.DB.prepare(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`).bind(...Object.values(row), id).run();
  if (!res.meta.changes) return null;
  return getRow(env, table, id);
}

export async function deleteRow(env, table, id) {
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
}
