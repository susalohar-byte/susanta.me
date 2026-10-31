// Public endpoint: saves an enquiry from the website form so it shows up in /admin → Leads.
import { json, error, readJson } from '../_lib/http.js';

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const MAX_PER_10_MIN = 5;

async function hashIp(ip, salt) {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return [...digest.slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return error('Not available', 503);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return error('Cross-origin request blocked', 403);

  const body = await readJson(request);
  if (!body) return error('Invalid request');
  // Honeypot: real visitors never see or fill this field.
  if (body.website) return json({ ok: true });

  const lead = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 30),
    business_type: clean(body.business_type, 80),
    requirement: clean(body.requirement, 1000),
    page: clean(body.page, 200),
    source: clean(body.source, 200),
  };
  if (!lead.name || !/\d{6,}/.test(lead.phone.replace(/\D/g, ''))) return error('Please enter your name and a valid phone number.');

  // x-sd-client-ip is set by the susanta.me domain Worker, which forwards visitors to this Pages project.
  const ip = request.headers.get('x-sd-client-ip') || request.headers.get('cf-connecting-ip') || 'local';
  const ipHash = await hashIp(ip, env.SESSION_SECRET || 'leads');
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > datetime('now', '-10 minutes')")
    .bind(ipHash).first();
  if ((recent?.n || 0) >= MAX_PER_10_MIN) return error('Too many enquiries — please try again in a few minutes.', 429);

  await env.DB.prepare('INSERT INTO leads (name, phone, business_type, requirement, page, source, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(lead.name, lead.phone, lead.business_type, lead.requirement, lead.page, lead.source, ipHash).run();
  return json({ ok: true }, 201);
}
