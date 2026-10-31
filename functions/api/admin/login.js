import { json, error, readJson, safeEqual, createSession } from '../../_lib/http.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 8 || !env.SESSION_SECRET) {
    return error('Admin is not set up yet: add ADMIN_PASSWORD (8+ characters) and SESSION_SECRET in Cloudflare.', 500);
  }
  const body = await readJson(request);
  if (!body || !(await safeEqual(body.password ?? '', env.ADMIN_PASSWORD))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return error('Wrong password.', 401);
  }
  return json({ ok: true }, 200, { 'set-cookie': await createSession(env) });
}
