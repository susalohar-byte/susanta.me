import { json, error, readJson } from '../../../_lib/http.js';
import { TABLES, getRow, updateRow, deleteRow } from '../../../_lib/db.js';

const parse = (params) => {
  const id = Number(params.id);
  return TABLES[params.table] && Number.isInteger(id) && id > 0 ? id : null;
};

export async function onRequestGet({ params, env }) {
  const id = parse(params);
  const item = id && (await getRow(env, params.table, id));
  return item ? json({ item }) : error('Not found', 404);
}

export async function onRequestPut({ params, request, env }) {
  const id = parse(params);
  if (!id) return error('Not found', 404);
  const body = await readJson(request);
  if (!body) return error('Invalid JSON');
  try {
    const item = await updateRow(env, params.table, id, body);
    return item ? json({ item }) : error('Not found', 404);
  } catch (e) {
    return error(e.message, e.status || 400);
  }
}

export async function onRequestDelete({ params, env }) {
  const id = parse(params);
  if (!id) return error('Not found', 404);
  await deleteRow(env, params.table, id);
  return json({ ok: true });
}
