import { listRows } from './_lib/db.js';
import { SITE } from './_lib/layout.js';

const PAGES = [['/', '1.0'], ['/services', '0.9'], ['/pricing', '0.9'], ['/work', '0.8'], ['/contact', '0.8'], ['/about', '0.7'],
  ['/reviews', '0.7'], ['/blog', '0.7'], ['/process', '0.6'], ['/faq', '0.6'], ['/privacy-policy', '0.3'], ['/terms', '0.3']];

export async function onRequestGet({ env }) {
  const posts = env.DB ? await listRows(env, 'posts', { publishedOnly: true }).catch(() => []) : [];
  const urls = [
    ...PAGES.map(([p, pr]) => `<url><loc>${SITE}${p}</loc><priority>${pr}</priority></url>`),
    ...posts.map((p) => `<url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${(p.updated_at || p.published_at).slice(0, 10)}</lastmod><priority>0.6</priority></url>`),
  ];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
