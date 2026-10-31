import { json, error } from '../../../_lib/http.js';

export async function onRequestDelete({ params, env }) {
  if (!env.MEDIA) return error('Image storage is not enabled yet. Turn on R2 in the Cloudflare dashboard, then images can be uploaded.', 503);
  const key = decodeURIComponent(params.key);
  if (!/^[a-z0-9][a-z0-9.\-]*$/.test(key)) return error('Invalid file name');
  await env.MEDIA.delete(key);
  return json({ ok: true });
}
