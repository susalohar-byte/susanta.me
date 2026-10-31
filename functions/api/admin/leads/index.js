import { json } from '../../../_lib/http.js';

const COLS = 'id, name, phone, business_type, requirement, page, source, status, note, created_at, updated_at';

export async function onRequestGet({ env, request }) {
  const status = new URL(request.url).searchParams.get('status');
  const stmt = status && ['new', 'contacted', 'won', 'lost'].includes(status)
    ? env.DB.prepare(`SELECT ${COLS} FROM leads WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT 2000`).bind(status)
    : env.DB.prepare(`SELECT ${COLS} FROM leads ORDER BY created_at DESC, id DESC LIMIT 2000`);
  const { results } = await stmt.all();
  return json({ items: results });
}
