import { json, error } from '../../_lib/http.js';

const TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  gif: 'image/gif', svg: 'image/svg+xml', ico: 'image/x-icon', avif: 'image/avif',
};
const MAX_BYTES = 5 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  if (!env.MEDIA) return error('Image storage is not enabled yet. Turn on R2 in the Cloudflare dashboard, then images can be uploaded.', 503);
  let form;
  try {
    form = await request.formData();
  } catch {
    return error('Expected a multipart upload');
  }
  const file = form.get('file');
  if (!file || typeof file === 'string') return error('No file received');
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!TYPES[ext]) return error('Only images are allowed (png, jpg, webp, gif, svg, ico, avif)');
  if (file.size > MAX_BYTES) return error('Image is larger than 5 MB');

  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const key = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}-${base}.${ext === 'jpeg' ? 'jpg' : ext}`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: TYPES[ext] },
    customMetadata: { originalName: file.name.slice(0, 200) },
  });
  return json({ url: `/media/${key}`, key }, 201);
}
