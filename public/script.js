/**
 * Sushanta Digital — site interactions
 */

// WhatsApp number: taken from the first wa.me link on the page so it follows the number set in /admin.
const WHATSAPP_PHONE = (document.querySelector('a[href*="wa.me/"]')?.getAttribute('href').match(/wa\.me\/(\d+)/) || [])[1] || '919547771118';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initWhatsAppFloat();
  initReveal();
  initCounters();
  initContactForm();
  initServiceLinks();
  initBlog();
  initCopyLink();
  initProjectModal();
  initFilters();
  initFaq();
  initFaqSearch();
  initScrollSpy();
  initProgressBars();
  initRoiCalculator();
});

function initNavbar() {
  const navbar = document.querySelector('.navbar-floating');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-menu-drawer');
  const onScroll = () => navbar?.classList.toggle('navbar-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  toggle?.addEventListener('click', () => {
    const open = drawer?.classList.toggle('active');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  drawer?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => drawer.classList.remove('active')));
}

/* Fade/slide sections in; children of grids get a small stagger. */
function initReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-scale, .steps, .tl-item, .mock');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  document.querySelectorAll('.bento, .proj-grid, .posts, .cards-3, .cards-4, .plans, .reviews-wall, .industries, .values').forEach((grid) => {
    [...grid.children].forEach((child, i) => child.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`));
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => observer.observe(el));
}

/* Count numbers up when they scroll into view: <strong data-count>3.2x</strong> */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;
  const run = (el) => {
    const text = el.textContent.trim();
    const m = text.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ''));
    const decimals = (m[2].split('.')[1] || '').length;
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = `${m[1]}${v.toFixed(decimals)}${m[3]}`;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = text;
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        run(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  els.forEach((el) => observer.observe(el));
}

// Remember where the visitor came from (ad / campaign tags) for the lead record.
function leadSource() {
  try {
    const params = new URLSearchParams(location.search);
    const tags = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => params.get(k)).filter(Boolean).join(' / ');
    if (tags) sessionStorage.setItem('sd_source', tags);
    else if (!sessionStorage.getItem('sd_source') && document.referrer && !document.referrer.startsWith(location.origin)) {
      sessionStorage.setItem('sd_source', new URL(document.referrer).hostname);
    }
    return sessionStorage.getItem('sd_source') || 'direct';
  } catch {
    return '';
  }
}

function initContactForm() {
  const source = leadSource();
  const form = document.getElementById('projectContactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => document.getElementById(id)?.value.trim() || '';
    const name = val('clientName');
    const phone = val('clientPhone');
    const businessType = val('clientBusinessType');
    const requirement = val('clientRequirement');
    if (!name || !businessType || !phone) {
      showToast('Please fill in your name, phone number and business type.');
      return;
    }
    // Save the lead for /admin (fire-and-forget so WhatsApp opens instantly).
    try {
      fetch('/api/leads', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, business_type: businessType, requirement, page: location.pathname, source, website: val('clientWebsite') }),
      }).catch(() => {});
    } catch { /* never block the WhatsApp hand-off */ }

    let message = `*Hi Sushanta!* I would like to discuss a project with *Sushanta Digital*.\n\n`;
    message += `👤 *Name:* ${name}\n🏢 *Business Type:* ${businessType}\n📞 *Phone:* ${phone}\n`;
    message += `📝 *Requirement:* ${requirement || 'Free consultation for growth & website'}\n`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, '_blank');
    showToast('Thanks! Opening WhatsApp with your details…');
    form.reset();
  });
}

/* Buttons with data-service jump to the form and pre-fill the requirement. */
function initServiceLinks() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-service]');
    if (!el) return;
    const target = document.getElementById('contact') || document.getElementById('contact-form');
    if (!target) return;
    e.preventDefault();
    const req = document.getElementById('clientRequirement');
    if (req) req.value = `Interested in: ${el.getAttribute('data-service')}`;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

const CATEGORY_TO_OPTION = [
  [/coach|tuition|school|educat/i, 'Coaching / Education'],
  [/travel|tour/i, 'Travel Agency'],
  [/clinic|health|dental|doctor/i, 'Clinic / Healthcare'],
  [/salon|beauty|spa|wellness/i, 'Salon & Beauty'],
  [/retail|shop|store/i, 'Retail & E-commerce'],
];

function initProjectModal() {
  const modal = document.getElementById('portfolioModal');
  if (!modal) return;
  const $ = (id) => document.getElementById(id);
  let current = null;
  let lastFocus = null;
  const close = () => {
    modal.classList.remove('active');
    lastFocus?.focus();
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project]');
    if (!card || e.target.closest('a')) return;
    current = card.dataset;
    lastFocus = card;
    $('modalProjectTitle').textContent = current.title || '';
    $('modalProjectCategory').textContent = [current.cat, current.loc].filter(Boolean).join(' · ');
    $('modalProjectImg').src = current.img || '';
    $('modalProjectImg').alt = `${current.title || 'Project'} preview`;
    $('modalProjectDesc').textContent = current.desc || '';
    modal.classList.add('active');
    $('modalCloseBtn').focus();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('article[data-project]')) { e.preventDefault(); e.target.click(); }
  });
  $('modalActionBtn')?.addEventListener('click', () => {
    modal.classList.remove('active');
    const select = $('clientBusinessType');
    const hit = CATEGORY_TO_OPTION.find(([re]) => re.test(`${current?.cat} ${current?.title}`));
    if (select && hit) select.value = hit[1];
    const req = $('clientRequirement');
    if (req && current) req.value = `I'd like a system like ${current.title}`;
    (document.getElementById('contact') || document.getElementById('contact-form'))?.scrollIntoView({ behavior: 'smooth' });
  });
  $('modalCloseBtn')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) close(); });
}

/* Filter chips: show items in the same section whose data-category matches. */
function initFilters() {
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-btn[data-filter]');
    if (!chip) return;
    const scope = chip.closest('section') || document;
    const filter = chip.dataset.filter;
    scope.querySelectorAll('.chip-btn[data-filter]').forEach((c) => c.classList.toggle('active', c === chip));
    scope.querySelectorAll('[data-category]').forEach((item) => {
      item.hidden = filter !== 'all' && item.dataset.category !== filter;
      if (!item.hidden) item.classList.add('in');
    });
  });
}

function initFaq() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question-btn');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const wrap = item.parentElement;
    const open = !item.classList.contains('active');
    wrap.querySelectorAll('.faq-item.active').forEach((o) => {
      o.classList.remove('active');
      o.querySelector('.faq-question-btn')?.setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initFaqSearch() {
  const input = document.getElementById('faqSearch');
  if (!input) return;
  const empty = document.querySelector('.faq-empty');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll('.faq-group').forEach((group) => {
      let groupShown = 0;
      group.querySelectorAll('.faq-item').forEach((item) => {
        const match = !q || item.textContent.toLowerCase().includes(q);
        item.hidden = !match;
        if (match) groupShown++;
      });
      group.hidden = groupShown === 0;
      shown += groupShown;
    });
    if (empty) empty.style.display = shown ? 'none' : 'block';
  });
}

/* Services page: highlight the side-nav item for the panel in view. */
function initScrollSpy() {
  const links = document.querySelectorAll('.svc__nav a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map([...links].map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      map.get(entry.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  map.forEach((_, id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
}

/* Process timeline rail + blog reading bar fill as you scroll. */
function initProgressBars() {
  const rail = document.querySelector('.timeline');
  const read = document.querySelector('.read-progress');
  const article = document.querySelector('.article-page');
  if (!rail && !read) return;
  const update = () => {
    if (rail) {
      const r = rail.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      rail.style.setProperty('--progress', `${(p * 100).toFixed(1)}%`);
    }
    if (read && article) {
      const r = article.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      read.style.setProperty('--progress', `${(p * 100).toFixed(1)}%`);
    }
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* Pricing page: "what could more leads be worth?" estimator. */
function initRoiCalculator() {
  const root = document.getElementById('roi');
  if (!root) return;
  const fmt = new Intl.NumberFormat('en-IN');
  const inputs = root.querySelectorAll('input[type=range]');
  const update = () => {
    const v = Object.fromEntries([...inputs].map((i) => [i.name, Number(i.value)]));
    inputs.forEach((i) => {
      const out = root.querySelector(`output[for="${i.id}"]`);
      if (out) out.textContent = i.name === 'value' ? `₹${fmt.format(i.value)}` : i.name === 'rate' ? `${i.value}%` : fmt.format(i.value);
    });
    const extraCustomers = Math.round(v.leads * (v.rate / 100));
    const revenue = extraCustomers * v.value;
    root.querySelector('[data-roi="revenue"]').textContent = `₹${fmt.format(revenue)}`;
    root.querySelector('[data-roi="customers"]').textContent = fmt.format(extraCustomers);
    const payback = revenue > 0 ? Math.max(1, Math.ceil(14999 / (revenue / 30))) : null;
    root.querySelector('[data-roi="payback"]').textContent = payback ? `${payback} days` : '—';
  };
  inputs.forEach((i) => i.addEventListener('input', update));
  update();
}

/* Blog: search + topic chips (work together). */
function initBlog() {
  const root = document.querySelector('.bj');
  if (!root) return;
  const input = root.querySelector('#blogSearch');
  const empty = root.querySelector('.bj-empty');
  let topic = 'all';
  const apply = () => {
    const q = (input?.value || '').trim().toLowerCase();
    let shown = 0;
    root.querySelectorAll('[data-search]').forEach((item) => {
      const ok = (topic === 'all' || item.dataset.category === topic) && (!q || item.dataset.search.includes(q));
      item.hidden = !ok;
      if (ok) { shown++; item.classList.add('in'); }
    });
    if (empty) empty.hidden = shown > 0;
  };
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('.bj-chip');
    if (!chip) return;
    topic = chip.dataset.filter;
    root.querySelectorAll('.bj-chip').forEach((c) => c.classList.toggle('active', c === chip));
    apply();
  });
  input?.addEventListener('input', apply);
}

/* Floating WhatsApp button: only visible while the footer is on screen. */
function initWhatsAppFloat() {
  const btn = document.querySelector('.wa-float');
  const footer = document.querySelector('.footer');
  if (!btn) return;
  if (!footer || !('IntersectionObserver' in window)) { btn.classList.add('is-visible'); return; }
  new IntersectionObserver((entries) => {
    btn.classList.toggle('is-visible', entries[0].isIntersecting);
  }, { threshold: 0.15 }).observe(footer);
}

/* Article page: copy link button. */
function initCopyLink() {
  document.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.classList.add('is-copied');
      showToast('Link copied ✓');
      setTimeout(() => btn.classList.remove('is-copied'), 1600);
    } catch { showToast(btn.dataset.copy); }
  }));
}

function showToast(message) {
  let toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.setAttribute('role', 'status');
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#141C2E', color: '#FFFFFF',
      padding: '12px 22px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
      zIndex: '9999', transition: 'opacity 0.3s ease',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}
