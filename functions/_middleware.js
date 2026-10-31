// Fills static pages with live content from /admin (D1) before they reach the visitor.
import { getSettings, listRows } from './_lib/db.js';
import { titleHtml, projectsHtml, reviewsHtml, postsHtml, plansHtml, faqsHtml, faqSchemaJson } from './_lib/templates.js';
import { SITE } from './_lib/layout.js';

const SAFE_URL = /^(\/(?!\/)|https:\/\/)[^\s"'<>]*$/;

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/media/')) return next();

  const response = await next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !env.DB) return response;

  let settingsPromise;
  const settings = () => (settingsPromise ??= getSettings(env).catch(() => ({})));
  const lists = {};
  const list = (table, opts) => (lists[table] ??= listRows(env, table, { publishedOnly: true, ...opts }).catch(() => null));

  const setAttr = (attr, key, valid = (v) => SAFE_URL.test(v)) => ({
    async element(el) {
      const v = (await settings())[el.getAttribute(key)];
      if (v && valid(v)) el.setAttribute(attr, v);
    },
  });

  const rewriter = new HTMLRewriter()
    .on('[data-cms-img]', setAttr('src', 'data-cms-img'))
    .on('link[data-cms-favicon]', {
      async element(el) {
        const v = (await settings()).favicon;
        if (v && SAFE_URL.test(v)) el.setAttribute('href', v);
      },
    })
    .on('link[data-cms-preload]', {
      async element(el) {
        const v = (await settings()).hero_image;
        if (v && SAFE_URL.test(v)) el.setAttribute('href', v);
      },
    })
    .on('meta[data-cms-og]', {
      async element(el) {
        const v = (await settings()).og_image;
        if (v && SAFE_URL.test(v)) el.setAttribute('content', v.startsWith('/') ? SITE + v : v);
      },
    })
    .on('[data-cms-text]', {
      async element(el) {
        const v = (await settings())[el.getAttribute('data-cms-text')];
        if (v) el.setInnerContent(v);
      },
    })
    .on('[data-cms-title]', {
      async element(el) {
        const v = (await settings())[el.getAttribute('data-cms-title')];
        if (v) el.setInnerContent(titleHtml(v), { html: true });
      },
    })
    .on('[data-cms-href]', {
      async element(el) {
        const s = await settings();
        const kind = el.getAttribute('data-cms-href');
        if (kind === 'email' && s.email && /^[^\s@"<>]+@[^\s@"<>]+$/.test(s.email)) el.setAttribute('href', `mailto:${s.email}`);
        if (kind === 'phone') {
          let d = String(s.phone_display || s.whatsapp || '').replace(/\D/g, '');
          if (d.length === 10) d = `91${d}`;
          if (d.length >= 8) el.setAttribute('href', `tel:+${d}`);
        }
      },
    })
    .on('[data-cms-wa-text]', {
      async element(el) {
        const d = String((await settings()).whatsapp || '');
        if (!/^\d{8,15}$/.test(d)) return;
        el.setInnerContent(d.length === 12 && d.startsWith('91') ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : `+${d}`);
      },
    })
    .on('[data-cms-social]', {
      async element(el) {
        const v = (await settings())[el.getAttribute('data-cms-social')];
        if (v && /^https:\/\//.test(v)) {
          el.setAttribute('href', v);
          el.removeAttribute('hidden');
        }
      },
    })
    .on('a[href*="wa.me/"]', {
      async element(el) {
        const n = (await settings()).whatsapp;
        if (n && /^\d{8,15}$/.test(n)) el.setAttribute('href', el.getAttribute('href').replace(/wa\.me\/\d+/, `wa.me/${n}`));
      },
    })
    .on('script[data-cms-faq-schema]', {
      async element(el) {
        const rows = await list('faqs');
        if (rows) el.setInnerContent(faqSchemaJson(rows, el.getAttribute('data-cms-faq-schema')), { html: true });
      },
    })
    .on('[data-cms-list]', {
      async element(el) {
        const kind = el.getAttribute('data-cms-list');
        const variant = el.getAttribute('data-variant') || '';
        const limit = Number(el.getAttribute('data-limit')) || undefined;
        let html = null;
        if (kind === 'projects') {
          const rows = await list('projects');
          if (rows) html = projectsHtml(limit ? rows.slice(0, limit) : rows, variant);
        } else if (kind === 'reviews') {
          const rows = await list('reviews');
          if (rows) html = reviewsHtml(limit ? rows.slice(0, limit) : rows);
          if (rows && variant === 'marquee') html += html.replaceAll('class="review reveal"', 'class="review" aria-hidden="true"');
        } else if (kind === 'posts') {
          const rows = await list('posts');
          if (rows) html = postsHtml(rows, variant);
        } else if (kind === 'plans') {
          const rows = await list('plans');
          if (rows) html = plansHtml(rows, variant);
        } else if (kind === 'faqs') {
          const rows = await list('faqs');
          if (rows) html = faqsHtml(rows, variant);
        }
        if (html !== null) el.setInnerContent(html, { html: true });
      },
    });

  return rewriter.transform(response);
}
