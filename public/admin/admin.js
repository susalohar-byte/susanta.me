// Sushanta Digital — Admin panel (vanilla ES module, no dependencies)

/* =========================================================================
   Constants
   ========================================================================= */
const API = '/api/admin';
const MAX_UPLOAD = 5 * 1024 * 1024;
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico'];
const ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.svg,.ico,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon';

const PROJECT_CATEGORIES = [
  ['education', 'Education'], ['travel', 'Travel'], ['health', 'Health'],
  ['beauty', 'Beauty'], ['retail', 'Retail'], ['other', 'Other'],
];
const BLOG_CATEGORIES = ['WhatsApp Automation', 'Website Speed', 'Meta Ads', 'Local SEO', 'Lead Generation', 'Workflows'];

const SETTINGS_GROUPS = [
  {
    title: 'Brand', desc: 'Your logos and the little icon in the browser tab.',
    fields: [
      { key: 'logo', label: 'Logo', type: 'image', help: 'Shown in the site header on a light background.' },
      { key: 'logo_white', label: 'Logo (white version)', type: 'image', dark: true, help: 'Shown on dark backgrounds, like the footer.' },
      { key: 'favicon', label: 'Favicon', type: 'image', help: 'Small square icon for the browser tab. PNG, SVG or ICO works best.' },
    ],
  },
  {
    title: 'Homepage hero', desc: 'The first thing visitors see on your homepage.',
    fields: [
      { key: 'hero_image', label: 'Hero image', type: 'image' },
      { key: 'hero_note', label: 'Small note above the headline', type: 'text', placeholder: 'e.g. Trusted by 50+ local businesses' },
      { key: 'hero_title', label: 'Headline', type: 'text', help: 'Wrap a word in [[double brackets]] to highlight it, e.g. Grow Your Business [[Online]]' },
      { key: 'hero_subtitle', label: 'Sub-headline', type: 'textarea' },
    ],
  },
  {
    title: 'Contact', desc: 'How customers reach you. Used in buttons, the footer and the contact page.',
    fields: [
      { key: 'whatsapp', label: 'WhatsApp number', type: 'tel', help: 'Digits with country code, e.g. 919547771118', placeholder: '919547771118' },
      { key: 'phone_display', label: 'Phone (as displayed)', type: 'text', placeholder: '+91 95477 71118' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'hello@example.com' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'Manbazar, Purulia, West Bengal' },
    ],
  },
  {
    title: 'Social links', desc: 'Full links to your profiles. Leave blank to hide an icon.',
    fields: [
      { key: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/…' },
      { key: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/…' },
      { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/…' },
      { key: 'youtube', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/@…' },
    ],
  },
  {
    title: 'Homepage stats', desc: 'The four numbers shown on the homepage, e.g. “150+” / “Projects delivered”.',
    stats: 4,
  },
  {
    title: 'SEO', desc: 'How your site looks when shared on WhatsApp, Facebook, LinkedIn…',
    fields: [
      { key: 'og_image', label: 'Share image', type: 'image', help: 'Recommended size 1200 × 630 pixels.' },
    ],
  },
];

/* =========================================================================
   DOM helpers (all user data goes through textContent / properties)
   ========================================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
let uidCounter = 0;
const uid = (p = 'f') => `${p}-${++uidCounter}`;
const PROP_KEYS = new Set(['value', 'checked', 'disabled', 'selected', 'hidden', 'multiple', 'required', 'readOnly', 'min', 'max']);

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (PROP_KEYS.has(k)) el[k] = v;
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

function field(label, control, help) {
  if (!control.id) control.id = uid();
  let helpEl = null;
  if (help) {
    helpEl = h('p', { class: 'help', id: uid('help') }, help);
    control.setAttribute('aria-describedby', helpEl.id);
  }
  return h('div', { class: 'field' }, h('label', { for: control.id }, label), control, helpEl);
}

function checkbox(label, checked) {
  const input = h('input', { type: 'checkbox', checked: !!checked });
  return { input, el: h('label', { class: 'check' }, input, label) };
}

function select(options, value) {
  return h('select', null, options.map(([v, l]) => h('option', { value: v, selected: String(v) === String(value) }, l)));
}

function spinner() { return h('div', { class: 'spinner', 'aria-hidden': 'true' }); }

function stateBox(icon, title, text, action) {
  return h('div', { class: 'state' },
    icon === 'loading' ? spinner() : h('div', { class: 'state-icon', 'aria-hidden': 'true' }, icon),
    title && h('h3', null, title), text && h('p', null, text), action);
}
const loadingState = (text = 'Loading…') => h('div', { class: 'state', role: 'status' }, spinner(), h('p', null, text));

function setBusy(btn, busy, busyText) {
  if (!btn) return;
  if (busy) {
    btn.dataset.label = btn.textContent;
    btn.disabled = true;
    btn.replaceChildren(spinner(), busyText || btn.dataset.label);
  } else {
    btn.disabled = false;
    if (btn.dataset.label != null) btn.textContent = btn.dataset.label;
  }
}

function slugify(s) {
  return String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
}

function bindSlug(titleInput, slugInput, startAuto) {
  let manual = !startAuto;
  slugInput.addEventListener('input', () => { manual = slugInput.value.trim() !== ''; });
  slugInput.addEventListener('blur', () => { slugInput.value = slugify(slugInput.value); });
  titleInput.addEventListener('input', () => {
    if (!manual) slugInput.value = slugify(titleInput.value);
  });
}

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v + 'T00:00:00' : v);
  return isNaN(d) ? String(v) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtSize(n) {
  n = Number(n) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
const bySort = (a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0) || (Number(a.id) || 0) - (Number(b.id) || 0);

/* =========================================================================
   Toasts
   ========================================================================= */
function toast(message, type = 'ok') {
  const el = h('div', { class: 'toast' + (type === 'error' ? ' error' : ''), role: type === 'error' ? 'alert' : 'status' }, message);
  $('#toasts').append(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, type === 'error' ? 6000 : 2800);
}

/* =========================================================================
   API
   ========================================================================= */
class AuthError extends Error {}

async function api(path, { method = 'GET', body, form } = {}) {
  const opts = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try { res = await fetch(API + path, opts); }
  catch { throw new Error('Network error — please check your internet connection.'); }
  if (res.status === 401 && path !== '/login') {
    showLogin('Your session has expired. Please log in again.');
    throw new AuthError('Not logged in');
  }
  let data = null;
  if ((res.headers.get('content-type') || '').includes('json')) {
    try { data = await res.json(); } catch { /* ignore */ }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Something went wrong (error ${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data || {};
}

function fail(err) {
  if (err instanceof AuthError) return;
  console.error(err);
  toast(err.message || 'Something went wrong.', 'error');
}

function validateFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return `“${file.name}” isn't a supported image. Use PNG, JPG, WebP, GIF, SVG or ICO.`;
  if (file.size > MAX_UPLOAD) return `“${file.name}” is ${fmtSize(file.size)}. The maximum is 5 MB.`;
  return null;
}

async function uploadFile(file) {
  const problem = validateFile(file);
  if (problem) throw new Error(problem);
  const fd = new FormData();
  fd.append('file', file);
  const res = await api('/upload', { method: 'POST', form: fd });
  if (!res.url) throw new Error('Upload finished but no URL was returned.');
  return res;
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = h('textarea', { value: text, style: 'position:fixed;opacity:0' });
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

/* =========================================================================
   Modals
   ========================================================================= */
const modalStack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function openModal({ title, body, foot, wide = false, slide = false, onRequestClose, onClose }) {
  const prevFocus = document.activeElement;
  const titleId = uid('mt');
  const closeBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Close' }, '✕');
  const modal = h('div', { class: 'modal' + (wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    h('div', { class: 'modal-head' }, h('h2', { id: titleId }, title), closeBtn),
    h('div', { class: 'modal-body' }, body),
    foot && h('div', { class: 'modal-foot' }, foot));
  const backdrop = h('div', { class: 'modal-backdrop' + (slide ? ' slide' : '') }, modal);

  let closed = false;
  const m = {
    el: modal,
    close() {
      if (closed) return;
      closed = true;
      backdrop.remove();
      const i = modalStack.indexOf(m);
      if (i >= 0) modalStack.splice(i, 1);
      if (!modalStack.length) document.body.style.overflow = '';
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (onClose) onClose();
    },
    requestClose() {
      if (onRequestClose && onRequestClose() === false) return;
      m.close();
    },
  };
  closeBtn.addEventListener('click', m.requestClose);
  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) m.requestClose(); });
  $('#modal-root').append(backdrop);
  modalStack.push(m);
  document.body.style.overflow = 'hidden';
  const first = modal.querySelector('.modal-body ' + FOCUSABLE.split(', ').join(', .modal-body ')) || closeBtn;
  setTimeout(() => first.focus(), 30);
  return m;
}

function confirmDialog(message, { title = 'Are you sure?', okText = 'Delete', danger = true } = {}) {
  return new Promise((resolve) => {
    let result = false;
    const ok = h('button', { type: 'button', class: 'btn ' + (danger ? 'btn-danger-solid' : 'btn-primary') }, okText);
    const cancel = h('button', { type: 'button', class: 'btn' }, 'Cancel');
    const m = openModal({ title, body: h('p', { style: 'margin:0' }, message), foot: [cancel, ok], onClose: () => resolve(result) });
    cancel.addEventListener('click', () => m.close());
    ok.addEventListener('click', () => { result = true; m.close(); });
    setTimeout(() => cancel.focus(), 40);
  });
}

document.addEventListener('keydown', (e) => {
  const top = modalStack[modalStack.length - 1];
  if (e.key === 'Escape') {
    if (top) { e.preventDefault(); top.requestClose(); return; }
    closeDrawer();
  }
  if (e.key === 'Tab' && top) {
    const items = [...top.el.querySelectorAll(FOCUSABLE)].filter((x) => x.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (!top.el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* =========================================================================
   Image field (preview + upload + media picker + remove)
   ========================================================================= */
function imageField({ label, value = '', dark = false, help }) {
  const input = h('input', { type: 'text', id: uid('img'), placeholder: '/media/… or https://…', value: value || '', spellcheck: 'false' });
  const preview = h('div', { class: 'imgfield-preview' + (dark ? ' dark' : '') });
  const fileIn = h('input', { type: 'file', accept: ACCEPT, tabindex: '-1', 'aria-hidden': 'true' });
  const upBtn = h('button', { type: 'button', class: 'btn btn-sm btn-primary' }, 'Upload');
  const pickBtn = h('button', { type: 'button', class: 'btn btn-sm' }, 'Choose from media');
  const rmBtn = h('button', { type: 'button', class: 'btn btn-sm btn-danger' }, 'Remove');

  function refresh() {
    const v = input.value.trim();
    rmBtn.disabled = !v;
    if (!v) { preview.replaceChildren('No image'); return; }
    const img = h('img', { alt: `${label} preview` });
    img.addEventListener('error', () => preview.replaceChildren('Preview unavailable'));
    img.src = v;
    preview.replaceChildren(img);
  }
  function setValue(v) {
    input.value = v || '';
    refresh();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  input.addEventListener('input', refresh);
  upBtn.addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', async () => {
    const file = fileIn.files[0];
    fileIn.value = '';
    if (!file) return;
    setBusy(upBtn, true, 'Uploading…');
    try {
      const res = await uploadFile(file);
      setValue(res.url);
      toast('Image uploaded ✓');
    } catch (err) { fail(err); }
    finally { setBusy(upBtn, false); }
  });
  pickBtn.addEventListener('click', async () => {
    const url = await pickMedia();
    if (url) setValue(url);
  });
  rmBtn.addEventListener('click', () => setValue(''));
  refresh();

  const helpEl = help ? h('p', { class: 'help', id: uid('help') }, help) : null;
  if (helpEl) input.setAttribute('aria-describedby', helpEl.id);
  const el = h('div', { class: 'field' },
    h('label', { for: input.id }, label),
    h('div', { class: 'imgfield' },
      preview,
      h('div', { class: 'imgfield-body' },
        h('div', { class: 'imgfield-actions' }, upBtn, pickBtn, rmBtn, fileIn),
        input, helpEl)));
  return {
    el, input,
    get value() { return input.value.trim(); },
    set value(v) { setValue(v); },
  };
}

/* =========================================================================
   Media library (page + picker)
   ========================================================================= */
function mediaLibrary(container, { onPick } = {}) {
  const picking = typeof onPick === 'function';
  const fileIn = h('input', { type: 'file', accept: ACCEPT, multiple: true, tabindex: '-1', 'aria-hidden': 'true' });
  const upBtn = h('button', { type: 'button', class: 'btn btn-primary' }, 'Upload images');
  const progress = h('div', { class: 'upload-progress', role: 'status', hidden: true });
  const drop = h('div', { class: 'dropzone' },
    h('div', null, h('strong', null, 'Drag & drop images here'), ' or'),
    upBtn, fileIn, progress,
    h('p', { class: 'help', style: 'margin:10px 0 0' }, 'PNG, JPG, WebP, GIF, SVG or ICO · max 5 MB each'));
  const grid = h('div');
  container.replaceChildren(drop, grid);

  let items = [];

  async function load() {
    grid.replaceChildren(loadingState('Loading media…'));
    try {
      const res = await api('/media');
      items = (res.items || []).slice().sort((a, b) => String(b.uploaded || '').localeCompare(String(a.uploaded || '')));
      render();
    } catch (err) {
      fail(err);
      grid.replaceChildren(stateBox('!', 'Couldn’t load media', err.message,
        h('button', { type: 'button', class: 'btn', onclick: load }, 'Try again')));
    }
  }

  function render() {
    if (!items.length) {
      grid.replaceChildren(stateBox('▣', 'No images yet', 'Upload your first image using the box above.'));
      return;
    }
    grid.replaceChildren(h('div', { class: 'media-grid' }, items.map(card)));
  }

  function card(item) {
    const name = String(item.key || '').split('/').pop() || item.key;
    const img = h('img', { alt: name, loading: 'lazy' });
    img.src = item.url;
    const meta = h('div', { class: 'media-meta' },
      h('div', { class: 'media-name', title: item.key }, name),
      h('div', { class: 'media-size' }, [fmtSize(item.size), item.uploaded ? ' · ' + fmtDate(item.uploaded) : '']));
    if (picking) {
      return h('button', { type: 'button', class: 'media-item', 'aria-label': `Choose ${name}`, onclick: () => onPick(item) },
        h('div', { class: 'media-img' }, img), meta);
    }
    const copyBtn = h('button', { type: 'button', class: 'btn btn-sm' }, 'Copy URL');
    copyBtn.addEventListener('click', async () => {
      toast((await copyText(item.url)) ? 'URL copied ✓' : 'Could not copy — URL: ' + item.url, 'ok');
    });
    const delBtn = h('button', { type: 'button', class: 'btn btn-sm btn-danger', 'aria-label': `Delete ${name}` }, 'Delete');
    delBtn.addEventListener('click', async () => {
      if (!(await confirmDialog(`Delete “${name}”? Pages that use this image will show a broken image.`, { title: 'Delete image?' }))) return;
      setBusy(delBtn, true, '…');
      try {
        await api('/media/' + encodeURIComponent(item.key), { method: 'DELETE' });
        items = items.filter((x) => x.key !== item.key);
        render();
        toast('Image deleted');
      } catch (err) { fail(err); setBusy(delBtn, false); }
    });
    return h('div', { class: 'media-item' }, h('div', { class: 'media-img' }, img), meta,
      h('div', { class: 'media-actions' }, copyBtn, delBtn));
  }

  async function uploadMany(files) {
    files = [...files];
    if (!files.length) return;
    const bad = files.map(validateFile).filter(Boolean);
    bad.forEach((m) => toast(m, 'error'));
    files = files.filter((f) => !validateFile(f));
    if (!files.length) return;
    setBusy(upBtn, true, 'Uploading…');
    progress.hidden = false;
    let done = 0;
    for (const f of files) {
      progress.textContent = `Uploading ${done + 1} of ${files.length}: ${f.name}`;
      try { await uploadFile(f); done++; }
      catch (err) { fail(err); if (err instanceof AuthError) break; }
    }
    progress.hidden = true;
    setBusy(upBtn, false);
    if (done) toast(done === 1 ? 'Image uploaded ✓' : `${done} images uploaded ✓`);
    load();
  }

  upBtn.addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', () => { const f = [...fileIn.files]; fileIn.value = ''; uploadMany(f); });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => uploadMany(e.dataTransfer.files));

  load();
}

function pickMedia() {
  return new Promise((resolve) => {
    let picked = null;
    const body = h('div');
    const m = openModal({ title: 'Choose an image', body, wide: true, onClose: () => resolve(picked) });
    mediaLibrary(body, { onPick(item) { picked = item.url; m.close(); } });
  });
}

/* =========================================================================
   Shell: login, navigation, router
   ========================================================================= */
let appStarted = false;
let leaveGuard = null;     // () => boolean (true when there are unsaved changes)
let currentHash = '';
let skipHashChange = false;

function showLogin(message) {
  $('#boot').hidden = true;
  $('#app').hidden = true;
  $('#modal-root').hidden = true;
  $('#login').hidden = false;
  const err = $('#login-error');
  err.hidden = !message;
  err.textContent = message || '';
  setTimeout(() => $('#login-password').focus(), 30);
}

function showApp() {
  $('#boot').hidden = true;
  $('#login').hidden = true;
  $('#app').hidden = false;
  $('#modal-root').hidden = false;
  if (!appStarted) { appStarted = true; route(); }
}

function openDrawer() {
  $('#sidebar').classList.add('open');
  $('#drawer-backdrop').hidden = false;
  $('#menu-toggle').setAttribute('aria-expanded', 'true');
  const a = $('#nav a'); if (a) a.focus();
}
function closeDrawer() {
  if (!$('#sidebar').classList.contains('open')) return;
  $('#sidebar').classList.remove('open');
  $('#drawer-backdrop').hidden = true;
  $('#menu-toggle').setAttribute('aria-expanded', 'false');
}

const confirmLeave = () => !leaveGuard || !leaveGuard() || window.confirm('You have unsaved changes. Leave without saving?');

const ROUTES = {
  dashboard: viewDashboard, leads: viewLeads, settings: viewSettings, projects: viewProjects, plans: viewPlans, faqs: viewFaqs,
  reviews: viewReviews, blog: viewBlog, media: viewMedia,
};

function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [name, ...rest] = hash.split('/');
  const view = ROUTES[name] ? name : 'dashboard';
  currentHash = '#/' + hash;
  leaveGuard = null;
  document.querySelectorAll('#nav a').forEach((a) => {
    const on = a.dataset.route === view;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  closeDrawer();
  const main = $('#main');
  main.replaceChildren();
  window.scrollTo(0, 0);
  ROUTES[view](main, rest);
  main.focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => {
  if (skipHashChange) { skipHashChange = false; return; }
  if (!confirmLeave()) { skipHashChange = true; location.hash = currentHash; return; }
  route();
});
window.addEventListener('beforeunload', (e) => {
  if (leaveGuard && leaveGuard()) { e.preventDefault(); e.returnValue = ''; }
});

function page(main, title, subtitle, actions) {
  const head = h('div', { class: 'page-head' },
    h('div', null, h('h1', null, title), subtitle && h('p', null, subtitle)),
    actions && h('div', { class: 'page-actions' }, actions));
  const body = h('div');
  main.append(head, body);
  return { head, body };
}

/* =========================================================================
   Dashboard
   ========================================================================= */
function viewDashboard(main) {
  const { body } = page(main, 'Dashboard', 'Welcome back! Here’s a quick look at your website.');
  const statEl = (href, label) => {
    const value = h('div', { class: 'stat-value' }, '…');
    const sub = h('div', { class: 'stat-sub' });
    return { value, sub, el: h('a', { class: 'stat', href }, value, h('div', { class: 'stat-label' }, label), sub) };
  };
  const s = { leads: statEl('#/leads', 'Leads'), projects: statEl('#/projects', 'Projects'), reviews: statEl('#/reviews', 'Reviews'), posts: statEl('#/blog', 'Blog posts') };
  s.leads.el.classList.add('stat-leads');
  body.append(
    h('div', { class: 'stats' }, s.leads.el, s.projects.el, s.reviews.el, s.posts.el),
    h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('div', null, h('h2', null, 'Quick links'), h('p', null, 'Jump straight to common tasks.'))),
      h('div', { class: 'quick' },
        h('a', { href: '#/leads' }, 'See new leads', h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→')),
        h('a', { href: '#/blog/new' }, 'Write a blog post', h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→')),
        h('a', { href: '#/settings/homepage-hero' }, 'Edit homepage hero', h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→')),
        h('a', { href: '#/media' }, 'Upload images', h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→')),
        h('a', { href: '/', target: '_blank', rel: 'noopener' }, 'View site', h('span', { class: 'arrow', 'aria-hidden': 'true' }, '↗')))));

  const count = async (path, st, fmt) => {
    try {
      const { items = [] } = await api(path);
      st.value.textContent = String(items.length);
      st.sub.textContent = fmt(items);
    } catch (err) {
      st.value.textContent = '—';
      st.sub.textContent = 'Couldn’t load';
      fail(err);
    }
  };
  const pubSplit = (items) => {
    const pub = items.filter((x) => Number(x.published) === 1).length;
    return `${pub} published · ${items.length - pub} hidden`;
  };
  count('/leads', s.leads, (items) => {
    const fresh = items.filter((x) => x.status === 'new').length;
    const week = items.filter((x) => Date.now() - Date.parse(`${x.created_at}Z`) < 7 * 864e5).length;
    updateLeadBadge(fresh);
    return `${fresh} new · ${week} this week`;
  });
  count('/projects', s.projects, pubSplit);
  count('/reviews', s.reviews, pubSplit);
  count('/posts', s.posts, (items) => {
    const pub = items.filter((x) => Number(x.published) === 1).length;
    return `${pub} published · ${items.length - pub} draft${items.length - pub === 1 ? '' : 's'}`;
  });
}

/* =========================================================================
   Leads (enquiries from the website form)
   ========================================================================= */
const LEAD_STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['won', 'Won'], ['lost', 'Lost']];

function updateLeadBadge(n) {
  const badge = $('#lead-badge');
  if (!badge) return;
  badge.textContent = n > 99 ? '99+' : String(n);
  badge.hidden = !n;
}

function fmtDateTime(v) {
  const d = new Date(`${String(v).replace(' ', 'T')}Z`);
  if (Number.isNaN(d.getTime())) return String(v || '');
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function viewLeads(main) {
  const exportBtn = h('a', { class: 'btn', href: `${API}/leads/export`, download: '' }, '⇩ Download CSV');
  const { body } = page(main, 'Leads', 'Everyone who filled the enquiry form on your website. Newest first.', exportBtn);
  let items = [];
  let filter = 'all';
  let query = '';

  const search = h('input', { type: 'search', placeholder: 'Search name, phone, business…', 'aria-label': 'Search leads' });
  search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); renderList(); });
  const tabs = h('div', { class: 'seg', role: 'tablist', 'aria-label': 'Filter by status' });
  const listHolder = h('div');

  async function load() {
    body.replaceChildren(loadingState('Loading leads…'));
    try {
      items = (await api('/leads')).items || [];
      updateLeadBadge(items.filter((x) => x.status === 'new').length);
      body.replaceChildren(h('div', { class: 'toolbar' }, tabs, search), listHolder);
      renderTabs();
      renderList();
    } catch (err) {
      fail(err);
      body.replaceChildren(stateBox('!', 'Couldn’t load leads', err.message, h('button', { type: 'button', class: 'btn', onclick: load }, 'Try again')));
    }
  }

  function renderTabs() {
    const countOf = (k) => (k === 'all' ? items.length : items.filter((x) => x.status === k).length);
    tabs.replaceChildren(...[['all', 'All'], ...LEAD_STATUSES].map(([k, label]) => h('button', {
      type: 'button', role: 'tab', class: `seg-btn${filter === k ? ' active' : ''}`, 'aria-selected': String(filter === k),
      onclick: () => { filter = k; renderTabs(); renderList(); },
    }, `${label} `, h('span', { class: 'seg-count' }, String(countOf(k))))));
  }

  function renderList() {
    if (!items.length) {
      listHolder.replaceChildren(stateBox('✉', 'No leads yet', 'When someone fills the enquiry form on your website, they will appear here — with their name, phone and what they need.'));
      return;
    }
    const shown = items.filter((x) => (filter === 'all' || x.status === filter)
      && (!query || `${x.name} ${x.phone} ${x.business_type} ${x.requirement} ${x.note}`.toLowerCase().includes(query)));
    if (!shown.length) {
      listHolder.replaceChildren(stateBox('⌕', 'Nothing matches', 'Try another status or search.'));
      return;
    }
    listHolder.replaceChildren(h('div', { class: 'leads' }, shown.map(leadCard)));
  }

  function leadCard(lead) {
    const digits = String(lead.phone).replace(/\D/g, '');
    const waNum = digits.length === 10 ? `91${digits}` : digits;
    const statusSel = select(LEAD_STATUSES, lead.status);
    statusSel.classList.add('lead-status', `is-${lead.status}`);
    statusSel.setAttribute('aria-label', `Status for ${lead.name}`);
    statusSel.addEventListener('change', async () => {
      const prev = lead.status;
      statusSel.disabled = true;
      try {
        const { item } = await api(`/leads/${lead.id}`, { method: 'PUT', body: { status: statusSel.value } });
        Object.assign(lead, item);
        statusSel.className = `lead-status is-${lead.status}`;
        updateLeadBadge(items.filter((x) => x.status === 'new').length);
        renderTabs();
        toast('Status updated ✓');
      } catch (err) { statusSel.value = prev; fail(err); }
      finally { statusSel.disabled = false; }
    });

    const note = h('textarea', { class: 'lead-note', rows: 2, placeholder: 'Add a note (e.g. called, sending quote Monday)…', 'aria-label': `Note for ${lead.name}` });
    note.value = lead.note || '';
    note.addEventListener('change', async () => {
      try {
        const { item } = await api(`/leads/${lead.id}`, { method: 'PUT', body: { note: note.value } });
        Object.assign(lead, item);
        toast('Note saved ✓');
      } catch (err) { fail(err); }
    });

    const delBtn = h('button', { type: 'button', class: 'btn btn-sm btn-danger', 'aria-label': `Delete lead ${lead.name}` }, 'Delete');
    delBtn.addEventListener('click', async () => {
      if (!(await confirmDialog(`Delete the lead from ${lead.name}? This can’t be undone.`))) return;
      setBusy(delBtn, true, 'Deleting…');
      try {
        await api(`/leads/${lead.id}`, { method: 'DELETE' });
        items = items.filter((x) => x.id !== lead.id);
        updateLeadBadge(items.filter((x) => x.status === 'new').length);
        renderTabs(); renderList();
        toast('Lead deleted');
      } catch (err) { fail(err); setBusy(delBtn, false); }
    });

    const meta = [lead.page && `from ${lead.page}`, lead.source && lead.source !== 'direct' && `via ${lead.source}`].filter(Boolean).join(' · ');
    return h('article', { class: `lead${lead.status === 'new' ? ' lead-new' : ''}` },
      h('div', { class: 'lead-main' },
        h('div', { class: 'lead-top' },
          h('div', null,
            h('h3', null, lead.name, lead.status === 'new' ? h('span', { class: 'badge badge-live' }, 'New') : null),
            h('p', { class: 'lead-sub' }, `${fmtDateTime(lead.created_at)}${lead.business_type ? ` · ${lead.business_type}` : ''}`)),
          statusSel),
        lead.requirement ? h('p', { class: 'lead-req' }, lead.requirement) : null,
        meta ? h('p', { class: 'lead-meta' }, meta) : null,
        note),
      h('div', { class: 'lead-actions' },
        h('a', { class: 'btn btn-primary btn-sm', href: `https://wa.me/${waNum}?text=${encodeURIComponent(`Hi ${lead.name}, this is Sushanta from Sushanta Digital — thanks for your enquiry!`)}`, target: '_blank', rel: 'noopener' }, 'WhatsApp'),
        h('a', { class: 'btn btn-sm', href: `tel:+${waNum}` }, `Call ${lead.phone}`),
        delBtn));
  }

  load();
}

/* =========================================================================
   Site settings
   ========================================================================= */
function viewSettings(main, rest = []) {
  const { body } = page(main, 'Site settings', 'Logos, homepage text, contact details and more.');
  body.append(loadingState('Loading settings…'));
  const controls = {};   // key -> { value getter }
  let saved = '';
  const snapshot = () => JSON.stringify(Object.fromEntries(Object.entries(controls).map(([k, c]) => [k, c.value])));
  leaveGuard = () => saved !== '' && snapshot() !== saved;

  (async () => {
    let settings;
    try { settings = (await api('/settings')).settings || {}; }
    catch (err) {
      fail(err);
      body.replaceChildren(stateBox('!', 'Couldn’t load settings', err.message,
        h('button', { type: 'button', class: 'btn', onclick: () => route() }, 'Try again')));
      return;
    }
    const val = (k) => (settings[k] == null ? '' : String(settings[k]));
    const textControl = (f) => {
      const el = f.type === 'textarea'
        ? h('textarea', { rows: 3, value: val(f.key), placeholder: f.placeholder })
        : h('input', { type: f.type === 'tel' ? 'tel' : f.type, value: val(f.key), placeholder: f.placeholder, inputmode: f.type === 'tel' ? 'numeric' : null });
      el.name = f.key;
      controls[f.key] = { input: el, get value() { return el.value.trim(); } };
      return field(f.label, el, f.help);
    };

    const form = h('form', { novalidate: true });
    for (const g of SETTINGS_GROUPS) {
      const card = h('section', { class: 'card settings-group', id: 'group-' + slugify(g.title) },
        h('div', { class: 'card-head' }, h('div', null, h('h2', null, g.title), g.desc && h('p', null, g.desc))));
      if (g.stats) {
        for (let i = 1; i <= g.stats; i++) {
          card.append(h('div', { class: 'grid-2' },
            textControl({ key: `stat_${i}_value`, label: `Stat ${i} — number`, type: 'text', placeholder: i === 1 ? '150+' : '' }),
            textControl({ key: `stat_${i}_label`, label: `Stat ${i} — label`, type: 'text', placeholder: i === 1 ? 'Projects delivered' : '' })));
        }
      } else {
        for (const f of g.fields) {
          if (f.type === 'image') {
            const imf = imageField({ label: f.label, value: val(f.key), dark: f.dark, help: f.help });
            controls[f.key] = imf;
            card.append(imf.el);
          } else card.append(textControl(f));
        }
      }
      form.append(card);
    }

    const note = h('span', { class: 'dirty-note' }, 'All changes saved');
    const saveBtn = h('button', { type: 'submit', class: 'btn btn-primary' }, 'Save changes');
    form.append(h('div', { class: 'savebar' }, note, saveBtn));
    body.replaceChildren(form);
    saved = snapshot();
    if (rest[0]) { const g = document.getElementById('group-' + rest[0]); if (g) g.scrollIntoView({ block: 'start' }); }

    const updateNote = () => {
      const dirty = snapshot() !== saved;
      note.textContent = dirty ? 'You have unsaved changes' : 'All changes saved';
      note.classList.toggle('on', dirty);
    };
    form.addEventListener('input', updateNote);
    form.addEventListener('change', updateNote);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const wa = controls.whatsapp;
      if (wa.value && !/^\d{8,15}$/.test(wa.value.replace(/[\s+-]/g, ''))) {
        toast('WhatsApp number should be digits with country code, e.g. 919547771118', 'error');
        wa.input.focus();
        return;
      }
      if (wa.value) wa.input.value = wa.value.replace(/[\s+-]/g, '');
      const values = Object.fromEntries(Object.entries(controls).map(([k, c]) => [k, c.value]));
      setBusy(saveBtn, true, 'Saving…');
      try {
        await api('/settings', { method: 'PUT', body: { settings: values } });
        saved = snapshot();
        updateNote();
        toast('Saved ✓');
      } catch (err) { fail(err); }
      finally { setBusy(saveBtn, false); }
    });
  })();
}

/* =========================================================================
   Generic CRUD list (projects, reviews)
   ========================================================================= */
function crudPage(main, cfg) {
  const addBtn = h('button', { type: 'button', class: 'btn btn-primary' }, `+ Add ${cfg.singular}`);
  const { body } = page(main, cfg.title, cfg.subtitle, addBtn);
  let items = [];

  async function load() {
    body.replaceChildren(loadingState(`Loading ${cfg.title.toLowerCase()}…`));
    try {
      items = ((await api(cfg.endpoint)).items || []).slice().sort(bySort);
      render();
    } catch (err) {
      fail(err);
      body.replaceChildren(stateBox('!', `Couldn’t load ${cfg.title.toLowerCase()}`, err.message,
        h('button', { type: 'button', class: 'btn', onclick: load }, 'Try again')));
    }
  }

  function render() {
    if (!items.length) {
      body.replaceChildren(stateBox(cfg.icon, cfg.emptyTitle, cfg.emptyText,
        h('button', { type: 'button', class: 'btn btn-primary', onclick: () => edit(null) }, `+ Add ${cfg.singular}`)));
      return;
    }
    const thead = h('thead', null, h('tr', null, cfg.headers.map((t) => h('th', { scope: 'col' }, t)), h('th', null, h('span', { class: 'visually-hidden' }, 'Actions'))));
    const tbody = h('tbody', null, items.map((item) => {
      const editBtn = h('button', { type: 'button', class: 'btn btn-sm', 'aria-label': `Edit ${cfg.labelOf(item)}`, onclick: () => edit(item) }, 'Edit');
      const delBtn = h('button', { type: 'button', class: 'btn btn-sm btn-danger', 'aria-label': `Delete ${cfg.labelOf(item)}`, onclick: () => remove(item, delBtn) }, 'Delete');
      return h('tr', null, cfg.columns(item, { edit }).map((c) => h('td', c.attrs || null, c.content)),
        h('td', null, publishedToggle(item)),
        h('td', null, sortInput(item)),
        h('td', { class: 'actions' }, editBtn, delBtn));
    }));
    body.replaceChildren(h('div', { class: 'table-wrap' }, h('table', { class: 'list' }, thead, tbody)));
  }

  async function patch(item, changes) {
    const res = await api(`${cfg.endpoint}/${encodeURIComponent(item.id)}`, { method: 'PUT', body: { ...item, ...changes } });
    const updated = res.item || { ...item, ...changes };
    items = items.map((x) => (x.id === item.id ? updated : x));
    return updated;
  }

  function publishedToggle(item) {
    const input = h('input', { type: 'checkbox', checked: Number(item.published) === 1, 'aria-label': `Published: ${cfg.labelOf(item)}` });
    input.addEventListener('change', async () => {
      input.disabled = true;
      try {
        await patch(item, { published: input.checked ? 1 : 0 });
        toast(input.checked ? 'Now visible on the website ✓' : 'Hidden from the website');
      } catch (err) { input.checked = !input.checked; fail(err); }
      finally { input.disabled = false; }
    });
    return h('label', { class: 'switch', title: 'Show on website' }, input, h('span'));
  }

  function sortInput(item) {
    const input = h('input', { type: 'number', class: 'sort-input', value: item.sort ?? 0, 'aria-label': `Sort order: ${cfg.labelOf(item)}` });
    input.addEventListener('change', async () => {
      const v = Number(input.value) || 0;
      input.disabled = true;
      try {
        await patch(item, { sort: v });
        items.sort(bySort);
        render();
        toast('Order updated ✓');
      } catch (err) { input.value = item.sort ?? 0; input.disabled = false; fail(err); }
    });
    return input;
  }

  async function remove(item, btn) {
    if (!(await confirmDialog(`Delete “${cfg.labelOf(item)}”? This can’t be undone.`, { title: `Delete ${cfg.singular}?` }))) return;
    setBusy(btn, true, '…');
    try {
      await api(`${cfg.endpoint}/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      items = items.filter((x) => x.id !== item.id);
      render();
      toast(`${cfg.singular[0].toUpperCase() + cfg.singular.slice(1)} deleted`);
    } catch (err) { fail(err); setBusy(btn, false); }
  }

  function edit(item) {
    const isNew = !item;
    const nextSort = items.length ? Math.max(...items.map((x) => Number(x.sort) || 0)) + 1 : 1;
    const f = cfg.form(item || { ...cfg.defaults, sort: nextSort });
    const formId = uid('form');
    const form = h('form', { id: formId, novalidate: true }, f.el);
    const saveBtn = h('button', { type: 'submit', form: formId, class: 'btn btn-primary' }, isNew ? `Add ${cfg.singular}` : 'Save changes');
    const cancelBtn = h('button', { type: 'button', class: 'btn' }, 'Cancel');
    const delBtn = !isNew && h('button', { type: 'button', class: 'btn btn-danger left' }, 'Delete');
    let saved = JSON.stringify(f.getData());
    const dirty = () => JSON.stringify(f.getData()) !== saved;
    const m = openModal({
      title: isNew ? `Add ${cfg.singular}` : `Edit ${cfg.singular}`,
      body: form, foot: [delBtn, cancelBtn, saveBtn], slide: true,
      onRequestClose: () => !dirty() || window.confirm('Discard your unsaved changes?'),
    });
    cancelBtn.addEventListener('click', m.requestClose);
    if (delBtn) delBtn.addEventListener('click', async () => {
      if (!(await confirmDialog(`Delete “${cfg.labelOf(item)}”? This can’t be undone.`, { title: `Delete ${cfg.singular}?` }))) return;
      setBusy(delBtn, true, 'Deleting…');
      try {
        await api(`${cfg.endpoint}/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
        items = items.filter((x) => x.id !== item.id);
        saved = JSON.stringify(f.getData());
        m.close(); render();
        toast(`${cfg.singular[0].toUpperCase() + cfg.singular.slice(1)} deleted`);
      } catch (err) { fail(err); setBusy(delBtn, false); }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = f.getData();
      const problem = f.validate(data);
      if (problem) { toast(problem.message, 'error'); if (problem.el) problem.el.focus(); return; }
      setBusy(saveBtn, true, 'Saving…');
      try {
        const res = isNew
          ? await api(cfg.endpoint, { method: 'POST', body: data })
          : await api(`${cfg.endpoint}/${encodeURIComponent(item.id)}`, { method: 'PUT', body: { ...item, ...data } });
        const saved_ = res.item || { ...item, ...data };
        items = isNew ? [...items, saved_] : items.map((x) => (x.id === item.id ? saved_ : x));
        items.sort(bySort);
        saved = JSON.stringify(f.getData());
        m.close(); render();
        toast(isNew ? `${cfg.singular[0].toUpperCase() + cfg.singular.slice(1)} added ✓` : 'Saved ✓');
      } catch (err) { fail(err); setBusy(saveBtn, false); }
    });
  }

  addBtn.addEventListener('click', () => edit(null));
  load();
}

function thumbOf(url) {
  if (!url) return h('div', { class: 'thumb thumb-empty', 'aria-hidden': 'true' }, 'No image');
  const img = h('img', { class: 'thumb', alt: '', loading: 'lazy' });
  img.src = url;
  return img;
}

/* ---------- Projects ---------- */
function viewProjects(main) {
  crudPage(main, {
    title: 'Projects', subtitle: 'Case studies shown in your portfolio. Lower “sort” numbers appear first.',
    singular: 'project', endpoint: '/projects', icon: '★',
    emptyTitle: 'No projects yet', emptyText: 'Add your first case study to show off your work.',
    defaults: { category: 'education', published: 1, metrics: [] },
    labelOf: (p) => p.title || 'Untitled project',
    headers: ['', 'Project', 'Category', 'Highlight', 'Published', 'Sort'],
    columns: (p, { edit }) => [
      { content: thumbOf(p.image) },
      { attrs: { class: 'title-cell' }, content: [h('strong', null, h('button', { type: 'button', class: 'btn-link', onclick: () => edit(p) }, p.title || 'Untitled')), h('span', null, p.location || p.slug || '')] },
      { content: h('span', { class: 'small' }, p.category_label || (PROJECT_CATEGORIES.find(([v]) => v === p.category) || [, p.category || '—'])[1]) },
      { content: p.highlight ? h('span', { class: 'chip' }, p.highlight) : h('span', { class: 'muted' }, '—') },
    ],
    form: projectForm,
  });
}

function projectForm(p) {
  const title = h('input', { type: 'text', value: p.title || '', required: true, placeholder: 'e.g. Bright Minds Coaching Centre' });
  const slug = h('input', { type: 'text', value: p.slug || '', spellcheck: 'false', placeholder: 'auto-generated-from-title' });
  bindSlug(title, slug, !p.slug);
  const category = select(PROJECT_CATEGORIES, p.category || 'education');
  const categoryLabel = h('input', { type: 'text', value: p.category_label || '', placeholder: 'e.g. COACHING & TUITION' });
  const location = h('input', { type: 'text', value: p.location || '', placeholder: 'e.g. Manbazar, Purulia' });
  const url = h('input', { type: 'url', value: p.url || '', placeholder: 'https://example.com' });
  const image = imageField({ label: 'Project image', value: p.image || '' });
  const highlight = h('input', { type: 'text', value: p.highlight || '', placeholder: 'e.g. +320% Leads', maxlength: 40 });
  const challenge = h('textarea', { rows: 4, value: p.challenge || '', placeholder: 'What problem did the client have?' });
  const solution = h('textarea', { rows: 4, value: p.solution || '', placeholder: 'What did you build or do?' });
  const sort = h('input', { type: 'number', value: p.sort ?? 0 });
  const published = checkbox('Published (visible on the website)', Number(p.published) === 1);

  // Metrics: up to 4 rows of {value, label}
  const metricsBox = h('div', { class: 'metrics' });
  const addMetric = h('button', { type: 'button', class: 'btn btn-sm' }, '+ Add metric');
  const rows = [];
  function updateAdd() { addMetric.disabled = rows.length >= 4; }
  function addRow(m = { value: '', label: '' }) {
    if (rows.length >= 4) return;
    const n = rows.length + 1;
    const value = h('input', { type: 'text', value: m.value || '', placeholder: '+320%', 'aria-label': `Metric ${n} value` });
    const label = h('input', { type: 'text', value: m.label || '', placeholder: 'More enquiries', 'aria-label': `Metric ${n} label` });
    const rm = h('button', { type: 'button', class: 'icon-btn', 'aria-label': `Remove metric ${n}` }, '✕');
    const row = { value, label, el: h('div', { class: 'metric-row' }, value, label, rm) };
    rm.addEventListener('click', () => {
      rows.splice(rows.indexOf(row), 1);
      row.el.remove();
      updateAdd();
      metricsBox.dispatchEvent(new Event('input', { bubbles: true }));
    });
    rows.push(row);
    metricsBox.append(row.el);
    updateAdd();
  }
  (Array.isArray(p.metrics) ? p.metrics : []).slice(0, 4).forEach(addRow);
  addMetric.addEventListener('click', () => { addRow(); rows[rows.length - 1].value.focus(); });
  updateAdd();

  const el = h('div', null,
    field('Title', title),
    field('Slug', slug, 'Used in links. Filled automatically from the title — you can change it.'),
    h('div', { class: 'grid-2' },
      field('Category', category, 'Used for the portfolio filter buttons.'),
      field('Category label', categoryLabel, 'Shown on the card, e.g. COACHING & TUITION')),
    h('div', { class: 'grid-2' }, field('Location', location), field('Highlight chip', highlight, 'Short result, e.g. +320% Leads')),
    field('Live website', url, 'Optional. Shows a “Visit live site” link on the project card.'),
    image.el,
    field('The challenge', challenge),
    field('The solution', solution),
    h('div', { class: 'field' }, h('span', { class: 'field-label' }, 'Results (up to 4)'),
      h('p', { class: 'help' }, 'A number and what it means, e.g. “+320%” / “More enquiries”.'),
      metricsBox, h('div', null, addMetric)),
    h('div', { class: 'grid-2' }, field('Sort order', sort, 'Lower numbers show first.'), h('div', { class: 'field', style: 'justify-content:end' }, published.el)));

  return {
    el,
    getData: () => ({
      title: title.value.trim(),
      slug: slugify(slug.value) || slugify(title.value),
      category: category.value,
      category_label: categoryLabel.value.trim(),
      location: location.value.trim(),
      url: url.value.trim(),
      image: image.value,
      highlight: highlight.value.trim(),
      challenge: challenge.value.trim(),
      solution: solution.value.trim(),
      metrics: rows.map((r) => ({ value: r.value.value.trim(), label: r.label.value.trim() })).filter((m) => m.value || m.label),
      sort: Number(sort.value) || 0,
      published: published.input.checked ? 1 : 0,
    }),
    validate: (d) => {
      if (!d.title) return { message: 'Please enter a project title.', el: title };
      if (!d.slug) return { message: 'Please enter a slug.', el: slug };
      return null;
    },
  };
}

/* ---------- Reviews ---------- */
function viewReviews(main) {
  crudPage(main, {
    title: 'Reviews', subtitle: 'Client testimonials shown on your website.',
    singular: 'review', endpoint: '/reviews', icon: '❝',
    emptyTitle: 'No reviews yet', emptyText: 'Add a testimonial from a happy client.',
    defaults: { rating: 5, published: 1 },
    labelOf: (r) => (r.name ? `review by ${r.name}` : 'this review'),
    headers: ['Client', 'Result', 'Rating', 'Quote', 'Published', 'Sort'],
    columns: (r, { edit }) => [
      { attrs: { class: 'title-cell' }, content: [h('strong', null, h('button', { type: 'button', class: 'btn-link', onclick: () => edit(r) }, r.name || 'Unnamed')), h('span', null, r.role || '')] },
      { content: r.result ? h('span', { class: 'chip' }, r.result) : h('span', { class: 'muted' }, '—') },
      { content: h('span', { class: 'stars', 'aria-label': `${Number(r.rating) || 0} out of 5 stars` }, '★'.repeat(Number(r.rating) || 0) + '☆'.repeat(5 - (Number(r.rating) || 0))) },
      { content: h('span', { class: 'small muted' }, truncate(r.quote, 80)) },
    ],
    form: reviewForm,
  });
}

function truncate(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; }

function reviewForm(r) {
  const name = h('input', { type: 'text', value: r.name || '', required: true, placeholder: 'e.g. Priya Sharma' });
  const role = h('input', { type: 'text', value: r.role || '', placeholder: 'e.g. Owner, Glow Beauty Salon' });
  const result = h('input', { type: 'text', value: r.result || '', placeholder: 'e.g. +45 Enrollments', maxlength: 40 });
  const quote = h('textarea', { rows: 5, value: r.quote || '', placeholder: 'What did they say about working with you?' });
  const rating = select([[5, '★★★★★  5 stars'], [4, '★★★★  4 stars'], [3, '★★★  3 stars'], [2, '★★  2 stars'], [1, '★  1 star']], r.rating || 5);
  const sort = h('input', { type: 'number', value: r.sort ?? 0 });
  const published = checkbox('Published (visible on the website)', Number(r.published) === 1);
  const el = h('div', null,
    h('div', { class: 'grid-2' }, field('Name', name), field('Role / business', role)),
    h('div', { class: 'grid-2' }, field('Result tag', result, 'Short result, e.g. +45 Enrollments'), field('Rating', rating)),
    field('Quote', quote),
    h('div', { class: 'grid-2' }, field('Sort order', sort, 'Lower numbers show first.'), h('div', { class: 'field', style: 'justify-content:end' }, published.el)));
  return {
    el,
    getData: () => ({
      name: name.value.trim(), role: role.value.trim(), result: result.value.trim(), quote: quote.value.trim(),
      rating: Number(rating.value) || 5, sort: Number(sort.value) || 0, published: published.input.checked ? 1 : 0,
    }),
    validate: (d) => {
      if (!d.name) return { message: 'Please enter the client’s name.', el: name };
      if (!d.quote) return { message: 'Please enter the review text.', el: quote };
      return null;
    },
  };
}

/* =========================================================================
   Pricing plans
   ========================================================================= */
function viewPlans(main) {
  crudPage(main, {
    title: 'Pricing plans', subtitle: 'Packages shown on the Pricing page and the homepage.',
    singular: 'plan', endpoint: '/plans', icon: '₹',
    emptyTitle: 'No plans yet', emptyText: 'Add your first package — name, price and what’s included.',
    defaults: { period: 'one-time', cta: 'Choose plan', published: 1, popular: 0, features: [] },
    labelOf: (p) => (p.name ? `plan ${p.name}` : 'this plan'),
    headers: ['Plan', 'Price', 'Features', 'Published', 'Sort'],
    columns: (p, { edit }) => [
      { attrs: { class: 'title-cell' }, content: [h('strong', null, h('button', { type: 'button', class: 'btn-link', onclick: () => edit(p) }, p.name || 'Unnamed'), Number(p.popular) ? h('span', { class: 'badge badge-live', style: 'margin-left:8px' }, 'Most popular') : null), h('span', null, p.badge || '')] },
      { content: h('strong', null, `₹${p.price || '—'}`, h('span', { class: 'small muted' }, ` / ${p.period || 'one-time'}`)) },
      { content: h('span', { class: 'small muted' }, `${(Array.isArray(p.features) ? p.features : []).length} items`) },
    ],
    form: planForm,
  });
}

function planForm(p) {
  const name = h('input', { type: 'text', value: p.name || '', required: true, placeholder: 'e.g. Growth & Automation' });
  const badge = h('input', { type: 'text', value: p.badge || '', placeholder: 'e.g. GROWTH BUSINESS', maxlength: 40 });
  const price = h('input', { type: 'text', value: p.price || '', required: true, placeholder: 'e.g. 14,999' });
  const period = h('input', { type: 'text', value: p.period || 'one-time', placeholder: 'one-time / month' });
  const description = h('textarea', { rows: 2, value: p.description || '', placeholder: 'Who is this plan for? One short line.' });
  const features = h('textarea', { rows: 8, value: (Array.isArray(p.features) ? p.features : []).join('\n'), placeholder: 'One feature per line' });
  const cta = h('input', { type: 'text', value: p.cta || 'Choose plan', placeholder: 'Button text' });
  const sort = h('input', { type: 'number', value: p.sort ?? 0 });
  const popular = checkbox('Mark as “Most popular” (highlighted card)', Number(p.popular) === 1);
  const published = checkbox('Published (visible on the website)', Number(p.published) === 1);
  const el = h('div', null,
    h('div', { class: 'grid-2' }, field('Plan name', name), field('Small label', badge, 'Shown above the name, e.g. STARTER PRESENCE')),
    h('div', { class: 'grid-2' }, field('Price (₹)', price, 'Just the number, e.g. 14,999'), field('Billing', period, 'Shown after the price, e.g. one-time')),
    field('Short description', description),
    field('What’s included', features, 'One feature per line (up to 15).'),
    h('div', { class: 'grid-2' }, field('Button text', cta), field('Sort order', sort, 'Lower numbers show first.')),
    popular.el, published.el);
  return {
    el,
    getData: () => ({
      name: name.value.trim(), badge: badge.value.trim(), price: price.value.trim().replace(/^₹\s*/, ''), period: period.value.trim() || 'one-time',
      description: description.value.trim(), features: features.value.split('\n').map((x) => x.trim()).filter(Boolean),
      cta: cta.value.trim() || 'Choose plan', sort: Number(sort.value) || 0,
      popular: popular.input.checked ? 1 : 0, published: published.input.checked ? 1 : 0,
    }),
    validate: (d) => {
      if (!d.name) return { message: 'Please enter the plan name.', el: name };
      if (!d.price) return { message: 'Please enter the price.', el: price };
      return null;
    },
  };
}

/* =========================================================================
   FAQs
   ========================================================================= */
let faqCategories = [];
function viewFaqs(main) {
  crudPage(main, {
    title: 'FAQs', subtitle: 'Questions shown on the FAQ page, the homepage and the Pricing page.',
    singular: 'question', endpoint: '/faqs', icon: '?',
    emptyTitle: 'No questions yet', emptyText: 'Add the questions customers ask you most.',
    defaults: { category: 'General', published: 1, show_on_home: 0 },
    labelOf: (f) => (f.question ? `“${truncate(f.question, 40)}”` : 'this question'),
    headers: ['Question', 'Category', 'Homepage', 'Published', 'Sort'],
    columns: (f, { edit }) => {
      if (f.category && !faqCategories.includes(f.category)) faqCategories.push(f.category);
      return [
        { attrs: { class: 'title-cell' }, content: [h('strong', null, h('button', { type: 'button', class: 'btn-link', onclick: () => edit(f) }, truncate(f.question, 70) || 'Untitled')), h('span', null, truncate(f.answer, 90))] },
        { content: h('span', { class: 'chip' }, f.category || 'General') },
        { content: Number(f.show_on_home) ? h('span', { class: 'badge badge-live' }, 'Yes') : h('span', { class: 'muted' }, '—') },
      ];
    },
    form: faqForm,
  });
}

function faqForm(f) {
  const listId = uid('faqcats');
  const category = h('input', { type: 'text', value: f.category || 'General', list: listId, placeholder: 'e.g. 💳 Pricing & Payments' });
  const datalist = h('datalist', { id: listId }, faqCategories.map((c) => h('option', { value: c })));
  const question = h('input', { type: 'text', value: f.question || '', required: true, placeholder: 'e.g. How fast will my website be live?' });
  const answer = h('textarea', { rows: 6, value: f.answer || '', placeholder: 'Clear, simple answer…' });
  const sort = h('input', { type: 'number', value: f.sort ?? 0 });
  const home = checkbox('Also show on the homepage FAQ', Number(f.show_on_home) === 1);
  const published = checkbox('Published (visible on the website)', Number(f.published) === 1);
  const el = h('div', null,
    field('Category', h('div', null, category, datalist), 'Questions are grouped by category on the FAQ page. Categories with “Pricing” or “Payment” also show on the Pricing page.'),
    field('Question', question),
    field('Answer', answer, 'Plain text. Wrap words in **double stars** to make them bold.'),
    h('div', { class: 'grid-2' }, field('Sort order', sort, 'Lower numbers show first.'), h('div', { class: 'field', style: 'justify-content:end' }, home.el)),
    published.el);
  return {
    el,
    getData: () => ({
      category: category.value.trim() || 'General', question: question.value.trim(), answer: answer.value.trim(),
      sort: Number(sort.value) || 0, show_on_home: home.input.checked ? 1 : 0, published: published.input.checked ? 1 : 0,
    }),
    validate: (d) => {
      if (!d.question) return { message: 'Please enter the question.', el: question };
      if (!d.answer) return { message: 'Please enter the answer.', el: answer };
      return null;
    },
  };
}

/* =========================================================================
   Blog
   ========================================================================= */
function viewBlog(main, rest) {
  if (rest[0]) return blogEditor(main, rest[0] === 'new' ? null : rest[0]);
  const { body } = page(main, 'Blog', 'Articles that help customers find you on Google.',
    h('a', { class: 'btn btn-primary', href: '#/blog/new' }, '+ New post'));
  const search = h('input', { type: 'search', placeholder: 'Search posts…', 'aria-label': 'Search posts' });
  const list = h('div');
  body.append(h('div', { class: 'toolbar' }, search), list);
  let posts = [];

  function render() {
    const q = search.value.trim().toLowerCase();
    const shown = posts.filter((p) => !q || [p.title, p.category, p.slug, p.excerpt].some((v) => String(v || '').toLowerCase().includes(q)));
    if (!posts.length) {
      list.replaceChildren(stateBox('✎', 'No blog posts yet', 'Write your first article — it helps people find you on Google.',
        h('a', { class: 'btn btn-primary', href: '#/blog/new' }, 'Write a blog post')));
      return;
    }
    if (!shown.length) { list.replaceChildren(stateBox('⌕', 'No matches', `No posts match “${search.value.trim()}”.`)); return; }
    list.replaceChildren(h('div', { class: 'table-wrap' }, h('table', { class: 'list' },
      h('thead', null, h('tr', null, ['Title', 'Category', 'Status', 'Date'].map((t) => h('th', { scope: 'col' }, t)), h('th', null, h('span', { class: 'visually-hidden' }, 'Actions')))),
      h('tbody', null, shown.map((p) => {
        const live = Number(p.published) === 1;
        return h('tr', null,
          h('td', { class: 'title-cell' }, h('strong', null, h('a', { href: `#/blog/${encodeURIComponent(p.id)}`, style: 'color:inherit;text-decoration:none' }, p.title || 'Untitled')), h('span', null, '/blog/' + (p.slug || ''))),
          h('td', null, p.category || h('span', { class: 'muted' }, '—')),
          h('td', null, h('span', { class: 'badge ' + (live ? 'badge-live' : 'badge-draft') }, live ? 'Published' : 'Draft')),
          h('td', { class: 'small' }, fmtDate(p.published_at || p.updated_at)),
          h('td', { class: 'actions' },
            live && p.slug && h('a', { class: 'btn btn-sm', href: `/blog/${encodeURIComponent(p.slug)}`, target: '_blank', rel: 'noopener' }, 'View ↗'),
            h('a', { class: 'btn btn-sm', href: `#/blog/${encodeURIComponent(p.id)}` }, 'Edit')));
      })))));
  }

  async function load() {
    list.replaceChildren(loadingState('Loading posts…'));
    try {
      posts = ((await api('/posts')).items || []).slice().sort((a, b) =>
        String(b.published_at || b.updated_at || '').localeCompare(String(a.published_at || a.updated_at || '')));
      render();
    } catch (err) {
      fail(err);
      list.replaceChildren(stateBox('!', 'Couldn’t load posts', err.message, h('button', { type: 'button', class: 'btn', onclick: load }, 'Try again')));
    }
  }
  search.addEventListener('input', render);
  load();
}

function blogEditor(main, id) {
  const back = h('a', { class: 'back-link', href: '#/blog' }, '← All posts');
  main.append(back);
  const holder = h('div');
  main.append(holder);
  holder.append(loadingState('Loading post…'));
  let snapshotFn = null;
  let saved = '';
  leaveGuard = () => !!snapshotFn && snapshotFn() !== saved;

  (async () => {
    let post = { title: '', slug: '', category: '', excerpt: '', cover_image: '', content: '', published: 0, published_at: todayISO() };
    if (id) {
      try {
        const items = (await api('/posts')).items || [];
        const found = items.find((p) => String(p.id) === String(id));
        if (!found) {
          holder.replaceChildren(stateBox('?', 'Post not found', 'It may have been deleted.', h('a', { class: 'btn', href: '#/blog' }, 'Back to posts')));
          return;
        }
        post = found;
      } catch (err) {
        fail(err);
        holder.replaceChildren(stateBox('!', 'Couldn’t load this post', err.message, h('button', { type: 'button', class: 'btn', onclick: () => route() }, 'Try again')));
        return;
      }
    }
    buildEditor(post);
  })();

  function buildEditor(post) {
    const titleH = h('h1', null, post.id ? 'Edit post' : 'New post');
    // --- main column
    const title = h('input', { type: 'text', class: 'title-input', value: post.title || '', placeholder: 'Post title' });
    const slug = h('input', { type: 'text', value: post.slug || '', spellcheck: 'false', placeholder: 'post-url' });
    bindSlug(title, slug, !post.slug);
    const content = h('textarea', { class: 'md-content', value: post.content || '', placeholder: 'Write your post in Markdown…\n\n## A heading\n\nSome **bold** text and a [link](https://example.com).', spellcheck: 'true' });
    const preview = h('div', { class: 'preview', hidden: true, 'aria-live': 'polite' });
    const imgFile = h('input', { type: 'file', accept: ACCEPT, hidden: true });

    const tb = (label, title_, fn) => h('button', { type: 'button', title: title_, 'aria-label': title_, onclick: fn }, label);
    const toolbar = h('div', { class: 'md-toolbar', role: 'toolbar', 'aria-label': 'Formatting' },
      tb('H2', 'Heading', () => prefixLines(content, () => '## ', true)),
      tb('H3', 'Sub-heading', () => prefixLines(content, () => '### ', true)),
      h('span', { class: 'sep', 'aria-hidden': 'true' }),
      tb(h('b', null, 'B'), 'Bold (Ctrl+B)', () => wrapSel(content, '**', '**', 'bold text')),
      tb(h('i', null, 'I'), 'Italic (Ctrl+I)', () => wrapSel(content, '*', '*', 'italic text')),
      tb('Link', 'Insert link (Ctrl+K)', () => insertLink(content)),
      h('span', { class: 'sep', 'aria-hidden': 'true' }),
      tb('• List', 'Bullet list', () => prefixLines(content, () => '- ')),
      tb('1. List', 'Numbered list', () => prefixLines(content, (i) => `${i + 1}. `)),
      h('span', { class: 'sep', 'aria-hidden': 'true' }),
      tb('Upload image', 'Upload an image and insert it', () => imgFile.click()),
      tb('From media', 'Insert an image from the media library', async () => {
        const url = await pickMedia();
        if (url) insertImage(content, url, 'Image');
      }),
      imgFile);
    imgFile.addEventListener('change', async () => {
      const f = imgFile.files[0]; imgFile.value = '';
      if (!f) return;
      toast('Uploading image…');
      try {
        const res = await uploadFile(f);
        insertImage(content, res.url, f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
        toast('Image inserted ✓');
      } catch (err) { fail(err); }
    });
    content.addEventListener('keydown', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'b') { e.preventDefault(); wrapSel(content, '**', '**', 'bold text'); }
      else if (k === 'i') { e.preventDefault(); wrapSel(content, '*', '*', 'italic text'); }
      else if (k === 'k') { e.preventDefault(); insertLink(content); }
    });

    const writeTab = h('button', { type: 'button', role: 'tab', 'aria-selected': 'true' }, 'Write');
    const previewTab = h('button', { type: 'button', role: 'tab', 'aria-selected': 'false' }, 'Preview');
    const editPane = h('div', { role: 'tabpanel' }, toolbar, content);
    content.setAttribute('aria-label', 'Post content (Markdown)');
    async function showPreview() {
      writeTab.setAttribute('aria-selected', 'false'); previewTab.setAttribute('aria-selected', 'true');
      editPane.hidden = true; preview.hidden = false;
      preview.replaceChildren(loadingState('Rendering preview…'));
      try {
        const res = await api('/preview', { method: 'POST', body: { markdown: content.value } });
        if (previewTab.getAttribute('aria-selected') !== 'true') return;
        if (!content.value.trim()) preview.replaceChildren(h('p', { class: 'muted' }, 'Nothing to preview yet.'));
        else preview.innerHTML = res.html || ''; // trusted server-rendered HTML
      } catch (err) {
        fail(err);
        preview.replaceChildren(h('p', { class: 'muted' }, 'Preview unavailable: ' + err.message));
      }
    }
    function showWrite() {
      writeTab.setAttribute('aria-selected', 'true'); previewTab.setAttribute('aria-selected', 'false');
      editPane.hidden = false; preview.hidden = true; content.focus();
    }
    writeTab.addEventListener('click', showWrite);
    previewTab.addEventListener('click', showPreview);

    const mainCol = h('div', { class: 'card' },
      field('Title', title),
      field('URL slug', slug, 'The post will live at /blog/your-slug. Filled automatically from the title.'),
      h('div', { class: 'field' },
        h('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap' },
          h('span', { class: 'field-label' }, 'Content'),
          h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Editor mode' }, writeTab, previewTab)),
        editPane, preview,
        h('p', { class: 'help' }, 'Markdown: ## Heading, **bold**, *italic*, [text](link), - list item.')));

    // --- side column
    const statusBadge = h('span', { class: 'badge' });
    const published = checkbox('Visible on website', Number(post.published) === 1);
    const pubDate = h('input', { type: 'date', value: post.published_at ? String(post.published_at).slice(0, 10) : todayISO() });
    const draftBtn = h('button', { type: 'button', class: 'btn' }, 'Save draft');
    const publishBtn = h('button', { type: 'button', class: 'btn btn-primary' }, 'Publish');
    const deleteBtn = h('button', { type: 'button', class: 'btn btn-danger btn-sm' }, 'Delete post');
    const viewLink = h('a', { class: 'view-post', target: '_blank', rel: 'noopener', hidden: true }, 'View post ↗');
    const savedNote = h('p', { class: 'help', style: 'margin:0' });

    const category = h('input', { type: 'text', value: post.category || '', list: 'blog-cats', placeholder: 'e.g. Local SEO' });
    const datalist = h('datalist', { id: 'blog-cats' }, BLOG_CATEGORIES.map((c) => h('option', { value: c })));
    const excerpt = h('textarea', { rows: 4, value: post.excerpt || '', placeholder: 'One or two sentences shown in the blog list and on Google.' });
    const counter = h('div', { class: 'counter', 'aria-live': 'polite' });
    const updateCounter = () => {
      const n = excerpt.value.length;
      counter.textContent = n > 160 ? `${n} characters — try to keep it under 160` : `${n} / 160 recommended`;
      counter.classList.toggle('over', n > 160);
    };
    excerpt.addEventListener('input', updateCounter);
    updateCounter();
    const cover = imageField({ label: 'Cover image', value: post.cover_image || '' });

    const side = h('div', { class: 'editor-side' },
      h('div', { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', null, 'Publish'), statusBadge),
        h('div', { class: 'field' }, published.el),
        field('Publish date', pubDate),
        h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px' }, draftBtn, publishBtn),
        h('div', { class: 'status-line' }, viewLink),
        savedNote,
        h('div', { style: 'margin-top:16px;padding-top:16px;border-top:1px solid var(--border)' }, deleteBtn)),
      h('div', { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', null, 'Details')),
        field('Category', category, 'Pick a suggestion or type your own.'), datalist,
        h('div', { class: 'field' },
          h('label', { for: excerpt.id = uid('ex') }, 'Excerpt'),
          excerpt, counter),
        cover.el));

    holder.replaceChildren(
      h('div', { class: 'page-head' }, titleH),
      h('div', { class: 'editor-layout' }, mainCol, side));

    const getData = () => ({
      title: title.value.trim(),
      slug: slugify(slug.value) || slugify(title.value),
      category: category.value.trim(),
      excerpt: excerpt.value.trim(),
      cover_image: cover.value,
      content: content.value,
      published: published.input.checked ? 1 : 0,
      published_at: pubDate.value || todayISO(),
    });
    snapshotFn = () => JSON.stringify(getData());
    saved = snapshotFn();

    function refreshStatus() {
      const live = Number(post.published) === 1 && post.id;
      statusBadge.className = 'badge ' + (live ? 'badge-live' : 'badge-draft');
      statusBadge.textContent = !post.id ? 'Not saved' : live ? 'Published' : 'Draft';
      publishBtn.textContent = live ? 'Update' : 'Publish';
      draftBtn.textContent = live ? 'Unpublish' : 'Save draft';
      viewLink.hidden = !(live && post.slug);
      if (post.slug) viewLink.href = `/blog/${encodeURIComponent(post.slug)}`;
      deleteBtn.hidden = !post.id;
      titleH.textContent = post.id ? 'Edit post' : 'New post';
      savedNote.textContent = post.updated_at ? `Last saved ${fmtDate(post.updated_at)}` : '';
    }
    refreshStatus();

    async function save(publish) {
      published.input.checked = publish;
      const data = getData();
      if (!data.title) { toast('Please give your post a title.', 'error'); title.focus(); return; }
      if (!data.slug) { toast('Please enter a URL slug.', 'error'); slug.focus(); return; }
      slug.value = data.slug;
      const btn = publish ? publishBtn : draftBtn;
      const other = publish ? draftBtn : publishBtn;
      setBusy(btn, true, 'Saving…'); other.disabled = true;
      try {
        const res = post.id
          ? await api(`/posts/${encodeURIComponent(post.id)}`, { method: 'PUT', body: data })
          : await api('/posts', { method: 'POST', body: data });
        const wasNew = !post.id;
        post = { ...post, ...data, ...(res.item || {}) };
        saved = snapshotFn();
        if (wasNew && post.id != null) {
          const newHash = `#/blog/${encodeURIComponent(post.id)}`;
          history.replaceState(null, '', newHash);
          currentHash = newHash;
        }
        toast(publish ? 'Published ✓' : 'Draft saved ✓');
      } catch (err) { fail(err); }
      finally {
        setBusy(btn, false); other.disabled = false;
        refreshStatus();
      }
    }
    draftBtn.addEventListener('click', () => save(false));
    publishBtn.addEventListener('click', () => save(true));
    deleteBtn.addEventListener('click', async () => {
      if (!post.id) return;
      if (!(await confirmDialog(`Delete “${post.title || 'this post'}”? This can’t be undone.`, { title: 'Delete post?' }))) return;
      setBusy(deleteBtn, true, 'Deleting…');
      try {
        await api(`/posts/${encodeURIComponent(post.id)}`, { method: 'DELETE' });
        leaveGuard = null; snapshotFn = null;
        toast('Post deleted');
        location.hash = '#/blog';
      } catch (err) { fail(err); setBusy(deleteBtn, false); }
    });

    if (!post.id) title.focus();
  }
}

/* ---------- Markdown textarea helpers ---------- */
function changed(ta) { ta.dispatchEvent(new Event('input', { bubbles: true })); ta.focus(); }

function wrapSel(ta, before, after, placeholder) {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const sel = value.slice(s, e) || placeholder;
  ta.focus();
  ta.setRangeText(before + sel + after, s, e, 'end');
  ta.setSelectionRange(s + before.length, s + before.length + sel.length);
  changed(ta);
}

function prefixLines(ta, prefixFn, heading = false) {
  const { value } = ta;
  let s = value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
  let e = value.indexOf('\n', ta.selectionEnd);
  if (e === -1) e = value.length;
  const lines = value.slice(s, e).split('\n');
  const out = lines.map((line, i) => {
    if (heading) return prefixFn(i) + line.replace(/^#{1,6}\s*/, '');
    return line.trim() ? prefixFn(i) + line.replace(/^(\s*)([-*+]|\d+\.)\s+/, '$1') : line;
  }).join('\n');
  const text = lines.length === 1 && !lines[0].trim() && !heading ? prefixFn(0) : out;
  ta.focus();
  ta.setRangeText(text, s, e, 'end');
  changed(ta);
}

function insertLink(ta) {
  const url = window.prompt('Link address (URL):', 'https://');
  if (!url || url === 'https://') { ta.focus(); return; }
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const text = value.slice(s, e) || 'link text';
  ta.focus();
  ta.setRangeText(`[${text}](${url.trim()})`, s, e, 'end');
  if (s === e) ta.setSelectionRange(s + 1, s + 1 + text.length);
  changed(ta);
}

function insertImage(ta, url, alt) {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const pre = s > 0 && value[s - 1] !== '\n' ? '\n\n' : '';
  const safeAlt = String(alt || 'Image').replace(/[[\]]/g, '');
  ta.focus();
  ta.setRangeText(`${pre}![${safeAlt}](${url})\n`, s, e, 'end');
  changed(ta);
}

/* =========================================================================
   Media page
   ========================================================================= */
function viewMedia(main) {
  const { body } = page(main, 'Media library', 'All images uploaded to your website. Copy a URL to use it anywhere.');
  mediaLibrary(body);
}

/* =========================================================================
   Boot
   ========================================================================= */
function init() {
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = $('#login-password');
    const err = $('#login-error');
    const btn = $('#login-submit');
    if (!pw.value) { err.textContent = 'Please enter your password.'; err.hidden = false; pw.focus(); return; }
    err.hidden = true;
    setBusy(btn, true, 'Logging in…');
    try {
      await api('/login', { method: 'POST', body: { password: pw.value } });
      pw.value = '';
      showApp();
    } catch (ex) {
      err.textContent = ex.status === 401 ? (ex.message.startsWith('Something') ? 'Wrong password. Please try again.' : ex.message) : ex.message;
      err.hidden = false;
      pw.select();
    } finally { setBusy(btn, false); }
  });

  $('#logout-btn').addEventListener('click', async () => {
    if (!confirmLeave()) return;
    const btn = $('#logout-btn');
    setBusy(btn, true, 'Logging out…');
    try { await api('/logout', { method: 'POST' }); } catch (ex) { if (!(ex instanceof AuthError)) fail(ex); }
    setBusy(btn, false);
    leaveGuard = null;
    appStarted = false;
    $('#main').replaceChildren();
    modalStack.slice().forEach((m) => m.close());
    showLogin();
  });

  $('#menu-toggle').addEventListener('click', () => ($('#sidebar').classList.contains('open') ? closeDrawer() : openDrawer()));
  $('#drawer-backdrop').addEventListener('click', closeDrawer);

  (async () => {
    try {
      const res = await fetch(API + '/me', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (res.ok) showApp(); else showLogin();
    } catch { showLogin(); }
  })();
}

init();
