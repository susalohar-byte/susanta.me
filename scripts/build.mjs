// Builds the static pages in /public from the shared layout + content.json.
// Run: node scripts/build.mjs
// Lists marked data-cms-list (projects, reviews, posts) are re-filled live from /admin at request time.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { page, head, header, form, TAIL, waIcon, waLink, SITE } from '../functions/_lib/layout.js';
import { esc, slugify, titleHtml, projectsHtml, reviewsHtml, postsHtml, plansHtml, faqsHtml, faqSchemaJson } from '../functions/_lib/templates.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = JSON.parse(readFileSync(join(root, 'scripts/content.json'), 'utf8'));
const S = C.settings;
const out = (file, html) => writeFileSync(join(root, 'public', file), html);
const strip = (s) => String(s).replace(/<[^>]+>/g, '');

/* ---------- small building blocks ---------- */
const mark = (t) => `<span class="mark">${t}</span>`;
const secHead = ({ eyebrow, title, lead, center = false, extra = '' }) => `
        <div class="sec-head${center ? ' sec-head--center' : ''} reveal">
          <div><span class="eyebrow">${eyebrow}</span><h2 class="h-section">${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>${extra}
        </div>`;
const sticker = (t, cls = '') => `<span class="stk ${cls}">${t}</span>`;
const stamp = (text, cls = '') => `<span class="stamp ${cls}" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="stampPath" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><text><textPath href="#stampPath">${text}</textPath></text></svg><b>✦</b></span>`;
const doodle = (t) => `<span class="doodle">${t}<img src="/assets/doodles/arrow-services.svg" alt="" width="28" height="32"></span>`;
// Visible breadcrumbs removed by request; BreadcrumbList structured data is still added in head().
const crumbs = () => '';
const faqLd = (variant) => `\n    <script type="application/ld+json" data-cms-faq-schema="${variant}">${faqSchemaJson(C.faqs.filter((f) => f.published), variant)}</script>`;
const ctaBand = (title, sub, btn = 'Book a Free 15-Min Call', msg = "Hi Sushanta! I'd like to book a free 15-minute call.") => `
    <section class="section section--flush-top">
      <div class="container">
        <div class="cta-band reveal-scale">
          <div><h2>${title}</h2><p>${sub}</p></div>
          <div class="cta-band__actions">
            <a href="${waLink(msg)}" target="_blank" rel="noopener noreferrer" class="btn btn--dark">${waIcon(18)} ${btn} <span class="arr">&rarr;</span></a>
            <span class="doodle">Replies in ~15 minutes :)</span>
          </div>
        </div>
      </div>
    </section>
`;
const stats = () => `
        <div class="stats reveal">
          ${[1, 2, 3, 4].map((n) => `<div class="stat"><strong data-count data-cms-text="stat_${n}_value">${esc(S[`stat_${n}_value`])}</strong><span data-cms-text="stat_${n}_label">${esc(S[`stat_${n}_label`])}</span></div>`).join('')}
        </div>`;
const FUNNEL = `
              <div class="mock">
                <div class="mock__title">This month's leads <span>LIVE</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 92%;">Ad &amp; Google visitors</div><span class="funnel-num">2,140</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 68%;">Landing page</div><span class="funnel-num">612</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 46%;">WhatsApp leads</div><span class="funnel-num">148</span></div>
                <div class="funnel-row"><div class="funnel-bar" style="--w: 28%;">Customers</div><span class="funnel-num">41</span></div>
              </div>`;
const toast = (title, sub) => `<div class="toast"><div class="toast__icon">${waIcon(20, '#128C7E')}</div><div><b>${title}</b><span>${sub}</span></div></div>`;
const PLANS = () => C.plans.filter((p) => p.published);
const proof = `
            <div class="hero__proof">
              <div class="avatars">${[1, 2, 3, 4].map((n) => `<img src="/assets/images/gen_avatar_${n}.png" alt="" width="40" height="40">`).join('')}</div>
              <div class="hero__proof-text"><span class="stars">★★★★★</span><strong>Trusted by 50+ local businesses</strong></div>
            </div>`;
const list = (kind, html, variant = '', cls = '', limit) =>
  `<div class="${cls}" data-cms-list="${kind}"${variant ? ` data-variant="${variant}"` : ''}${limit ? ` data-limit="${limit}"` : ''}>${html}</div>`;
const published = (rows) => rows.filter((r) => r.published);

/* =========================================================
   HOME — full-bleed animated landing page
   ========================================================= */
function home() {
  const mq = ['Lead Generation', 'WhatsApp Automation', 'Meta Ads', 'Website Development', 'Local SEO', 'Google Maps', 'Coaching Centres', 'Clinics', 'Salons', 'Travel Agencies'];
  const reviews = published(C.reviews);
  const body = `
    <section class="hero hero--home">
      <div class="hero__bg"><img src="${S.hero_image}" alt="" width="1376" height="768" fetchpriority="high" data-cms-img="hero_image"></div>
      <div class="hero__glow" aria-hidden="true"></div>
      <div class="container hero__grid hero__grid--center">
        <div class="hero__copy">
          <div class="hero__note"><span data-cms-text="hero_note">${esc(S.hero_note)}</span><img src="/assets/doodles/arrow-hero-left.svg" alt="" width="50" height="24"></div>
          <h1 class="hero__title" data-cms-title="hero_title">${titleHtml(S.hero_title)}</h1>
          <p class="hero__sub" data-cms-text="hero_subtitle">${esc(S.hero_subtitle)}</p>
          <div class="hero__ctas">
            <a href="#contact" class="btn btn--primary">${waIcon(18)} Get a Free Consultation <span class="arr">&rarr;</span></a>
            <a href="/work" class="btn btn--ghost-light">See Results <span class="arr">&rarr;</span></a>
          </div>${proof}
          ${stamp('FREE CONSULTATION • FREE CONSULTATION • ', 'hero__stamp')}
        </div>
        <div class="hero__side" aria-hidden="true">
          <div class="float float--2 hide-sm hero__float-a">${toast('New lead! 🎉', 'Priya · Salt Lake · wants a quote')}</div>
          <div class="float float--3 hide-sm hero__float-b" style="--r: 3deg;"><span class="chip"><span class="dot"></span>3.2x more enquiries</span></div>
        </div>
      </div>
      <div class="hero__scroll" aria-hidden="true"></div>
    </section>

    <div class="marquee-clip"><div class="marquee" aria-hidden="true"><div class="marquee__track">${[...mq, ...mq].map((m) => `<span>${m}</span>`).join('')}</div></div></div>

    <section class="section" id="services">
      <div class="container svc4">
        <div class="svc4__intro reveal">
          <span class="eyebrow">Services</span>
          <h2 class="h-section">Simple solutions. ${mark('Real growth.')}</h2>
          <p class="lead">আপনার ব্যবসায় নতুন কাস্টমার আনতে যা যা লাগে — সব এক জায়গায়, একজন পার্টনারের কাছে।</p>
          <div class="svc4__ctas">
            <a href="#contact" class="btn btn--primary">${waIcon(18)} Get a Free Consultation <span class="arr">&rarr;</span></a>
            <a href="/services" class="link-arrow">All services &rarr;</a>
          </div>
          <div class="stk-row">${sticker('✨ All in one place', 'stk--white')}${sticker('🤝 One partner', 'stk--lime')}</div>
        </div>
        <div class="svc4__grid">
          ${[
            ['lead-generation', 'Lead Generation', '<img src="/assets/icons/lead-gen.svg" alt="" width="30" height="30">', 'svc4__card--lime', '+3.2x leads',
              'রোজ নতুন এনকোয়ারি — যারা সত্যিই কিনতে চায়। সব লিড ট্র্যাক করা।', ['Landing pages', 'Lead magnets', 'Google Sheets']],
            ['whatsapp', 'WhatsApp Automation', waIcon(28, '#25D366'), 'svc4__card--navy', '0.5s reply',
              'দিনরাত ২৪ ঘণ্টা অটো-রিপ্লাই, মেনু আর বুকিং — কোনো কাস্টমার মিস হবে না।', ['Auto-reply', 'Bookings', 'Follow-ups']],
            ['meta-ads', 'Meta Ads', '<img src="/assets/icons/meta-ads.svg" alt="" width="30" height="30">', 'svc4__card--white', '5–15 km radius',
              'আপনার দোকানের আশেপাশের কাস্টমারদের কাছে Facebook ও Instagram অ্যাড।', ['Local targeting', 'Ad creatives', 'Pixel tracking']],
            ['web-dev', 'Websites & Apps', '<img src="/assets/icons/website-dev.svg" alt="" width="30" height="30">', 'svc4__card--butter', '<1.5s load',
              'মোবাইলে চোখের পলকে খোলে, আর ভিজিটরকে সোজা কল বা WhatsApp-এ আনে।', ['Mobile-first', 'SEO ready', 'Booking forms']],
          ].map(([id, t, icon, tone, stk, d, tags], i) => `
          <a href="/services#${id}" class="svc4__card ${tone} reveal">
            <span class="stk svc4__stk">${esc(stk)}</span>
            <span class="svc4__icon">${icon}</span>
            <span class="svc4__num">0${i + 1}</span>
            <h3>${esc(t)}</h3>
            <p>${d}</p>
            <span class="svc4__tags">${tags.map((x) => `<span>${x}</span>`).join('')}</span>
            <span class="svc4__go" aria-hidden="true">&rarr;</span>
          </a>`).join('')}
        </div>
      </div>
      <div class="container"><p class="svc4__extra reveal">Also: <a href="/services#seo">Local SEO &amp; Google Maps</a> · <a href="/services#speed">Speed Optimization</a> · <a href="/services#support">Ongoing Support</a></p></div>
    </section>

    <section class="section section--flush-top"><div class="container">${stats()}</div></section>

    <section class="section section--soft">
      <div class="container split">
        <div>
          ${secHead({ eyebrow: 'Why work with me', title: `Built for local businesses. ${mark('Built to sell.')}`, lead: 'বেশিরভাগ এজেন্সি সুন্দর কিন্তু স্লো ওয়েবসাইট বানায়, যাতে ফোন একবারও বাজে না। আমি এমন সিস্টেম বানাই যা থেকে আসল এনকোয়ারি আসে।' }).replace('sec-head reveal', 'sec-head reveal" style="margin-bottom: 0')}
          <div class="stk-row reveal">
            ${sticker('⚡ Live in 7 days', 'stk--lime')}${sticker('📱 Mobile-first', 'stk--white')}${sticker('💬 WhatsApp-first', 'stk--navy')}${sticker('🤝 Direct 1-on-1', 'stk--peach')}
          </div>
          <a href="/about" class="link-arrow" style="margin-top: 28px;">More about me &rarr;</a>
        </div>
        <div class="portrait reveal-scale">
          <div class="portrait__ring" aria-hidden="true"></div>
          <img class="portrait__img" src="/assets/images/gen_sushanta_circle.png" alt="Sushanta Lohar, founder of Sushanta Digital" width="336" height="336" loading="lazy">
          <div class="float" style="left: -24px; top: 30px; --r: -5deg;"><span class="chip">Hi, I'm Sushanta :)</span></div>
          <div class="float float--2 hide-sm" style="right: -30px; bottom: 70px;">${toast('Replied in 2 min', '“Sure! Sending your plan now…”')}</div>
        </div>
      </div>
    </section>

    <section class="section" id="work">
      <div class="container">${secHead({ eyebrow: 'Recent work', title: `Real businesses. ${mark('Real results.')}`, lead: 'এডুকেশন প্ল্যাটফর্ম থেকে AI টুল — আমার বানানো কিছু আসল প্রজেক্ট, নিজেই দেখুন।', extra: '<a href="/work" class="btn btn--ghost btn--sm">All case studies <span class="arr">&rarr;</span></a>' })}
        ${list('projects', projectsHtml(published(C.projects), 'bento'), 'bento')}
      </div>
    </section>

    <section class="section section--navy on-dark" id="process">
      <div class="container">${secHead({ eyebrow: 'How it works', title: `From idea to enquiries in ${mark('7 days')}`, lead: 'কোনো টেকনিক্যাল ঝামেলা নেই। ডিজাইন, লেখা, অটোমেশন আর হোস্টিং — সব আমি দেখি।', center: true })}
        <div class="steps">
          <div class="steps__line" aria-hidden="true"></div>
          ${[['01', '15 minutes', 'Free discovery', 'A quick WhatsApp or phone chat about your business, customers and goals.'],
            ['02', 'Days 1–4', 'Design & build', 'Your mobile-first site and offer, with a private preview link to review.'],
            ['03', 'Days 5–6', 'Automate', 'WhatsApp auto-replies, booking flows and lead tracking in Google Sheets.'],
            ['04', 'Day 7', 'Launch & grow', 'Go live with Google Maps, SEO and ads — and start getting enquiries.']]
            .map(([n, w, t, d]) => `<div class="step reveal"><div class="step__num">${n}</div><span class="step__when">${w}</span><h3>${esc(t)}</h3><p>${d}</p></div>`).join('')}
        </div>
        <div style="text-align: center; margin-top: 60px;"><a href="/process" class="btn btn--primary">See the full process <span class="arr">&rarr;</span></a></div>
      </div>
    </section>

    <section class="section" id="testimonials">
      <div class="container">${secHead({ eyebrow: 'Client love', title: `What local owners ${mark('say')}`, extra: '<a href="/reviews" class="btn btn--ghost btn--sm">All reviews <span class="arr">&rarr;</span></a>' })}</div>
      <div class="reviews-marquee">
        ${list('reviews', reviewsHtml(reviews) + reviewsHtml(reviews).replaceAll('class="review reveal"', 'class="review" aria-hidden="true"'), 'marquee', 'reviews-marquee__track')}
      </div>
    </section>

    <section class="section section--soft" id="pricing">
      <div class="container">${secHead({ eyebrow: 'Transparent pricing', title: `Simple plans that ${mark('pay for themselves')}`, lead: 'একবারের খরচ। মাসে মাসে কোনো লুকানো চার্জ নেই।', extra: '<a href="/pricing" class="btn btn--ghost btn--sm">All plans <span class="arr">&rarr;</span></a>' })}
        ${list('plans', plansHtml(PLANS(), 'strip'), 'strip', 'price-strip')}
        <p class="price-strip__note reveal">${sticker('🛡️ 100% satisfaction guarantee', 'stk--white')} ${sticker('💸 50% now, rest after you approve', 'stk--white')}</p>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="container faq-cols">
        <div class="sec-head reveal"><div>
          <span class="eyebrow">FAQ</span>
          <h2 class="h-section">Questions? ${mark('Answered.')}</h2>
          <p class="lead">Straight answers, zero jargon. Still unsure? Just ask on WhatsApp.</p>
          <div style="margin-top: 26px; display: flex; gap: 12px; flex-wrap: wrap;"><a href="/faq" class="btn btn--ghost btn--sm">All FAQs</a><a href="${waLink('Hi Sushanta! I have a question.')}" target="_blank" rel="noopener noreferrer" class="btn btn--dark btn--sm">${waIcon(16)} Ask me</a></div>
        </div></div>
        ${list('faqs', faqsHtml(C.faqs.filter((f) => f.published), 'home'), 'home', 'faq-accordion-wrap reveal')}${faqLd('home')}
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">${secHead({ eyebrow: 'From the blog', title: `Free growth ${mark('playbooks')}`, extra: '<a href="/blog" class="btn btn--ghost btn--sm">All articles <span class="arr">&rarr;</span></a>' })}
        ${list('posts', postsHtml(published(C.posts), 'home'), 'home', 'posts posts--row')}
      </div>
    </section>
`;
  return page({
    path: '/',
    head: { title: 'Sushanta Digital | Lead Generation & Websites for Local Businesses', description: 'Get more customers with lead generation, WhatsApp automation, Meta ads and fast websites for local businesses in Purulia, West Bengal & across India. Plans from ₹6,999. Free consultation.', preload: S.hero_image },
    body, modal: true,
  });
}

/* =========================================================
   SERVICES — sticky side-nav with scroll-spy panels
   ========================================================= */
const SVC_HEADLINES = {
  'lead-generation': 'Stop waiting for walk-ins. Get enquiries every day.',
  whatsapp: 'Answer every customer in seconds — even at midnight.',
  'meta-ads': 'Ads that bring enquiries, not just likes.',
  'web-dev': 'A fast website that works like your best salesperson.',
};

function services() {
  const chat = `
              <div class="mock wa-mock">
                <div class="wa-mock__head"><i></i> SmileCare Dental</div>
                <div class="chat">
                  <div class="bubble bubble--out">Hi, is a checkup available tomorrow?<small>10:42 pm</small></div>
                  <div class="bubble bubble--in">Hello! 👋 Yes — pick a slot and we'll confirm right away.<small>10:42 pm</small></div>
                  <div class="wa-btns"><span>10:30 AM</span><span>5:00 PM</span><span>Price list</span><span>Call me</span></div>
                </div>
              </div>`;
  const ad = `
              <div class="mock">
                <div class="mock__title">Aura Salon &amp; Spa <span>Sponsored</span></div>
                <div>✨ Weekend glow-up offer for Salt Lake — 20% off facials this Saturday only.</div>
                <div class="ad-img" role="img" aria-label="Salon ad preview"></div>
                <div class="ad-meta"><span>📍 Within 5 km · 25–45 yrs</span><span class="ad-btn">Send Message</span></div>
              </div>`;
  const web = `
              <div class="mock">
                <div class="browser-dots"><i></i><i></i><i></i></div>
                <div class="browser-shot"><img src="/assets/portfolio/mockup_coaching.png" alt="Coaching centre website built by Sushanta Digital" width="972" height="598" loading="lazy"></div>
                <div class="scores"><div>98<small>Performance</small></div><div>100<small>SEO</small></div><div>&lt;1.5s<small>Load time</small></div></div>
              </div>`;
  const svc = [
    ['lead-generation', '01', 'Lead Generation', 'tint-0', FUNNEL, 'Every lead tracked!', 'Stop waiting for walk-ins. Get enquiries every single day.',
      'আপনার ব্যবসার জন্য পুরো একটা লিড সিস্টেম: একটা ফোকাসড ল্যান্ডিং পেজ, না বলতে না পারার মতো অফার, অ্যাড বা Google থেকে ভিজিটর, আর WhatsApp ফলো-আপ — যাতে কোনো এনকোয়ারি হাতছাড়া না হয়।',
      ['High-converting landing page built around one offer', 'Lead magnets: free consult, price list, trial class', 'Every lead auto-saved to Google Sheets', 'Weekly report: leads, cost per lead, next steps'],
      ['Coaching centres filling batches', 'Clinics wanting new patients', 'Any business with an empty calendar']],
    ['whatsapp', '02', 'WhatsApp Automation', 'tint-1', chat, 'Replies in 0.5 sec', 'Answer every customer in seconds — even at midnight.',
      'আমাদের কাস্টমাররা ফর্ম বা ইমেলের চেয়ে WhatsApp বেশি পছন্দ করে। আপনার WhatsApp Business নম্বরে স্মার্ট মেনু, ইনস্ট্যান্ট রিপ্লাই আর বুকিং — আপনি ঘুমোলেও লিড আসবে।',
      ['Instant greeting with services, prices and timings', 'Slot booking and catalogue sharing', 'Automatic follow-ups for people who go quiet', 'Your team can take over any chat anytime'],
      ['Businesses that miss calls', 'Owners answering the same questions daily', 'Anyone getting enquiries after hours']],
    ['meta-ads', '03', 'Meta Ads (FB & IG)', 'tint-2', ad, 'Only nearby buyers', 'Ads that bring enquiries, not just likes.',
      'আপনার পিনকোডের আশেপাশের মানুষদের টার্গেট করা ক্যাম্পেন — নজরকাড়া ডিজাইন আর লেখা, যা সোজা আপনার WhatsApp-এ নিয়ে আসে।',
      ['Hyper-local targeting within 5–15 km', 'Ad creatives, reels and copywriting', 'Meta Pixel & Conversions API tracking', 'Budgets that work from ₹200–₹400/day'],
      ['Salons and spas filling weekdays', 'Restaurants promoting offers', 'New businesses that need awareness fast']],
    ['web-dev', '04', 'App & Website Development', 'tint-3', web, 'Loads in a flash', 'A fast website that works like your best salesperson.',
      'পরিষ্কার, মোবাইল-ফার্স্ট ওয়েবসাইট আর সহজ ওয়েব অ্যাপ — ১.৫ সেকেন্ডে খোলে, Google-এ র‍্যাঙ্ক করে, আর প্রতিটা ভিজিটরকে কল বা WhatsApp-এর দিকে নিয়ে যায়।',
      ['Custom design — no slow templates', '1-tap WhatsApp & call buttons everywhere', 'SEO-ready structure and Google Maps', 'Booking forms, catalogues, dashboards'],
      ['Businesses with no website yet', 'Slow or outdated WordPress sites', 'Owners who need a simple web app']],
  ];
  const body = `
    <section class="ph ph--navy on-dark">
      <div class="container">
        ${crumbs('Services')}
        <h1 class="ph__title">Services that bring you ${mark('customers')}</h1>
        <p class="ph__lead">চারটে সার্ভিস, একটা সহজ সিস্টেম। যেটা দরকার বেছে নিন — অথবা আমি বলে দেব কোনটা সবচেয়ে তাড়াতাড়ি কাস্টমার আনবে।</p>
        <div class="ph-tabs">
          ${svc.map(([id, n, name, , , , sub]) => `<a class="ph-tab" href="#${id}"><small>${n}</small><b>${esc(name)}</b><span>${sub}</span></a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container svc">
        <nav class="svc__nav" aria-label="Services">
          ${svc.map(([id, n, name], i) => `<a href="#${id}"${i === 0 ? ' class="active"' : ''}><span>${n}</span>${esc(name)}</a>`).join('')}
          <a href="#contact" class="btn btn--primary" style="justify-content: center; color: var(--ink); background: var(--primary);">Get a free plan &rarr;</a>
        </nav>
        <div>
          ${svc.map(([id, n, name, tint, vis, note, title, p, gets, fit]) => `
          <article class="svc__panel" id="${id}">
            <div class="svc__visual ${tint} reveal-scale">${vis}<span class="doodle">${note}</span></div>
            <span class="eyebrow eyebrow--outline">${n} — ${esc(name)}</span>
            <h2>${SVC_HEADLINES[id]}</h2>
            <p>${p}</p>
            <div class="svc__cols">
              <div><h3>What you get</h3><ul class="ticks">${gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>
              <div><h3>Perfect for</h3><ul class="ticks">${fit.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>
            </div>
            <a href="#contact" class="btn btn--dark" data-service="${esc(name)}">Get ${esc(name)} for my business <span class="arr">&rarr;</span></a>
          </article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">${secHead({ eyebrow: 'Add-ons', title: `Extras that multiply ${mark('results')}`, center: true })}
        <div class="cards-3">
          ${[['seo', '📍', 'Local SEO & Google Maps', 'Google Business Profile setup and optimisation so you show up in the top 3 when people nearby search.'],
            ['speed', '⚡', 'Speed Optimization', 'Already have a site? We make it load under 2 seconds on mobile so you stop losing visitors.'],
            ['support', '🛠️', 'Ongoing Maintenance', 'Price changes, festive offers, new photos — just text on WhatsApp. Hosting, backups and security handled.']]
            .map(([id, e, t, d]) => `<div class="card reveal" id="${id}"><div class="icon-tile">${e}</div><h3>${esc(t)}</h3><p>${d}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">${secHead({ eyebrow: 'Who we help', title: `Made for local ${mark('businesses')}`, lead: 'কাস্টমার যদি আপনাকে কাছাকাছি খোঁজে আর কেনার আগে কথা বলে — তাহলে এই সিস্টেম আপনার জন্যই।' })}
        <div class="industries">
          ${[['🎓', 'Coaching & Tuition'], ['🦷', 'Clinics & Doctors'], ['💇', 'Salons & Spas'], ['✈️', 'Travel Agencies'], ['🍽️', 'Restaurants & Cafés'], ['🏠', 'Real Estate'], ['🛍️', 'Retail Shops'], ['🏋️', 'Gyms & Fitness'], ['⚖️', 'Professional Services']]
            .map(([e, t]) => `<div class="industry reveal"><b>${e}</b>${esc(t)}</div>`).join('')}
        </div>
      </div>
    </section>
${ctaBand('Not sure which service you need?', "Tell me about your business in a 15-minute call. I'll suggest the one thing that will bring you customers fastest — free, no pressure.")}`;
  return page({
    path: '/services',
    head: {
      title: 'Services: Lead Generation, WhatsApp Automation & Meta Ads | Sushanta Digital',
      description: 'Lead generation, WhatsApp automation, Facebook & Instagram ads and fast websites for local businesses in Purulia, West Bengal and across India. Get a free growth plan.',
      crumb: [['Services', '/services']],
      schema: [{ '@type': 'OfferCatalog', name: 'Sushanta Digital Services', itemListElement: ['Lead Generation', 'WhatsApp Automation', 'Meta Ads Management', 'Website & App Development', 'Local SEO & Google Business Profile', 'Website Maintenance']
        .map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n, provider: { '@id': `${SITE}/#business` }, areaServed: 'IN' } })) }],
    },
    body,
  });
}

/* =========================================================
   WORK — light gallery header + filterable case studies
   ========================================================= */
function work() {
  const body = `
    <section class="ph ph--light">
      <div class="container">
        ${crumbs('Work')}
        <div class="ph__row">
          <h1 class="ph__title">Real businesses. ${mark('Real results.')} ${sticker('Real clients ✓', 'stk--lime stk--inline')}</h1>
          <div class="ph-stats reveal">
            <div><strong data-count>50+</strong><span>Businesses served</span></div>
            <div><strong data-count>3.2x</strong><span>Avg. enquiry growth</span></div>
            <div><strong data-count>7</strong><span>Days to launch</span></div>
          </div>
        </div>
        <p class="ph__lead">এডুকেশন প্ল্যাটফর্ম, এক্সাম প্রিপারেশন আর AI টুল — আমার বানানো আসল প্রজেক্টগুলো দেখুন। যেকোনো ছবিতে ট্যাপ করে প্রিভিউ দেখুন।</p>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        ${list('projects', projectsHtml(published(C.projects), 'work'), 'work', 'cases')}
      </div>
    </section>

${ctaBand('Your business could be the next case study.', 'I take on a limited number of projects each month so every client gets my full attention. Grab a slot for a free strategy call.', 'Claim My Free Strategy Call')}`;
  return page({
    path: '/work',
    head: { title: 'Portfolio & Case Studies: Websites That Bring Customers | Sushanta Digital', description: 'Case studies of websites, WhatsApp automation and Meta ads for coaching centres, clinics, salons and travel agencies in West Bengal — with real enquiry and booking results.', crumb: [['Work', '/work']] },
    body, modal: true,
  });
}

/* =========================================================
   PRICING — mint header, plans, ROI calculator, comparison
   ========================================================= */
function pricing() {
  const rows = [['Custom pages', '1', 'Up to 5', 'Unlimited'], ['Mobile-first, fast design', 'y', 'y', 'y'], ['WhatsApp click-to-chat', 'y', 'y', 'y'],
    ['WhatsApp auto-reply & lead capture', 'n', 'y', 'Advanced bot'], ['Leads saved to Google Sheets', 'n', 'y', 'y'],
    ['Local SEO & Google Business Profile', 'Maps only', 'y', 'Advanced'], ['Meta ads setup + creatives', 'n', 'n', 'y'],
    ['Pixel & conversion tracking', 'n', 'n', 'y'], ['Free support after launch', 'Guidance', '30 days', '60 days VIP'], ['Delivery time', '5 days', '7 days', '7–10 days']];
  const cell = (v, hot) => `<td${hot ? ' class="hot"' : ''}>${v === 'y' ? '<span class="y" aria-label="Included">✓</span>' : v === 'n' ? '<span class="n" aria-label="Not included">—</span>' : esc(v)}</td>`;
  const range = (id, name, label, min, max, step, value) => `
            <div class="roi__field"><label for="${id}">${label} <output for="${id}"></output></label><input type="range" id="${id}" name="${name}" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
  const body = `
    <section class="ph ph--mint" style="text-align: center;">
      <div class="container">
        ${crumbs('Pricing')}
        <h1 class="ph__title" style="margin: 0 auto;">Plans that ${mark('pay for themselves')}</h1>
        <div class="stk-row" style="justify-content: center; margin-top: 22px;">${sticker('🙌 No hidden fees', 'stk--lime')}${sticker('⚡ Live in 7 days', 'stk--white')}</div>
        <p class="ph__lead" style="margin-left: auto; margin-right: auto;">লোকাল ব্যবসার বাজেটের কথা ভেবে বানানো এককালীন প্যাকেজ। শুরুতে ৫০%, আর বাকি ৫০% ডিজাইন পছন্দ হওয়ার পরে।</p>
      </div>
    </section>

    <section class="section section--tight" id="plans" style="scroll-margin-top: 90px;">
      <div class="container">
        ${list('plans', plansHtml(PLANS(), 'cards'), 'cards', 'plans')}
        <div class="guarantee reveal">🛡️ <span><strong>100% satisfaction guarantee:</strong> we revise until you love it — before it goes live.</span></div>
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">${secHead({ eyebrow: 'Worth it?', title: `What could more leads be ${mark('worth')}?`, lead: 'স্লাইডার সরিয়ে দেখুন, মাসে কয়েকজন বেশি কাস্টমার মানে আপনার ব্যবসার জন্য কতটা।', center: true })}
        <div class="roi reveal" id="roi">
          <div class="roi__inputs">
            ${range('roiLeads', 'leads', 'Extra enquiries per month', 10, 300, 5, 60)}
            ${range('roiRate', 'rate', 'Enquiries that become customers', 5, 60, 1, 20)}
            ${range('roiValue', 'value', 'Average value of one customer', 500, 50000, 500, 3000)}
          </div>
          <div class="roi__result">
            <p>Extra revenue every month</p>
            <div class="big-num" data-roi="revenue">₹36,000</div>
            <p><strong data-roi="customers">12</strong> new customers a month · Growth plan pays back in about <strong data-roi="payback">13 days</strong></p>
            <p class="roi__note">An estimate to help you think, not a promise. Real results depend on your offer, market and follow-up.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">${secHead({ eyebrow: 'Compare', title: `What's inside ${mark('each plan')}` })}
        <div class="table-wrap reveal">
          <table class="table">
            <thead><tr><th scope="col">Feature</th><th scope="col">Starter<small>₹6,999</small></th><th scope="col" class="hot">Growth<small>₹14,999</small></th><th scope="col">Full Suite<small>₹24,999</small></th></tr></thead>
            <tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td>${cell(r[1])}${cell(r[2], true)}${cell(r[3])}</tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="section section--flush-top">
      <div class="container">${secHead({ eyebrow: 'Monthly add-ons', title: `Keep the ${mark('leads coming')}`, lead: 'সিস্টেম লাইভ হওয়ার পরে চাইলে নিতে পারেন — আপনার লক্ষ্য আর বাজেট বুঝে দাম।' })}
        <div class="cards-3">
          ${[['🎯', 'Lead Generation Retainer', 'Monthly campaigns, landing page tests and a weekly lead report for businesses that want enquiries every day.'],
            ['📣', 'Meta Ads Management', 'Ongoing Facebook & Instagram management with fresh creatives monthly. Ad budget paid directly to Meta.'],
            ['🛠️', 'Care & Maintenance', 'Hosting, backups, security and small updates over WhatsApp after your free support period ends.']]
            .map(([e, t, d]) => `<div class="card reveal"><div class="icon-tile">${e}</div><h3>${esc(t)}</h3><p>${esc(d)}</p><a href="${waLink(`Hi Sushanta! Can I get a quote for ${t}?`)}" target="_blank" rel="noopener noreferrer" class="link-arrow">Get a quote &rarr;</a></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--flush-top">
      <div class="container faq-cols">
        <div class="sec-head reveal"><div><span class="eyebrow">Pricing FAQ</span><h2 class="h-section">Before you ${mark('decide')}</h2><p class="lead">Anything else? Ask me on WhatsApp — I'll answer honestly.</p></div></div>
        ${list('faqs', faqsHtml(C.faqs.filter((f) => f.published), 'pricing'), 'pricing', 'faq-accordion-wrap reveal')}${faqLd('pricing')}
      </div>
    </section>
${ctaBand("Not sure which plan fits? I'll tell you honestly.", "Share your business and budget on WhatsApp. I'll recommend the smallest plan that gets you real results — even if it's the cheapest one.", 'Help Me Choose a Plan', 'Hi Sushanta! Can you help me choose the right plan?')}`;
  return page({
    path: '/pricing',
    head: {
      title: 'Website & Digital Marketing Pricing from ₹6,999 | Sushanta Digital',
      description: 'Transparent one-time pricing for websites, WhatsApp automation and Meta ads for local businesses: Starter ₹6,999, Growth ₹14,999, Full Suite ₹24,999. No hidden fees.',
      crumb: [['Pricing', '/pricing']],
      schema: [{ '@type': 'OfferCatalog', name: 'Website & Growth Packages', itemListElement: PLANS().map((p) => ({ '@type': 'Offer', name: p.name, price: p.price.replace(/,/g, ''), priceCurrency: 'INR', seller: { '@id': `${SITE}/#business` }, url: `${SITE}/pricing#plans` })) }],
    },
    body,
  });
}

/* =========================================================
   ABOUT — editorial layout with arched portrait
   ========================================================= */
function about() {
  const body = `
    <section class="ph ph--soft">
      <div class="container about-hero">
        <div class="about-hero__photo reveal-scale">
          <img src="/assets/images/hero_workspace.jpg" alt="Sushanta Lohar at work in Manbazar, Purulia" width="1376" height="768">
          <div class="float" style="--r: -4deg;"><span class="chip">Hi, I'm Sushanta :)</span></div>
        </div>
        <div>
          ${crumbs('About')}
          <h1 class="ph__title">Your digital partner. ${mark('No fluff.')}</h1>
          <p class="ph__lead">আমি Sushanta Lohar, পুরুলিয়ার মানবাজারের একজন গ্রোথ স্ট্র্যাটেজিস্ট। সহজ সিস্টেম, সৎ পরামর্শ আর সরাসরি ১-অন-১ সাপোর্ট দিয়ে লোকাল ব্যবসার মালিকদের অনলাইনে বেশি কাস্টমার পেতে সাহায্য করি।</p>
          <div class="ph-stats" style="margin-top: 34px;">
            <div><strong data-count>50+</strong><span>Projects shipped</span></div>
            <div><strong data-count>7</strong><span>Days avg. launch</span></div>
            <div><strong data-count>15</strong><span>Min reply time</span></div>
          </div>
          <span class="signature">— Sushanta</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p class="pull-quote reveal">"Local businesses don't need expensive jargon. They need <em>paying customers.</em> So I build fast, simple systems that match how Indian customers actually buy."</p>
      </div>
    </section>

    <section class="section section--flush-top">
      <div class="container split">
        <div class="reveal">
          <span class="eyebrow">My story</span>
          <h2 class="h-section">Why I started ${mark('Sushanta Digital')}</h2>
          <p class="lead">বারবার এমন পরিশ্রমী মালিকদের সাথে দেখা হত — ডাক্তার, কোচিং ডিরেক্টর, স্যালন মালিক, ট্রাভেল এজেন্ট — যারা এজেন্সিকে ₹50,000+ দিয়ে এমন স্লো টেমপ্লেট ওয়েবসাইট বানিয়েছেন, যা থেকে একটা ফোনও আসেনি।</p>
          <p class="lead">মানুষ স্লো ওয়েবসাইট পছন্দ করে না, আর WhatsApp-এ সাথে সাথে উত্তর পেতে ভালোবাসে। তাই দুটোর জন্যই বানাই: হালকা ওয়েবসাইট, WhatsApp ফানেল আর লোকাল অ্যাড — মাপকাঠি লাইক নয়, এনকোয়ারি।</p>
        </div>
        <div class="panel panel--dark reveal">
          <h3>What working with me looks like</h3>
          <ul class="ticks"><li>You talk to me directly — never a junior or a ticket system</li><li>A private preview link before anything goes live</li><li>Plain-language updates on WhatsApp</li><li>Honest advice, even when it means a smaller plan</li><li>Support after launch, not a disappearing act</li></ul>
        </div>
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">${secHead({ eyebrow: 'Values', title: `4 promises. ${mark('Zero nonsense.')}`, center: true })}
        <div class="values">
          ${[['Direct 1-on-1', 'You talk directly with me on WhatsApp at every step, with quick replies and regular previews.'],
            ['7-day launches', 'Agencies take months. My proven process launches your site and lead system in 5–7 days.'],
            ['WhatsApp-first', "Your customers won't fill long forms. I turn your website into a straight path to your WhatsApp."],
            ['Measured in customers', 'Every headline, button and ad is designed — and tracked — to bring qualified enquiries.']]
            .map(([t, d]) => `<div class="value reveal"><div><h3>${t}</h3><p>${d}</p></div></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">${secHead({ eyebrow: 'Toolkit', title: `Tools I use to ${mark('grow you')}`, lead: 'পরীক্ষিত, নির্ভরযোগ্য প্ল্যাটফর্ম — ঠিকঠাক সেটআপ করা, আর মালিকানা আপনার।', center: true })}
        <div class="pill-row reveal">${['WhatsApp Business API', 'Meta Ads Manager', 'Google Business Profile', 'Google Search Console', 'Google Sheets automations', 'HTML / CSS / JS', 'Cloudflare', 'Meta Pixel & CAPI', 'Canva & Figma'].map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</div>
      </div>
    </section>
${ctaBand("Let's grow your business together.", "A 15-minute call is all it takes to see if we're a good fit. You'll leave with at least one idea you can use right away.")}`;
  return page({
    path: '/about',
    head: {
      title: 'About Sushanta Lohar — Digital Growth Partner in Purulia, West Bengal | Sushanta Digital',
      description: 'Meet Sushanta Lohar, the Manbazar, Purulia-based digital growth strategist helping local businesses get more customers with websites, WhatsApp automation and Meta ads.',
      crumb: [['About', '/about']], ogType: 'profile',
      schema: [{ '@type': 'Person', '@id': `${SITE}/#sushanta`, name: 'Sushanta Lohar', jobTitle: 'Digital Growth Strategist', worksFor: { '@id': `${SITE}/#business` }, image: `${SITE}/assets/images/gen_sushanta_circle.png`, address: { '@type': 'PostalAddress', addressLocality: 'Manbazar', addressRegion: 'West Bengal', addressCountry: 'IN' } }],
    },
    body,
  });
}

/* =========================================================
   PROCESS — scroll-filled timeline
   ========================================================= */
function processPage() {
  const steps = [
    ['01', 'Days 1 – 2', 'Discovery & content', 'A friendly 15-minute chat about your services, customers, competitors and goals. You send photos, logo and price list on WhatsApp.', 'Page plan, headline copy and a wireframe.'],
    ['02', 'Days 3 – 4', 'Design & mobile-first build', 'I design and code your custom site for phones first, with clear calls-to-action, then share a private preview link.', 'A live preview link + a round of free revisions.'],
    ['03', 'Days 5 – 6', 'WhatsApp funnel & tracking', 'Auto-replies, menus and booking flows on your WhatsApp Business. Leads sync to Google Sheets. Ad creatives prepared if included.', 'Working chatbot demo + Google Sheets lead sync.'],
    ['04', 'Day 7', 'Launch, SEO & Google Maps', 'Domain connected with SSL, site submitted to Google Search Console, Google Business Profile updated and everything tested live.', 'Live website + Maps listing + free support begins.'],
  ];
  const body = `
    <section class="ph ph--navy on-dark">
      <div class="container">
        ${crumbs('Process')}
        <h1 class="ph__title">From idea to enquiries in ${mark('7 days')}</h1>
        <p class="ph__lead">অন্তহীন মিটিং নেই, টেকনিক্যাল মাথাব্যথা নেই। প্রথম কথা থেকে প্রথম কাস্টমার এনকোয়ারি পর্যন্ত ঠিক কী কী হয়, এখানে দেখুন।</p>
        <div class="ph-steps">${steps.map(([n, , t]) => `<span><b>${n}</b>${esc(t)}</span>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="timeline">
          <div class="timeline__rail" aria-hidden="true"><span></span></div>
          ${steps.map(([n, w, t, d, dl]) => `<div class="tl-item"><div class="step__num">${n}</div><div class="tl-card reveal"><span class="step__when">${w}</span><h3>${esc(t)}</h3><p>${d}</p><div class="deliverable">📌 <strong>You get:</strong> ${dl}</div></div></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">${secHead({ eyebrow: 'Who does what', title: `You run your business. ${mark('I handle the rest.')}`, center: true })}
        <div class="duo">
          <div class="panel reveal"><h3>📨 What you send me</h3><ul class="ticks">${['Your logo (or we make a simple one)', 'Photos of your work, shop or team', 'List of services and prices', 'WhatsApp Business number', '15 minutes for a kickoff call'].map((x) => `<li>${x}</li>`).join('')}</ul></div>
          <div class="panel panel--dark reveal"><h3>🧰 What I take care of</h3><ul class="ticks">${['Design, copywriting and coding', 'Domain, hosting and SSL setup', 'WhatsApp automation & Google Sheets', 'Google Maps & Search Console', 'Testing on real phones before launch'].map((x) => `<li>${x}</li>`).join('')}</ul></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">${secHead({ eyebrow: 'After launch', title: `Launch day is just ${mark('day one')}` })}
        <div class="cards-3">
          ${[['📈', 'Track', 'See every enquiry in your Google Sheet and know which source it came from.'], ['🛠️', 'Support', '30–60 days of free updates. Price changes, offers, new photos — just WhatsApp me.'], ['🚀', 'Grow', "Once leads flow, we add ads or more pages to scale what's already working."]]
            .map(([e, t, d]) => `<div class="card reveal"><div class="icon-tile">${e}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </div>
    </section>
${ctaBand('Ready to be live next week?', 'Book your 15-minute kickoff call today. Start now and your website and WhatsApp funnel can be taking enquiries in 7 days.', 'Book My Kickoff Call')}`;
  return page({
    path: '/process',
    head: {
      title: 'Our 7-Day Website & Lead System Process | Sushanta Digital',
      description: 'See exactly how Sushanta Digital takes your local business from idea to live website, WhatsApp automation and Google Maps in 7 days — with zero technical headache.',
      crumb: [['Process', '/process']],
      schema: [{ '@type': 'HowTo', name: 'How Sushanta Digital launches a local business website in 7 days', totalTime: 'P7D', step: steps.map(([, , t, d], i) => ({ '@type': 'HowToStep', position: i + 1, name: t, text: d })) }],
    },
    body,
  });
}

/* =========================================================
   REVIEWS — rating summary + masonry wall
   ========================================================= */
function reviewsPage() {
  const body = `
    <section class="ph ph--navy on-dark">
      <div class="container">
        ${crumbs('Reviews')}
        <div class="ph__row">
          <div>
            <h1 class="ph__title">Loved by ${mark('local businesses')}</h1>
            <p class="ph__lead">ডাক্তার, কোচিং ডিরেক্টর, স্যালন মালিক, ট্রাভেল এজেন্ট আর দোকানদাররা বলছেন — Sushanta Digital-এর সাথে কাজের পরে কী বদলেছে।</p>
          </div>
          <div class="rating-card reveal">
            <div><div class="big-num">4.9</div><div class="stars" style="font-size: 20px;">★★★★★</div><span style="font-size: 13px; color: rgba(255,255,255,.6);">Average rating</span></div>
            <div class="bars">${[['5★', 92], ['4★', 6], ['3★', 2], ['2★', 0], ['1★', 0]].map(([l, p]) => `<div><span>${l}</span><i style="--p: ${p}%"></i><span>${p}%</span></div>`).join('')}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${list('reviews', reviewsHtml(published(C.reviews)), 'wall', 'reviews-wall')}
      </div>
    </section>
${ctaBand('Want a review like this about your business?', "Start with a free 15-minute call. I'll show you exactly how we'd get you more enquiries.")}`;
  const reviews = published(C.reviews);
  return page({
    path: '/reviews',
    head: {
      title: 'Client Reviews & Testimonials | Sushanta Digital',
      description: 'Read reviews from coaching centres, clinics, salons, travel agencies and shops in West Bengal who grew their enquiries with Sushanta Digital.',
      crumb: [['Reviews', '/reviews']],
      schema: [{ '@type': 'ItemList', name: 'Client testimonials', itemListElement: reviews.map((r, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Review', reviewBody: r.quote, author: { '@type': 'Person', name: r.name }, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }, itemReviewed: { '@id': `${SITE}/#business` } } })) }],
    },
    body,
  });
}

/* =========================================================
   FAQ — searchable help centre
   ========================================================= */
function faq() {
  const body = `
    <section class="ph ph--navy on-dark">
      <div class="container">
        ${crumbs('FAQ')}
        <h1 class="ph__title">How can I ${mark('help?')}</h1>
        <p class="ph__lead">ওয়েবসাইট, লিড জেনারেশন, WhatsApp অটোমেশন, অ্যাড, দাম আর সাপোর্ট — সব প্রশ্নের সহজ উত্তর এখানে খুঁজুন।</p>
        <div class="faq-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <label for="faqSearch" class="sr-only">Search questions</label>
          <input type="search" id="faqSearch" placeholder="Try “payment”, “WhatsApp” or “Google”…" autocomplete="off">
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container container--wide">
        ${list('faqs', faqsHtml(C.faqs.filter((f) => f.published), 'page'), 'page')}${faqLd('page')}
        <p class="faq-empty">No matching questions. <a href="${waLink('Hi Sushanta! I have a question.')}" target="_blank" rel="noopener noreferrer" class="link-arrow">Ask me on WhatsApp &rarr;</a></p>
      </div>
    </section>
${ctaBand('Still have a question? Just ask.', 'Text me directly on WhatsApp. I usually reply within 15 minutes during working hours.', 'Ask Sushanta on WhatsApp', 'Hi Sushanta! I have a question.')}`;
  return page({
    path: '/faq',
    head: { title: 'FAQ: Websites, Lead Generation, WhatsApp & Ads | Sushanta Digital', description: 'Answers about website timelines, lead generation, WhatsApp automation, Meta ad budgets, pricing, payments and support for local businesses.', crumb: [['FAQ', '/faq']] },
    body,
  });
}

/* =========================================================
   BLOG — magazine layout (posts managed in /admin)
   ========================================================= */
function blog() {
  const posts = published(C.posts);
  const body = `
    <section class="ph ph--light bj-head">
      <div class="container" style="text-align: center;">
        ${sticker('📚 Free playbooks', 'stk--lime')}
        <h1 class="ph__title" style="margin: 22px auto 0;">The Growth ${mark('Journal')}</h1>
        <p class="ph__lead" style="margin-left: auto; margin-right: auto;">লিড জেনারেশন, WhatsApp অটোমেশন, Meta Ads আর লোকাল SEO নিয়ে সহজ, কাজের গাইড — ৫ মিনিটে পড়ে আজই কাজে লাগান।</p>
      </div>
    </section>

    <section class="section section--tight" id="articles">
      <div class="container bj">
        ${list('posts', postsHtml(posts, 'blog'), 'blog')}
      </div>
    </section>

    <section class="section section--flush-top">
      <div class="container">
        <div class="bj-sub reveal">
          <div>
            <span class="stk stk--white">💌 New every month</span>
            <h2>Get new playbooks on WhatsApp</h2>
            <p>নতুন গাইড বেরোলেই WhatsApp-এ পেয়ে যাবেন। কোনো স্প্যাম নয় — মাসে একবার।</p>
          </div>
          <a href="${waLink('Hi Sushanta! Please send me new growth playbooks on WhatsApp.')}" target="_blank" rel="noopener noreferrer" class="btn btn--dark">${waIcon(18)} Send me playbooks <span class="arr">&rarr;</span></a>
        </div>
      </div>
    </section>
`;
  return page({
    path: '/blog',
    head: {
      title: 'Blog: Lead Generation, WhatsApp & Local SEO Guides | Sushanta Digital',
      description: 'Free practical guides for local businesses on lead generation, WhatsApp automation, Facebook & Instagram ads, Google Maps ranking and fast websites.',
      crumb: [['Blog', '/blog']],
      schema: [{ '@type': 'Blog', name: 'Sushanta Digital Growth Journal', url: `${SITE}/blog` }],
    },
    body,
  });
}

/* =========================================================
   CONTACT — split first fold: info panel + form
   ========================================================= */
function contact() {
  const body = `
    <section class="contact-page">
      <div class="contact-page__info on-dark">
        ${crumbs('Contact')}
        <span class="eyebrow eyebrow--light">Usually replies in 15 minutes</span>
        <h1>Let's discuss ${mark('your project')}</h1>
        <p>আপনার ব্যবসার কথা বলুন। কীভাবে বেশি কাস্টমার পাবেন, আমি নিজে সবচেয়ে ভালো উপায়টা বলে দেব — সৎ আর পরিষ্কার দামে।</p>
        <div class="channels">
          <a class="channel" href="${waLink("Hi Sushanta! I'd like to discuss my business.")}" target="_blank" rel="noopener noreferrer"><div class="icon-tile">${waIcon(22, '#25D366')}</div><div><b>WhatsApp</b><span data-cms-text="phone_display">${esc(S.phone_display)}</span></div></a>
          <a class="channel" href="tel:+${S.whatsapp}" data-cms-href="phone"><div class="icon-tile">📞</div><div><b>Call</b><span>Mon–Sat, 10am–8pm</span></div></a>
          <a class="channel" href="mailto:${S.email}" data-cms-href="email"><div class="icon-tile">✉️</div><div><b>Email</b><span data-cms-text="email">${esc(S.email)}</span></div></a>
          <div class="channel"><div class="icon-tile">📍</div><div><b>Location</b><span data-cms-text="location">${esc(S.location)}</span></div></div>
        </div>
      </div>
      <div class="contact-page__form">
        <div style="width: 100%; max-width: 560px;">
${form({ textarea: true })}
          <ol class="next-steps">
            <li>I personally review your business, website and Google presence.</li>
            <li>You get a short, free strategy with clear next steps on WhatsApp.</li>
            <li>You decide if you want to go ahead — zero commitment, no spam.</li>
          </ol>
        </div>
      </div>
    </section>
`;
  return page({
    path: '/contact',
    head: {
      title: 'Contact Sushanta Digital — Free Consultation on WhatsApp',
      description: 'Get a free growth consultation for your local business. Contact Sushanta on WhatsApp at +91 95477 71118 or email contact@susanta.me. Usually replies in 15 minutes.',
      crumb: [['Contact', '/contact']],
      schema: [{ '@type': 'ContactPage', url: `${SITE}/contact`, about: { '@id': `${SITE}/#business` } }],
    },
    body, contact: false,
  });
}


/* =========================================================
   LEGAL — Privacy Policy & Terms (simple English)
   ========================================================= */
function legalPage({ path, title, intro, updated, sections, description }) {
  const body = `
    <section class="ph ph--light legal-head">
      <div class="container container--narrow">
        <span class="eyebrow">Legal</span>
        <h1 class="ph__title" style="max-width: none; margin-top: 16px;">${title}</h1>
        <p class="ph__lead">${intro}</p>
        <p class="legal-updated">Last updated: ${updated}</p>
      </div>
    </section>
    <section class="section section--tight">
      <div class="container container--narrow">
        <div class="prose legal">
          ${sections.map(([h, html]) => `<h2>${h}</h2>${html}`).join('\n          ')}
        </div>
      </div>
    </section>
`;
  return page({ path, head: { title: `${title} | Sushanta Digital`, description, crumb: [[title, path]] }, body });
}

const CONTACT_LINES = `<ul><li>WhatsApp / Mobile: <a href="tel:+919547771118" data-cms-href="phone"><span data-cms-text="phone_display">+91 95477 71118</span></a></li><li>Email: <a href="mailto:contact@susanta.me" data-cms-href="email"><span data-cms-text="email">contact@susanta.me</span></a></li><li>Address: <span data-cms-text="location">Manbazar, Purulia, West Bengal</span>, India</li></ul>`;

function privacy() {
  return legalPage({
    path: '/privacy-policy', title: 'Privacy Policy', updated: '31 October 2026',
    description: 'How Sushanta Digital collects, uses and protects the information you share through this website.',
    intro: 'This page explains what information we collect when you use this website, why we collect it, and how we keep it safe. We keep it short and simple.',
    sections: [
      ['Who we are', '<p>Sushanta Digital is run by Sushanta Lohar from Manbazar, Purulia, West Bengal, India. We build websites, WhatsApp automation, lead generation systems and Meta ad campaigns for businesses. In this policy, “we”, “us” and “our” mean Sushanta Digital.</p>'],
      ['What we collect', '<p>When you fill in the enquiry form on this website, we collect:</p><ul><li>Your name and phone number</li><li>Your business type and what you need</li><li>The page you sent the form from, and the ad or website that brought you here (if any)</li></ul><p>When you message us on WhatsApp, call us or email us, we also receive whatever you choose to share in that conversation.</p><p>We do <strong>not</strong> collect payment card details on this website.</p>'],
      ['How we use it', '<ul><li>To reply to your enquiry and give you a quote or advice</li><li>To deliver and support the work you ask us to do</li><li>To understand which pages and ads bring enquiries, so we can improve the website</li></ul><p>We do not sell, rent or trade your information to anyone.</p>'],
      ['WhatsApp', '<p>When you press “Send on WhatsApp”, your details open in the WhatsApp app so you can send them to us. WhatsApp is run by Meta and has its own privacy policy.</p>'],
      ['Where your data is stored', '<p>Enquiries are stored securely on Cloudflare’s servers, which this website runs on. Only Sushanta Digital can see them, through a password-protected admin panel. To protect against spam, we keep a scrambled (hashed) version of your internet address for a short check — not your actual address.</p>'],
      ['Cookies', '<p>This website does not use advertising or tracking cookies. The only cookie is a login cookie used by our own admin panel, which visitors never receive.</p>'],
      ['How long we keep it', '<p>We keep enquiries for as long as they are useful for following up or serving you, and delete them when they are no longer needed — or sooner if you ask.</p>'],
      ['Your choices', '<p>You can ask us at any time to see, correct or delete the information we hold about you. Just contact us using the details below and we will reply within a reasonable time.</p>'],
      ['Changes to this policy', '<p>If we change this policy, we will update the date at the top of this page.</p>'],
      ['Contact us', CONTACT_LINES],
    ],
  });
}

function terms() {
  return legalPage({
    path: '/terms', title: 'Terms & Conditions', updated: '31 October 2026',
    description: 'The terms for working with Sushanta Digital — quotes, payments, revisions, ownership and support.',
    intro: 'These terms explain how we work together. By using this website or hiring Sushanta Digital, you agree to them. If anything is unclear, just ask us on WhatsApp.',
    sections: [
      ['About us', '<p>Sushanta Digital is run by Sushanta Lohar from Manbazar, Purulia, West Bengal, India. We provide website and app development, WhatsApp automation, lead generation, Meta ads and related digital services.</p>'],
      ['Quotes and scope', '<p>Before we start, we agree on what will be delivered (the “scope”) and the price, usually on WhatsApp or email. Prices shown on this website are starting prices and may change for custom work. Anything outside the agreed scope is quoted separately.</p>'],
      ['Payments', '<ul><li>Projects start after a <strong>50% advance</strong> payment.</li><li>The remaining <strong>50%</strong> is paid after you review and approve the work, before it goes live.</li><li>We accept UPI and bank transfer.</li><li>Monthly services (like ads management or maintenance) are paid in advance each month.</li></ul>'],
      ['Timelines and your part', '<p>Our usual timelines (for example, 5–7 days for a website) start once we have the advance payment and the content we need from you — such as your logo, photos, prices and business details. Delays in sharing content or feedback can move the delivery date.</p>'],
      ['Revisions', '<p>We revise the design until you are happy with it, within the agreed scope, before it goes live. Large changes in direction after approval may be charged separately.</p>'],
      ['Third-party costs', '<p>Some things are paid directly to other companies and are not included in our fee unless clearly stated — for example your domain name, hosting, paid WhatsApp Business API usage, and your advertising budget paid to Meta (Facebook/Instagram).</p>'],
      ['Ownership', '<p>Once the full payment is made, the website content and design made for you belong to you. Your domain and ad accounts are kept in your name. We may show the finished work in our portfolio, unless you ask us not to.</p>'],
      ['Results', '<p>We work hard to bring you more enquiries and customers, but results depend on many things outside our control — your offer, prices, market and how quickly you follow up. So we cannot guarantee specific sales or numbers.</p>'],
      ['Refunds', '<p>If you cancel before work has started, we refund the advance. Once work has started, the advance covers the work already done and is not refundable. Fees for work that has been delivered and approved are not refundable.</p>'],
      ['Support', '<p>Free support after launch is included for the period stated in your plan. After that, support and changes are available as a paid monthly plan or per task.</p>'],
      ['Liability', '<p>We are not responsible for losses caused by third-party services (like hosting, WhatsApp, Meta or Google) or by changes made to your website by someone else. Our total liability is limited to the amount you paid us for the work in question.</p>'],
      ['Governing law', '<p>These terms are governed by the laws of India. Any disputes will be handled by the courts of Purulia, West Bengal.</p>'],
      ['Contact us', CONTACT_LINES],
    ],
  });
}

function notFound() {
  return head({ path: '/404', title: 'Page Not Found | Sushanta Digital', description: 'The page you were looking for could not be found.', robots: 'noindex, follow' }) + header('') + `
  <main id="main">
    <section class="nf">
      <div class="container">
        <div class="big-num">404</div>
        <h1 class="ph__title" style="color: #fff; margin: 10px auto 20px;">This page took a ${mark('wrong turn')}</h1>
        <p class="ph__lead" style="color: rgba(255,255,255,.7); margin: 0 auto 30px;">The page you're looking for doesn't exist. Let's get you back on track.</p>
        <div class="ph__ctas" style="justify-content: center;"><a href="/" class="btn btn--primary">Back to Home &rarr;</a><a href="/services" class="btn btn--ghost-light">See Services &rarr;</a></div>
      </div>
    </section>
  </main>
` + TAIL;
}

const pages = { 'index.html': home(), 'services.html': services(), 'work.html': work(), 'pricing.html': pricing(), 'about.html': about(),
  'process.html': processPage(), 'reviews.html': reviewsPage(), 'faq.html': faq(), 'blog.html': blog(), 'contact.html': contact(), 'privacy-policy.html': privacy(), 'terms.html': terms(), '404.html': notFound() };
for (const [file, html] of Object.entries(pages)) out(file, html);
console.log(`Built ${Object.keys(pages).length} pages`);
