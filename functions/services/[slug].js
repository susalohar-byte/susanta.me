// Service detail pages: /services/{slug}
import { getServiceBySlug, listRows } from '../_lib/db.js';
import { markdownToHtml } from '../_lib/markdown.js';
import { esc, servicesHtml, serviceVisualHtml, serviceVideosHtml, serviceTint, formatDate } from '../_lib/templates.js';
import { page, SITE, BUSINESS, waIcon, waLink } from '../_lib/layout.js';

export async function onRequestGet({ params, env, next }) {
  const slug = String(params.slug || '').replace(/\.html$/, '');
  if (!env.DB || !/^[a-z0-9-]+$/.test(slug)) return next();
  const svc = await getServiceBySlug(env, slug);
  if (!svc) return next();

  const all = await listRows(env, 'services', { publishedOnly: true });
  const n = String(all.findIndex((s) => s.slug === slug) + 1).padStart(2, '0');
  const others = all.map((s, i) => ({ ...s, _n: i + 1 })).filter((s) => s.slug !== slug).slice(0, 4);
  const path = `/services/${slug}`;
  const cta = svc.cta || `Get ${svc.name} for my business`;
  const lead = svc.summary || svc.tagline || svc.name;
  const description = svc.seo_description || lead;
  const updated = String(svc.updated_at || '').slice(0, 10);
  const visual = serviceVisualHtml(svc);
  const videos = serviceVideosHtml(svc.videos);
  const abs = (u) => (/^https?:\/\//i.test(u) ? u : SITE + u);
  const videoSchema = (Array.isArray(svc.videos) ? svc.videos : []).filter((v) => v.url && v.poster && !/youtu/i.test(v.url)).map((v) => ({
    '@type': 'VideoObject', name: v.title || `${svc.name} sample`, description: `${v.title || 'Sample video'} — made by Sushanta Digital (${svc.name}).`,
    thumbnailUrl: abs(v.poster), contentUrl: abs(v.url), uploadDate: updated || undefined,
  }));
  const list = (title, items) => (items.length ? `<div><h3>${esc(title)}</h3><ul class="ticks">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
  const schema = [{
    '@type': 'Service', '@id': `${SITE}${path}#service`, name: svc.name, description, url: SITE + path,
    provider: { '@id': `${SITE}/#business` }, areaServed: BUSINESS.areaServed, serviceType: svc.name,
    audience: { '@type': 'BusinessAudience', name: 'Local businesses' },
    ...(svc.features.length ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: svc.name, itemListElement: svc.features.map((f) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: f } })) } } : {}),
  }, ...videoSchema];

  const body = `
    <section class="ph ph--navy on-dark svc-page__hero">
      <div class="container">
        <a href="/services" class="svc-page__back">&larr; All services</a>
        <span class="eyebrow eyebrow--light">${n} — ${esc(svc.name)}</span>
        <h1 class="ph__title svc-page__title">${esc(svc.tagline || svc.name)}</h1>
        ${svc.intro ? `<p class="ph__lead">${esc(svc.intro)}</p>` : ''}
        <div class="ph__ctas">
          <a href="#contact" class="btn btn--primary" data-service="${esc(svc.name)}">${esc(cta)} <span class="arr">&rarr;</span></a>
          <a href="${waLink(`Hi Sushanta! I'd like to know more about ${svc.name}.`)}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost-light">${waIcon(18)} Ask on WhatsApp</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container svc-page">
        ${visual ? `<div class="svc__visual ${serviceTint(svc)} svc-page__visual reveal-scale">${visual}${svc.note ? `<span class="doodle">${esc(svc.note)}</span>` : ''}</div>` : ''}
        <div class="svc-page__info reveal">
          <span class="eyebrow eyebrow--outline">What's included</span>
          <h2 class="svc-page__h2">${esc(svc.name)}</h2>
          ${svc.summary ? `<p class="svc-page__summary">${esc(svc.summary)}</p>` : ''}
          <div class="svc__cols">${list('What you get', svc.features)}${list('Perfect for', svc.ideal_for)}</div>
          <a href="#contact" class="btn btn--dark" data-service="${esc(svc.name)}">${esc(cta)} <span class="arr">&rarr;</span></a>
          ${updated ? `<p class="svc-page__updated">Updated <time datetime="${esc(updated)}">${esc(formatDate(updated))}</time></p>` : ''}
        </div>
      </div>
    </section>
${videos ? `
    <section class="section section--flush-top" id="samples">
      <div class="container">
        <div class="sec-head reveal"><div><span class="eyebrow">Sample videos</span><h2 class="h-section">See what we <span class="mark">make</span></h2></div><p class="lead">Real videos made for our clients and our own channels. Tap play to watch.</p></div>
        <div class="vid-grid">${videos}</div>
      </div>
    </section>` : ''}${svc.content ? `
    <section class="section section--flush-top">
      <div class="art-wrap"><div class="prose art-prose">${markdownToHtml(svc.content)}</div></div>
    </section>` : ''}${others.length ? `
    <section class="section section--soft">
      <div class="container">
        <div class="sec-head reveal"><div><span class="eyebrow">More services</span><h2 class="h-section">Everything you need to <span class="mark">grow</span></h2></div><a href="/services" class="btn btn--ghost btn--sm">All services <span class="arr">&rarr;</span></a></div>
        <div class="svc-index">${servicesHtml(others)}</div>
      </div>
    </section>` : ''}
`;
  const html = page({
    path: '/services',
    head: { canonical: path, title: `${svc.name} | Sushanta Digital`, description: description.slice(0, 300), dateModified: updated || undefined, crumb: [['Services', '/services'], [svc.name, path]], schema, image: svc.image || undefined },
    body,
  });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
