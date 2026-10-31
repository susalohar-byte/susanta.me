// Blog article pages: /blog/{slug}
import { getPostBySlug, listRows } from '../_lib/db.js';
import { markdownToHtml } from '../_lib/markdown.js';
import { esc, readingTime, formatDate } from '../_lib/templates.js';
import { page, SITE, waIcon, waLink } from '../_lib/layout.js';

export async function onRequestGet({ params, env, next }) {
  const slug = String(params.slug || '').replace(/\.html$/, '');
  if (!env.DB || !/^[a-z0-9-]+$/.test(slug)) return next();
  const post = await getPostBySlug(env, slug);
  if (!post) return next();

  const related = (await listRows(env, 'posts', { publishedOnly: true })).filter((p) => p.slug !== slug).slice(0, 3);
  const path = `/blog/${slug}`;
  const cover = post.cover_image || '/assets/images/og-cover.jpg';
  const schema = [{
    '@type': 'BlogPosting', headline: post.title, description: post.excerpt, url: SITE + path,
    image: cover.startsWith('/') ? SITE + cover : cover, datePublished: post.published_at, dateModified: (post.updated_at || '').slice(0, 10) || post.published_at,
    author: { '@id': `${SITE}/#sushanta` }, publisher: { '@id': `${SITE}/#business` }, mainEntityOfPage: SITE + path, inLanguage: 'en-IN',
  }];

  const read = readingTime(post.content);
  const shareText = encodeURIComponent(`${post.title} — ${SITE}${path}`);
  const body = `
    <div class="read-progress" aria-hidden="true"><span></span></div>
    <article class="article-page">
      <header class="art-head">
        <div class="art-wrap">
          <a href="/blog" class="art-back">&larr; All articles</a>
          <span class="post__cat">${esc(post.category || 'Guide')}</span>
          <h1>${esc(post.title)}</h1>
          ${post.excerpt ? `<p class="art-lead">${esc(post.excerpt)}</p>` : ''}
          <div class="art-meta">
            <div class="art-author">
              <img src="/assets/images/gen_sushanta_circle.png" alt="" width="40" height="40">
              <div><b>Sushanta Lohar</b><span>${esc(formatDate(post.published_at))} · ${esc(read)}</span></div>
            </div>
            <div class="art-share">
              <a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">${waIcon(16)}</a>
              <button type="button" class="art-copy" data-copy="${esc(SITE + path)}" aria-label="Copy link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg></button>
            </div>
          </div>
        </div>
      </header>
      ${post.cover_image ? `<div class="art-wrap art-wrap--wide"><img class="art-cover" src="${esc(post.cover_image)}" alt="" width="1376" height="768"></div>` : ''}
      <div class="art-wrap">
        <div class="prose art-prose">${markdownToHtml(post.content)}</div>
        <aside class="art-author-card">
          <img src="/assets/images/gen_sushanta_circle.png" alt="" width="56" height="56" loading="lazy">
          <div>
            <b>Written by Sushanta Lohar</b>
            <p>I help local businesses get more customers with websites, WhatsApp automation and Meta ads. Want help with this?</p>
          </div>
          <a href="${waLink(`Hi Sushanta! I read "${post.title}" and want help with my business.`)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--sm">${waIcon(16)} Ask me</a>
        </aside>
        ${related.length ? `
        <section class="art-more" aria-labelledby="keep-reading">
          <h2 id="keep-reading">Keep reading</h2>
          ${related.map((r) => `<a href="/blog/${esc(r.slug)}" class="art-more__row"><span class="art-more__cat">${esc(r.category || 'Guide')}</span><b>${esc(r.title)}</b><span class="art-more__time">${esc(readingTime(r.content))} &rarr;</span></a>`).join('')}
        </section>` : ''}
      </div>
    </article>
`;
  const html = page({
    path: '/blog',
    head: { canonical: path, title: `${post.title} | Sushanta Digital`, description: post.excerpt || post.title, crumb: [['Blog', '/blog'], [post.title, path]], schema, ogType: 'article', image: cover },
    body,
    contact: false,
  });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
