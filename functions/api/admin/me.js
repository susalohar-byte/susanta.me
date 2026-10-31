import { json } from '../../_lib/http.js';

// Reaching this handler means the admin middleware accepted the session.
export const onRequestGet = () => json({ ok: true });
