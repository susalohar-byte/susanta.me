import { json, error } from '../../../_lib/http.js';
import { mediaStore } from '../../../_lib/media.js';

export async function onRequestDelete({ params, env }) {
  const MEDIA = mediaStore(env);
  if (!MEDIA) return error('Image storage is not set up.', 503);
  const key = decodeURIComponent(params.key);
  if (!/^[a-z0-9][a-z0-9.\-]*$/.test(key)) return error('Invalid file name');
  await MEDIA.delete(key);
  return json({ ok: true });
}
