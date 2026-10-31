import { error, isAuthed } from '../../_lib/http.js';

// Guards every /api/admin/* route except login.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) return error('Cross-origin request blocked', 403);
  }
  if (url.pathname === '/api/admin/login') return next();
  if (!env.DB || !env.MEDIA) return error('Database or media storage is not configured', 500);
  if (!(await isAuthed(request, env))) return error('Please log in', 401);
  try {
    return await next();
  } catch (e) {
    return error(e.message || 'Something went wrong', e.status || 500);
  }
}
