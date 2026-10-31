// Image storage for /admin uploads.
// Uses R2 (binding MEDIA) when it's enabled, otherwise Workers KV (binding MEDIA_KV)
// wrapped in the same small API (put / get / list / delete).
export function mediaStore(env) {
  if (env.MEDIA) return env.MEDIA;
  const kv = env.MEDIA_KV;
  if (!kv) return null;
  return {
    async put(key, body, { httpMetadata = {}, customMetadata = {} } = {}) {
      const buf = await new Response(body).arrayBuffer();
      await kv.put(key, buf, {
        metadata: { contentType: httpMetadata.contentType || 'application/octet-stream', size: buf.byteLength, uploaded: new Date().toISOString(), ...customMetadata },
      });
    },
    async get(key) {
      const { value, metadata } = await kv.getWithMetadata(key, 'arrayBuffer');
      if (!value) return null;
      return {
        body: value,
        httpEtag: `"${key}"`,
        writeHttpMetadata(headers) { headers.set('content-type', metadata?.contentType || 'application/octet-stream'); },
      };
    },
    async list({ cursor, limit = 1000 } = {}) {
      const r = await kv.list({ cursor, limit });
      return {
        objects: r.keys.map((k) => ({ key: k.name, size: k.metadata?.size || 0, uploaded: new Date(k.metadata?.uploaded || 0) })),
        truncated: !r.list_complete,
        cursor: r.cursor,
      };
    },
    async delete(key) { await kv.delete(key); },
  };
}
