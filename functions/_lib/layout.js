// Page shell shared by scripts/build.mjs (static pages) and functions/blog/[slug].js.
// Elements marked data-cms-* are filled with live values from /admin by functions/_middleware.js.
import { esc } from './templates.js';

export const SITE = 'https://susanta.me';
export const WA_NUMBER = '919547771118';

const WA_PATH = 'M17.472 14.382c-.36-.18-2.128-1.05-2.458-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.08-.96-1.81-2.15-2.02-2.51-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.54 3.88 6.16 5.45.86.37 1.53.6 2.06.77.87.28 1.66.24 2.29.15.7-.1 2.16-.88 2.46-1.73.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42zM12.044 21.782a9.87 9.87 0 0 1-4.77-1.3l-.33-.2-3.75.98 1-3.65-.22-.35a9.86 9.86 0 0 1-1.51-5.27c0-5.23 4.25-9.48 9.49-9.48 2.54 0 4.93.99 6.73 2.79a9.43 9.43 0 0 1 2.79 6.73c-.01 5.19-4.29 9.41-9.43 9.41z';

export const waIcon = (size = 20, fill = 'currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;

export const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

export const NAV = [
  ['/', 'Home'], ['/services', 'Services'], ['/work', 'Work'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/blog', 'Blog'],
];

export const BUSINESS = {
  '@type': 'ProfessionalService',
  '@id': `${SITE}/#business`,
  name: 'Sushanta Digital',
  url: `${SITE}/`,
  logo: `${SITE}/assets/logo.svg`,
  image: `${SITE}/assets/images/og-cover.jpg`,
  description: 'Lead generation, WhatsApp automation, Meta ads and fast websites for local businesses in Purulia, West Bengal and across India.',
  telephone: '+91-9547771118',
  email: 'contact@susanta.me',
  priceRange: '₹6,999 - ₹24,999',
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI, Bank Transfer',
  address: { '@type': 'PostalAddress', addressLocality: 'Manbazar', addressRegion: 'West Bengal', addressCountry: 'IN' },
  areaServed: [{ '@type': 'City', name: 'Purulia' }, { '@type': 'State', name: 'West Bengal' }, { '@type': 'Country', name: 'India' }],
  founder: { '@type': 'Person', '@id': `${SITE}/#sushanta`, name: 'Sushanta Lohar', jobTitle: 'Digital Growth Strategist' },
  knowsAbout: ['Lead generation', 'WhatsApp Business automation', 'Meta Ads', 'Website development', 'Local SEO', 'Google Business Profile'],
  contactPoint: { '@type': 'ContactPoint', telephone: '+91-9547771118', contactType: 'sales', availableLanguage: ['English', 'Bengali', 'Hindi'] },
};

const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Sushanta Digital', inLanguage: 'en-IN', publisher: { '@id': `${SITE}/#business` } };

export function head({ path, canonical, title, description, crumb, schema = [], ogType = 'website', image = '/assets/images/og-cover.jpg', robots = 'index, follow, max-image-preview:large', preload }) {
  const url = SITE + (canonical || path);
  const graph = [BUSINESS, WEBSITE, {
    '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description,
    isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#business` }, inLanguage: 'en-IN',
  }];
  if (crumb) {
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      ...crumb.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 2, name, item: SITE + p })),
    ] });
  }
  graph.push(...schema);
  const img = /^https?:/.test(image) ? image : SITE + image;
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Sushanta Lohar">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#141C2E">
  <meta name="geo.region" content="IN-WB">
  <meta name="geo.placename" content="Manbazar, Purulia">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="Sushanta Digital">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${esc(img)}" data-cms-og>
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(img)}" data-cms-og>
  <link rel="icon" href="/assets/logo.svg" data-cms-favicon>
  <link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">${preload ? `\n  <link rel="preload" as="image" href="${preload}" data-cms-preload>` : ''}
  <link rel="stylesheet" href="/styles.css">
  <script>document.documentElement.classList.add('js');</script>
  <script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1).replace(/</g, '\\u003c')}
  </script>
</head>
<body class="page-${esc(path.split('/')[1] || 'home')}">
`;
}

export function header(active) {
  const links = NAV.map(([h, n]) => `<li><a href="${h}" class="nav-link${h === active ? ' active' : ''}"${h === active ? ' aria-current="page"' : ''}>${n}</a></li>`).join('');
  const drawer = [...NAV, ['/process', 'Process'], ['/reviews', 'Reviews'], ['/faq', 'FAQ'], ['/contact', 'Contact']]
    .map(([h, n]) => `<a href="${h}">${n}</a>`).join('');
  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header>
    <nav class="navbar-floating" aria-label="Main navigation">
      <a href="/" class="nav-brand" aria-label="Sushanta Digital home"><img src="/assets/logo.svg" alt="Sushanta Digital" width="150" height="30" data-cms-img="logo"></a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-actions">
        <a href="${waLink("Hi Sushanta, I'd like to chat about my business")}" target="_blank" rel="noopener noreferrer" class="nav-btn-whatsapp" aria-label="WhatsApp">${waIcon(16)}<span class="label">WhatsApp</span></a>
        <a href="/contact" class="nav-btn-talk">Let's Talk &rarr;</a>
        <button class="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg></button>
      </div>
    </nav>
    <div class="mobile-menu-drawer">${drawer}<a href="/contact" class="drawer-cta">Get a Free Consultation &rarr;</a></div>
  </header>
`;
}

export const BUSINESS_TYPES = ['Coaching / Education', 'Travel Agency', 'Clinic / Healthcare', 'Salon & Beauty', 'Retail & E-commerce',
  'Restaurant & Cafe', 'Real Estate', 'Professional Services', 'Other'];

export function form({ textarea = false, title = 'Get your free growth plan' } = {}) {
  const opts = BUSINESS_TYPES.map((o) => `<option value="${esc(o)}">${o === 'Other' ? 'Other Business' : esc(o)}</option>`).join('');
  const req = textarea
    ? '<textarea id="clientRequirement" class="form-textarea" placeholder="e.g. I want more patient enquiries from Facebook"></textarea>'
    : '<input type="text" id="clientRequirement" class="form-input" placeholder="e.g. More enquiries for my clinic">';
  return `
        <div class="form-card reveal" id="contact-form">
          <h3>${title}</h3>
          <p class="form-card__sub">Takes 30 seconds — your details open straight in WhatsApp.</p>
          <form id="projectContactForm">
            <div class="form-grid">
              <div class="form-group"><label for="clientName" class="form-label">Your name <span class="required-star">*</span></label><input type="text" id="clientName" class="form-input" placeholder="Enter your name" autocomplete="name" required></div>
              <div class="form-group"><label for="clientPhone" class="form-label">Phone number <span class="required-star">*</span></label><input type="tel" id="clientPhone" class="form-input" placeholder="Enter phone number" autocomplete="tel" required></div>
              <div class="form-group full"><label for="clientBusinessType" class="form-label">Business type <span class="required-star">*</span></label><select id="clientBusinessType" class="form-select" required><option value="" disabled selected>Select business type</option>${opts}</select></div>
              <div class="form-group full"><label for="clientRequirement" class="form-label">What do you need?</label>${req}</div>
            </div>
            <div class="hp" aria-hidden="true"><label for="clientWebsite">Leave this empty</label><input type="text" id="clientWebsite" name="website" tabindex="-1" autocomplete="off"></div>
            <button type="submit" class="btn-send-whatsapp">${waIcon(20)} Send on WhatsApp &rarr;</button>
            <p class="form-note">🔒 No spam. No commitment.</p>
          </form>
        </div>`;
}

export const CONTACT = `
    <section class="section section--flush-top" id="contact">
      <div class="container">
        <div class="contact-wrap">
          <div class="contact-wrap__copy reveal">
            <span class="eyebrow eyebrow--light">Free consultation</span>
            <h2>Let's discuss<br>your project. <span class="stk stk--lime stk--inline">⚡ Replies in 15 min</span></h2>
            <p>আপনার ব্যবসার কথা একটু বলুন। কীভাবে সবচেয়ে তাড়াতাড়ি বেশি কাস্টমার পাবেন, আমি নিজে বলে দেব।</p>
            <ol class="next-steps">
              <li>I review your business, website and Google presence.</li>
              <li>You get a free, simple growth plan on WhatsApp.</li>
              <li>You decide — zero pressure, zero spam.</li>
            </ol>
          </div>${form()}
        </div>
      </div>
    </section>
`;

const SOCIAL_SVG = {
  instagram: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  facebook: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  linkedin: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  youtube: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.5 3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.5 31 31 0 0 0-.4-4.5zM9.75 15.02V8.98L15.5 12z"/></svg>',
};

export const FOOTER = `
  <footer class="footer">
    <svg class="footer__wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0,0 H1440 V26 C1260,50 1080,12 900,24 C720,36 540,52 360,36 C220,24 100,14 0,28 Z" fill="currentColor"/></svg>
    <div class="container">
      <div class="footer__cta">
        <p>Have a project in mind? <span>Let's talk.</span></p>
        <div class="footer__cta-right">
          <span class="footer__status"><i></i>Open for projects</span>
          <a href="${waLink("Hi Sushanta! I'd like to discuss a new project.")}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">${waIcon(17)} WhatsApp me <span class="arr">&rarr;</span></a>
        </div>
      </div>
      <div class="footer__row">
        <div class="footer__brand">
          <a href="/" aria-label="Sushanta Digital home"><img src="/assets/logo-white.svg" alt="Sushanta Digital" width="150" height="30" loading="lazy" data-cms-img="logo_white"></a>
          <p>Leads, WhatsApp automation &amp; websites for local businesses.</p>
        </div>
        <ul class="footer__contact">
          <li><a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener noreferrer"><span class="footer__ico">${waIcon(17)}</span><span><small>WhatsApp</small><b data-cms-wa-text>+91 95477 71118</b></span></a></li>
          <li><a href="tel:+${WA_NUMBER}" data-cms-href="phone"><span class="footer__ico"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></span><span><small>Mobile</small><b data-cms-text="phone_display">+91 95477 71118</b></span></a></li>
          <li><a href="mailto:contact@susanta.me" data-cms-href="email"><span class="footer__ico"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/></svg></span><span><small>Email</small><b data-cms-text="email">contact@susanta.me</b></span></a></li>
        </ul>
        <div class="footer__social">
          ${Object.entries(SOCIAL_SVG).map(([k, svg]) => `<a href="#" target="_blank" rel="noopener noreferrer" aria-label="${k[0].toUpperCase() + k.slice(1)}" data-cms-social="${k}" hidden>${svg}</a>`).join('')}
        </div>
      </div>
      <div class="footer__bottom">
        <span>&copy; 2026 Sushanta Digital · 📍 <span data-cms-text="location">Manbazar, Purulia, West Bengal</span></span>
        <nav class="footer__legal" aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a><a href="/terms">Terms &amp; Conditions</a></nav>
        <a href="#top" class="footer__up" aria-label="Back to top">&uarr;</a>
      </div>
    </div>
  </footer>

  <a href="${waLink("Hi Sushanta! I'd like to discuss a project.")}" target="_blank" rel="noopener noreferrer" class="wa-float" aria-label="Chat on WhatsApp">${waIcon(22)}<span>Chat with Sushanta</span></a>
`;

export const MODAL = `
  <div class="modal-overlay" id="portfolioModal" role="dialog" aria-modal="true" aria-labelledby="modalProjectTitle">
    <div class="modal-window">
      <div class="modal-header">
        <div><span id="modalProjectCategory" class="modal-category"></span><h3 id="modalProjectTitle" class="modal-title"></h3></div>
        <button id="modalCloseBtn" class="modal-close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <img id="modalProjectImg" alt="" class="modal-img">
        <p id="modalProjectDesc" class="modal-desc"></p>
        <button id="modalActionBtn" class="btn-send-whatsapp">Get a Similar System for My Business &rarr;</button>
      </div>
    </div>
  </div>
`;

export const TAIL = `
  <script src="/script.js" defer></script>
</body>
</html>
`;

export function page({ path, head: h, body, contact = true, modal = false }) {
  return head({ path, ...h }) + header(path) + `\n  <main id="main">\n  <div id="top"></div>\n${body}${contact ? CONTACT : ''}  </main>\n` + FOOTER + (modal ? MODAL : '') + TAIL;
}
