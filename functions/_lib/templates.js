// Shared HTML templates for content managed in /admin.
// Used by the Pages Functions (live data from D1) and by scripts/build.mjs (static fallback).

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const slugify = (s) =>
  String(s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

// "Grow Your Business [[Online]]" → words wrapped for the reveal animation, [[x]] highlighted.
export function titleHtml(text) {
  const parts = String(text ?? '').split(/(\[\[[^\]]+\]\])/g).filter(Boolean);
  let i = 0;
  const word = (w, mark) => `<span class="w"><span style="--i:${i++}"${mark ? ' class="mark"' : ''}>${esc(w)}</span></span>`;
  return parts.map((p) => {
    const m = p.match(/^\[\[([^\]]+)\]\]$/);
    const words = (m ? m[1] : p).split(/\s+/).filter(Boolean);
    return words.map((w) => word(w, !!m)).join(' ');
  }).join(' ');
}

const AV_COLORS = ['#3F6212', '#E08A00', '#2563EB', '#7C3AED', '#DB2777', '#0D9488'];
export function avatar(name) {
  const parts = String(name).replace(/^Dr\.?\s+/i, '').split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  const initials = ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  let sum = 0;
  for (const ch of String(name)) sum += ch.charCodeAt(0);
  return `<span class="avatar" style="background:${AV_COLORS[sum % AV_COLORS.length]}" aria-hidden="true">${esc(initials)}</span>`;
}

const parseMetrics = (m) => {
  if (Array.isArray(m)) return m;
  try { return JSON.parse(m || '[]'); } catch { return []; }
};

export function readingTime(markdown) {
  const words = String(markdown ?? '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

const projectData = (p) =>
  ` data-project data-title="${esc(p.title)}" data-cat="${esc(p.category_label)}" data-img="${esc(p.image)}"` +
  ` data-desc="${esc(p.solution)}" data-loc="${esc(p.location)}"`;

/* ---------- Projects ---------- */
export function projectsHtml(items, variant = 'home') {
  if (!items.length) return '<p class="empty">New case studies coming soon.</p>';
  if (variant === 'work') {
    return items.map((p, n) => {
      const metrics = parseMetrics(p.metrics).slice(0, 4)
        .map((m) => `<div class="metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('');
      return `
        <article class="case reveal" data-category="${esc(p.category)}" id="case-${esc(p.slug)}">
          <button type="button" class="case__media tint-${n % 4}"${projectData(p)} aria-label="Preview ${esc(p.title)}">
            <img src="${esc(p.image)}" alt="${esc(p.title)} website" width="972" height="598" loading="lazy">
            ${p.highlight ? `<span class="chip chip--float">${esc(p.highlight)}</span>` : ''}
          </button>
          <div class="case__body">
            <span class="eyebrow">${esc(p.category_label)}</span>
            <h3>${esc(p.title)}</h3>
            ${p.location ? `<p class="case__loc">📍 ${esc(p.location)}</p>` : ''}
            <dl class="csr">
              ${p.challenge ? `<div><dt>The challenge</dt><dd>${esc(p.challenge)}</dd></div>` : ''}
              ${p.solution ? `<div><dt>What we built</dt><dd>${esc(p.solution)}</dd></div>` : ''}
            </dl>
            ${metrics ? `<div class="metrics">${metrics}</div>` : ''}
            <div class="case__actions">
              <a href="#contact" class="btn btn--primary btn--sm" data-service="A system like ${esc(p.title)}">Get a similar system &rarr;</a>
              ${p.url ? `<a href="${esc(p.url)}" class="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer">Visit live site &nearr;</a>` : ''}
            </div>
          </div>
        </article>`;
    }).join('');
  }
  if (variant === 'bento') {
    const host = (p) => { try { return new URL(p.url).host.replace(/^www\./, ''); } catch { return p.title; } };
    const cards = items.slice(0, 3).map((p, n) => {
      const feat = n === 0;
      const metrics = feat ? parseMetrics(p.metrics).slice(0, 3)
        .map((m) => `<div><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('') : '';
      return `
          <article class="cb-card${feat ? ' cb-card--feat' : ''} reveal">
            <button type="button" class="cb-card__stage tint-${n % 4}"${projectData(p)} aria-label="Preview ${esc(p.title)} website">
              <span class="cb-browser">
                <span class="cb-browser__bar"><i></i><i></i><i></i><span class="cb-browser__url">${esc(host(p))}</span></span>
                <img src="${esc(p.image)}" alt="${esc(p.title)} website" width="1200" height="738" loading="lazy">
              </span>
              <span class="cb-card__go" aria-hidden="true">&nearr;</span>
            </button>
            <div class="cb-card__info">
              <div class="cb-card__top">
                <span class="cb-card__cat">${esc(p.category_label)}</span>
                ${p.highlight ? `<span class="cb-card__chip">${esc(p.highlight)}</span>` : ''}
              </div>
              <h3>${esc(p.title)}</h3>
              ${feat && p.solution ? `<p>${esc(p.solution)}</p>` : ''}
              ${metrics ? `<div class="cb-card__metrics">${metrics}</div>` : ''}
              <div class="cb-card__links">
                <a href="/work#case-${esc(p.slug)}">Case study &rarr;</a>
                ${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Live site &nearr;</a>` : ''}
              </div>
            </div>
          </article>`;
    }).join('');
    return `<div class="cb">${cards}</div>`;
  }
  return items.map((p, n) => `
        <article class="proj reveal" data-category="${esc(p.category)}">
          <button type="button" class="proj__media tint-${n % 4}"${projectData(p)} aria-label="Preview ${esc(p.title)}">
            <img src="${esc(p.image)}" alt="${esc(p.title)} website" width="972" height="598" loading="lazy">
            ${p.highlight ? `<span class="chip chip--float">${esc(p.highlight)}</span>` : ''}
          </button>
          <div class="proj__body">
            <div><span class="proj__cat">${esc(p.category_label)}</span><h3>${esc(p.title)}</h3>${p.location ? `<p>📍 ${esc(p.location)}</p>` : ''}</div>
            <a href="/work#case-${esc(p.slug)}" class="proj__go" aria-label="Read the ${esc(p.title)} case study">&nearr;</a>
          </div>
        </article>`).join('');
}

/* ---------- Reviews ---------- */
export function reviewsHtml(items) {
  if (!items.length) return '<p class="empty">Reviews coming soon.</p>';
  return items.map((r) => {
    const rating = Math.min(5, Math.max(1, Number(r.rating) || 5));
    return `
        <figure class="review reveal">
          <div class="review__stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}<span>${'★'.repeat(5 - rating)}</span></div>
          <blockquote>${esc(r.quote)}</blockquote>
          ${r.result ? `<span class="review__result">${esc(r.result)}</span>` : ''}
          <figcaption class="who">${avatar(r.name)}<div><b>${esc(r.name)}</b><span>${esc(r.role)}</span></div></figcaption>
        </figure>`;
  }).join('');
}

/* ---------- Blog ---------- */
function postCard(p, cls = 'post') {
  return `
        <a href="/blog/${esc(p.slug)}" class="${cls} reveal" data-category="${esc(slugify(p.category))}">
          <div class="post__img">${p.cover_image ? `<img src="${esc(p.cover_image)}" alt="" width="1376" height="768" loading="lazy">` : ''}</div>
          <div class="post__body">
            <div class="post__meta"><span class="post__cat">${esc(p.category || 'Guide')}</span><span>${esc(readingTime(p.content))}</span></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt)}</p>
            <span class="post__more">Read guide &rarr;</span>
          </div>
        </a>`;
}

export function postsHtml(items, variant = 'blog') {
  if (!items.length) return '<p class="empty">New guides are on the way — check back soon.</p>';
  if (variant === 'home') return items.slice(0, 3).map((p) => postCard(p)).join('');
  const cats = [...new Map(items.filter((p) => p.category).map((p) => [slugify(p.category), p.category])).entries()];
  const [first, ...rest] = items;
  const searchText = (p) => esc(`${p.title} ${p.excerpt} ${p.category}`.toLowerCase());
  const row = (p) => `
          <a href="/blog/${esc(p.slug)}" class="bj-row reveal" data-category="${esc(slugify(p.category))}" data-search="${searchText(p)}">
            <span class="bj-row__img">${p.cover_image ? `<img src="${esc(p.cover_image)}" alt="" width="1376" height="768" loading="lazy">` : ''}</span>
            <span class="bj-row__body">
              <span class="bj-meta"><span class="post__cat">${esc(p.category || 'Guide')}</span><span>${esc(formatDate(p.published_at))} · ${esc(readingTime(p.content))}</span></span>
              <b>${esc(p.title)}</b>
              <span class="bj-row__ex">${esc(p.excerpt)}</span>
            </span>
            <span class="bj-row__go" aria-hidden="true">&rarr;</span>
          </a>`;
  return `
        <div class="bj-bar reveal">
          <label class="bj-search"><span class="sr-only">Search articles</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" id="blogSearch" placeholder="Search guides…" autocomplete="off">
          </label>
          <div class="bj-chips" role="group" aria-label="Filter by topic">
            <button type="button" class="bj-chip active" data-filter="all">All</button>
            ${cats.map(([k, v]) => `<button type="button" class="bj-chip" data-filter="${esc(k)}">${esc(v)}</button>`).join('')}
          </div>
        </div>
        <a href="/blog/${esc(first.slug)}" class="bj-feat reveal" data-category="${esc(slugify(first.category))}" data-search="${searchText(first)}">
          <span class="bj-feat__img">${first.cover_image ? `<img src="${esc(first.cover_image)}" alt="" width="1376" height="768">` : ''}<span class="stk stk--lime bj-feat__stk">✏️ Editor's pick</span></span>
          <span class="bj-feat__body">
            <span class="bj-meta"><span class="post__cat">${esc(first.category || 'Guide')}</span><span>${esc(formatDate(first.published_at))} · ${esc(readingTime(first.content))}</span></span>
            <b>${esc(first.title)}</b>
            <span class="bj-feat__ex">${esc(first.excerpt)}</span>
            <span class="bj-feat__go">Read the guide &rarr;</span>
          </span>
        </a>
        <div class="bj-list">${rest.map(row).join('')}
        </div>
        <p class="bj-empty" hidden>No guides match that search. <a href="/blog" class="link-arrow">Show all</a></p>`;
}

/* ---------- Pricing plans ---------- */
const waUrl = (text, number = '919547771118') => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
const parseList = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v || '[]'); } catch { return []; } };

export function plansHtml(items, variant = 'cards') {
  if (!items.length) return '<p class="empty">Plans coming soon — ask for a custom quote on WhatsApp.</p>';
  if (variant === 'strip') {
    return items.map((p) => `
          <a href="/pricing#plans" class="price-pill${Number(p.popular) ? ' price-pill--hot' : ''} reveal">
            ${Number(p.popular) ? '<span class="stk stk--float stk--lime price-pill__stk">🔥 Most popular</span>' : ''}
            <span class="price-pill__name">${esc(p.name)}</span>
            <b>₹${esc(p.price)}</b>
            <span class="price-pill__desc">${esc(p.description)}</span>
            <span class="price-pill__go">See details &rarr;</span>
          </a>`).join('');
  }
  return items.map((p) => {
    const hot = Number(p.popular) === 1;
    return `
          <div class="plan${hot ? ' plan--hot' : ''} reveal">
            ${hot ? '<span class="plan__ribbon">🔥 Most popular</span>' : ''}
            ${p.badge ? `<span class="plan__tag">${esc(p.badge)}</span>` : ''}
            <h3>${esc(p.name)}</h3>
            <p class="plan__desc">${esc(p.description)}</p>
            <div class="plan__price"><b>₹${esc(p.price)}</b><span>/ ${esc(p.period || 'one-time')}</span></div>
            <ul class="ticks">${parseList(p.features).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
            <a href="${waUrl(`Hi Sushanta! I'm interested in the ${p.name} package.`)}" target="_blank" rel="noopener noreferrer" class="btn ${hot ? 'btn--primary' : 'btn--ghost'} btn--block">${esc(p.cta || 'Choose plan')} <span class="arr">&rarr;</span></a>
          </div>`;
  }).join('');
}

/* ---------- FAQs ---------- */
// Answers are plain text; **bold** is allowed.
const answerHtml = (a) => esc(a).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
const faqItem = (f, open) => `
            <div class="faq-item${open ? ' active' : ''}">
              <button class="faq-question-btn" type="button" aria-expanded="${open}">${esc(f.question)}</button>
              <div class="faq-answer-pane"><div><p>${answerHtml(f.answer)}</p></div></div>
            </div>`;

export function faqsHtml(items, variant = 'page') {
  if (!items.length) return '<p class="empty">Questions coming soon.</p>';
  if (variant === 'home') return items.filter((f) => Number(f.show_on_home)).map((f, i) => faqItem(f, i === 0)).join('');
  if (variant === 'pricing') return items.filter((f) => /pric|payment/i.test(f.category)).map((f, i) => faqItem(f, i === 0)).join('');
  const groups = new Map();
  for (const f of items) {
    if (!groups.has(f.category)) groups.set(f.category, []);
    groups.get(f.category).push(f);
  }
  return [...groups.entries()].map(([cat, list], gi) => `
        <div class="faq-group reveal" id="${esc(slugify(cat))}">
          <h2>${esc(cat)}</h2>
          <div class="faq-accordion-wrap">${list.map((f, i) => faqItem(f, gi === 0 && i === 0)).join('')}
          </div>
        </div>`).join('');
}

export function faqSchemaJson(items, variant = 'page') {
  const list = variant === 'home' ? items.filter((f) => Number(f.show_on_home))
    : variant === 'pricing' ? items.filter((f) => /pric|payment/i.test(f.category)) : items;
  return JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: list.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: String(f.answer).replace(/\*\*/g, '') } })),
  }).replace(/</g, '\\u003c');
}
