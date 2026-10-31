import { json, error, readJson } from '../../../_lib/http.js';

const STATUSES = ['new', 'contacted', 'won', 'lost'];

export async function onRequestPut({ params, request, env }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return error('Not found', 404);
  const body = (await readJson(request)) || {};
  const status = STATUSES.includes(body.status) ? body.status : null;
  const note = body.note === undefined ? null : String(body.note).slice(0, 2000);
  if (!status && note === null) return error('Nothing to update');
  await env.DB.prepare("UPDATE leads SET status = COALESCE(?, status), note = COALESCE(?, note), updated_at = datetime('now') WHERE id = ?")
    .bind(status, note, id).run();
  const item = await env.DB.prepare('SELECT id, name, phone, business_type, requirement, page, source, status, note, created_at, updated_at FROM leads WHERE id = ?').bind(id).first();
  return item ? json({ item }) : error('Not found', 404);
}

export async function onRequestDelete({ params, env }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return error('Not found', 404);
  await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
