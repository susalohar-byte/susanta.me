import { json, error, readJson } from '../../_lib/http.js';
import { getSettings, saveSettings } from '../../_lib/db.js';

export const onRequestGet = async ({ env }) => json({ settings: await getSettings(env) });

export async function onRequestPut({ request, env }) {
  const body = await readJson(request);
  if (!body || typeof body.settings !== 'object') return error('Expected { settings: {...} }');
  await saveSettings(env, body.settings);
  return json({ ok: true });
}
