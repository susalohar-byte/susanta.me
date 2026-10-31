import { json, error, readJson } from '../../../_lib/http.js';
import { TABLES, listRows, insertRow } from '../../../_lib/db.js';

export async function onRequestGet({ params, env }) {
  if (!TABLES[params.table]) return error('Not found', 404);
  return json({ items: await listRows(env, params.table) });
}

export async function onRequestPost({ params, request, env }) {
  if (!TABLES[params.table]) return error('Not found', 404);
  const body = await readJson(request);
  if (!body) return error('Invalid JSON');
  try {
    return json({ item: await insertRow(env, params.table, body) }, 201);
  } catch (e) {
    return error(e.message, e.status || 400);
  }
}
