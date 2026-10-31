import { json, error } from '../../../_lib/http.js';

export async function onRequestDelete({ params, env }) {
  const key = decodeURIComponent(params.key);
  if (!/^[a-z0-9][a-z0-9.\-]*$/.test(key)) return error('Invalid file name');
  await env.MEDIA.delete(key);
  return json({ ok: true });
}
