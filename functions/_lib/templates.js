// Shared HTML templates for content managed in /admin.
// Used by the Pages Functions (live data from D1) and by scripts/build.mjs (static fallback).

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Mostly-Bengali text → lang="bn", so search engines and screen readers read it as Bengali.
const BN = /[\u0980-\u09FF]/g;
export const isBengali = (t) => {
  const bn = (String(t ?? '').match(BN) || []).length;
  return bn > 0 && bn >= (String(t).match(/[A-Za-z]/g) || []).length;
};
const LANG_TAGS = 'p|li|h[1-6]|span|blockquote|td|th|dd|dt|figcaption|summary|label|small|b|strong|em|a|button|div';
export const markLang = (html) => String(html).replace(new RegExp(`<(${LANG_TAGS})(\\s[^>]*)?>([^<]+)`, 'g'),
  (m, tag, attrs = '', text) => (!/\slang=/.test(attrs) && isBengali(text) ? `<${tag}${attrs} lang="bn">${text}` : m));

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
    // Homepage "Recent work": one featured project, then up to two more and a call-to-action card.
    const host = (p) => { try { return new URL(p.url).host.replace(/^www\./, ''); } catch { return p.title; } };
    const shot = (p) => `<span class="rw-shot"><span class="rw-shot__bar"><i></i><i></i><i></i><span>${esc(host(p))}</span></span><img src="${esc(p.image)}" alt="${esc(p.title)} website" width="1200" height="738" loading="lazy"></span>`;
    const links = (p, big) => `
              <div class="rw-links">
                <a href="/work#case-${esc(p.slug)}"${big ? ' class="btn btn--dark btn--sm"' : ''}>${big ? 'Read the case study' : 'Case study'} <span class="arr">&rarr;</span></a>
                ${p.url ? `<a href="${esc(p.url)}" class="rw-live" target="_blank" rel="noopener noreferrer">${big ? 'Visit live site' : 'Live site'} &nearr;</a>` : ''}
              </div>`;
    const [f, ...rest] = items;
    const metrics = parseMetrics(f.metrics).slice(0, 3).map((m) => `<div><dt>${esc(m.value)}</dt><dd>${esc(m.label)}</dd></div>`).join('');
    const feat = `
          <article class="rw-feat reveal">
            <button type="button" class="rw-feat__media"${projectData(f)} aria-label="Preview ${esc(f.title)} website">
              ${shot(f)}
              <span class="rw-zoom" aria-hidden="true">Tap to preview</span>
            </button>
            <div class="rw-feat__body">
              <div class="rw-tags"><span class="rw-num">01</span><span class="rw-cat">${esc(f.category_label)}</span>${f.highlight ? `<span class="rw-chip">${esc(f.highlight)}</span>` : ''}</div>
              <h3>${esc(f.title)}</h3>
              ${f.solution ? `<p>${esc(f.solution)}</p>` : ''}
              ${metrics ? `<dl class="rw-metrics">${metrics}</dl>` : ''}
              ${links(f, true)}
            </div>
          </article>`;
    const cards = rest.slice(0, 2).map((p, i) => `
          <article class="rw-card reveal">
            <button type="button" class="rw-card__media"${projectData(p)} aria-label="Preview ${esc(p.title)} website">${shot(p)}</button>
            <div class="rw-card__body">
              <div class="rw-tags"><span class="rw-num">${String(i + 2).padStart(2, '0')}</span><span class="rw-cat">${esc(p.category_label)}</span></div>
              <h3>${esc(p.title)}</h3>
              ${p.solution || p.highlight ? `<p>${esc(p.solution || p.highlight)}</p>` : ''}
              ${links(p, false)}
            </div>
          </article>`).join('');
    const cta = `
          <a href="#contact" class="rw-cta reveal" data-service="A website or system like these">
            <span class="rw-cta__eyebrow">Your turn</span>
            <strong>Your business could be next.</strong>
            <span class="rw-cta__text">Tell me what you sell. I’ll show you what we can build — free 15-minute chat.</span>
            <span class="rw-cta__btn">Start your project <span class="arr">&rarr;</span></span>
          </a>`;
    return `<div class="rw">${feat}
          <div class="rw-row rw-row--${rest.slice(0, 2).length}">${cards}${cta}
          </div>
        </div>`;
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
              <h3 class="faq-q"><button class="faq-question-btn" type="button" aria-expanded="${open}">${esc(f.question)}</button></h3>
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

/* ---------- Services ---------- */
export const SERVICE_TONES = ['lime', 'navy', 'white', 'butter'];

// Illustrations for the service page. "image" (uploaded in /admin) takes priority over these.
export const SERVICE_VISUALS = {
  funnel: `
              <div class="mock">
                <div class="mock__title">This month's leads <span>LIVE</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 92%;">Ad &amp; Google visitors</div><span class="funnel-num">2,140</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 68%;">Landing page</div><span class="funnel-num">612</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 46%;">WhatsApp leads</div><span class="funnel-num">148</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 28%;">Customers</div><span class="funnel-num">41</span></div>
              </div>`,
  chat: `
              <div class="mock wa-mock">
                <div class="wa-mock__head"><i></i> SmileCare Dental</div>
                <div class="chat">
                  <div class="bubble bubble--out">Hi, is a checkup available tomorrow?<small>10:42 pm</small></div>
                  <div class="bubble bubble--in">Hello! 👋 Yes — pick a slot and we'll confirm right away.<small>10:42 pm</small></div>
                  <div class="wa-btns"><span>10:30 AM</span><span>5:00 PM</span><span>Price list</span><span>Call me</span></div>
                </div>
              </div>`,
  ad: `
              <div class="mock">
                <div class="mock__title">Aura Salon &amp; Spa <span>Sponsored</span></div>
                <div>✨ Weekend glow-up offer for Salt Lake — 20% off facials this Saturday only.</div>
                <div class="ad-img" role="img" aria-label="Salon ad preview"></div>
                <div class="ad-meta"><span>📍 Within 5 km · 25–45 yrs</span><span class="ad-btn">Send Message</span></div>
              </div>`,
  web: `
              <div class="mock">
                <div class="browser-dots"><i></i><i></i><i></i></div>
                <div class="browser-shot"><img src="/assets/portfolio/mockup_coaching.webp" alt="Coaching centre website built by Sushanta Digital" width="972" height="598" loading="lazy"></div>
                <div class="scores"><div>98<small>Performance</small></div><div>100<small>SEO</small></div><div>&lt;1.5s<small>Load time</small></div></div>
              </div>`,
  promo: `
              <div class="mock">
                <div class="mock__title">Festive campaign <span>LOCAL</span></div>
                <div class="promo-poster"><small>Manbazar · This weekend</small><b>20% OFF</b><span>Festive offer on everything</span></div>
                <div class="promo-row"><span class="promo-chip">🤝 2 local creators</span><span class="promo-chip">📣 Social + WhatsApp</span></div>
                <div class="ad-meta"><span>📍 Reaching people nearby</span><span class="ad-btn">Claim offer</span></div>
              </div>`,
  video: `
              <div class="mock">
                <div class="mock__title">Your AI video <span>READY</span></div>
                <div class="vid-thumb" role="img" aria-label="AI video preview"><span class="vid-cap">Weekend offer — 20% off!</span><i class="vid-play" aria-hidden="true"></i><span class="vid-time">0:45</span></div>
                <div class="promo-row"><span class="promo-chip">🎙️ Bengali voiceover</span><span class="promo-chip">💬 Captions</span><span class="promo-chip">📱 9:16 Reel</span></div>
                <div class="ad-meta"><span>⏱ Ready in 2–3 days</span><span class="ad-btn">Post now</span></div>
              </div>`,
};
export const SERVICE_VISUAL_OPTIONS = [['none', 'No illustration'], ['funnel', 'Lead funnel'], ['chat', 'WhatsApp chat'], ['ad', 'Facebook / Instagram ad'], ['web', 'Website preview'], ['promo', 'Local promotion poster'], ['video', 'AI video preview']];

const TINTS = { lime: 'tint-0', butter: 'tint-1', white: 'tint-2', navy: 'tint-3' };
export const serviceTint = (s) => TINTS[s.tone] || 'tint-0';

export function serviceVisualHtml(s) {
  if (s.image) return `<img class="svc-page__img" src="${esc(s.image)}" alt="${esc(s.name)}" loading="lazy">`;
  return SERVICE_VISUALS[s.visual] || '';
}

// Sample videos on a service page: YouTube links are embedded, anything else plays as a video file.
const youTubeId = (url) => (String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/) || [])[1];
export function serviceVideosHtml(videos) {
  return (Array.isArray(videos) ? videos : []).filter((v) => v && v.url).map((v) => {
    const yt = youTubeId(v.url);
    const title = v.title || 'Sample video';
    const media = yt
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${esc(title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`
      : `<video controls playsinline preload="none"${v.poster ? ` poster="${esc(v.poster)}"` : ''}><source src="${esc(v.url)}" type="video/mp4">Your browser can't play this video.</video>`;
    return `
          <figure class="vid-card${yt && !/shorts\//.test(v.url) ? ' vid-card--wide' : ''} reveal">
            <div class="vid-card__media">${media}</div>
            ${v.title ? `<figcaption>${esc(v.title)}</figcaption>` : ''}
          </figure>`;
  }).join('');
}

// Homepage AI video showcase: the AI video service's sample videos, then a card inviting an order.
export function homeVideosHtml(videos) {
  return `${serviceVideosHtml(videos)}
          <a href="/services/ai-video" class="hv-cta reveal">
            <span class="hv-cta__play" aria-hidden="true"></span>
            <strong>Your video could be here.</strong>
            <span>Reels, ads and explainers for your business — from ₹800, ready in 1–2 days.</span>
            <span class="hv-cta__link">Order an AI video <span class="arr">&rarr;</span></span>
          </a>`;
}

function serviceIcon(s) {
  if (s.icon) return `<img src="${esc(s.icon)}" alt="" width="30" height="30">`;
  if (/whatsapp/i.test(`${s.slug} ${s.name}`)) {
    return '<svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.36-.18-2.128-1.05-2.458-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.08-.96-1.81-2.15-2.02-2.51-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.54 3.88 6.16 5.45.86.37 1.53.6 2.06.77.87.28 1.66.24 2.29.15.7-.1 2.16-.88 2.46-1.73.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42zM12.044 21.782a9.87 9.87 0 0 1-4.77-1.3l-.33-.2-3.75.98 1-3.65-.22-.35a9.86 9.86 0 0 1-1.51-5.27c0-5.23 4.25-9.48 9.49-9.48 2.54 0 4.93.99 6.73 2.79a9.43 9.43 0 0 1 2.79 6.73c-.01 5.19-4.29 9.41-9.43 9.41z"/></svg>';
  }
  return `<b class="svc4__letter" aria-hidden="true">${esc(String(s.name || '?').trim()[0] || '?')}</b>`;
}

const serviceCard = (s, i) => {
  const tone = SERVICE_TONES.includes(s.tone) ? s.tone : 'white';
  const tags = parseList(s.tags);
  return `
          <a href="/services/${esc(s.slug)}" class="svc4__card svc4__card--${tone} reveal">
            ${s.sticker ? `<span class="stk svc4__stk">${esc(s.sticker)}</span>` : ''}
            <span class="svc4__icon">${serviceIcon(s)}</span>
            <span class="svc4__num">${String(s._n || i + 1).padStart(2, '0')}</span>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.summary)}</p>
            ${tags.length ? `<span class="svc4__tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</span>` : ''}
            <span class="svc4__cta">${esc(s.card_cta || 'Learn more')} <span class="arr">&rarr;</span></span>
          </a>`;
};

// variant "home": the 4-card grid on the homepage (services ticked "show on homepage").
// variant "page": every published service on /services.
export function servicesHtml(items, variant = 'page') {
  const list = variant === 'home' ? items.filter((s) => Number(s.show_on_home)).slice(0, 4) : items;
  if (!list.length) return '<p class="empty">Services coming soon.</p>';
  return list.map(serviceCard).join('');
}
