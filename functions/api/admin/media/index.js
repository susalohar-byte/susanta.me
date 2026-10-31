import { json, error } from '../../../_lib/http.js';

export async function onRequestGet({ env }) {
  if (!env.MEDIA) return error('Image storage is not enabled yet. Turn on R2 in the Cloudflare dashboard, then images can be uploaded.', 503);
  const items = [];
  let cursor;
  do {
    const page = await env.MEDIA.list({ cursor, limit: 1000 });
    for (const o of page.objects) items.push({ key: o.key, url: `/media/${o.key}`, size: o.size, uploaded: o.uploaded.toISOString() });
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  items.sort((a, b) => b.uploaded.localeCompare(a.uploaded));
  return json({ items });
}
