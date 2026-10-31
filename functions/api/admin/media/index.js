import { json, error } from '../../../_lib/http.js';
import { mediaStore } from '../../../_lib/media.js';

export async function onRequestGet({ env }) {
  const MEDIA = mediaStore(env);
  if (!MEDIA) return error('Image storage is not set up.', 503);
  const items = [];
  let cursor;
  do {
    const page = await MEDIA.list({ cursor, limit: 1000 });
    for (const o of page.objects) items.push({ key: o.key, url: `/media/${o.key}`, size: o.size, uploaded: o.uploaded.toISOString() });
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  items.sort((a, b) => b.uploaded.localeCompare(a.uploaded));
  return json({ items });
}
