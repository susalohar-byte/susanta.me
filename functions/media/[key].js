// Serves uploaded images from R2.
export async function onRequestGet({ params, env }) {
  const key = String(params.key);
  if (!env.MEDIA || !/^[a-z0-9][a-z0-9.\-]*$/.test(key)) return new Response('Not found', { status: 404 });
  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');
  // Uploaded SVGs can contain scripts; never let them run when opened directly.
  headers.set('content-security-policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
  return new Response(obj.body, { headers });
}
