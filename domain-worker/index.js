// Serves https://susanta.me by forwarding requests to the Cloudflare Pages project.
// www.susanta.me redirects to susanta.me. Deployed with: npx wrangler deploy (in this folder).
const ORIGIN = 'https://susanta-me.pages.dev';
const SITE = 'https://susanta.me';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.protocol === 'http:' || url.hostname === 'www.susanta.me') {
      url.protocol = 'https:';
      url.hostname = 'susanta.me';
      return Response.redirect(url.toString(), 301);
    }

    const headers = new Headers(request.headers);
    // The site checks that admin requests come from its own origin.
    if (headers.has('origin')) headers.set('origin', ORIGIN);
    headers.set('x-forwarded-host', url.hostname);
    headers.set('x-sd-client-ip', request.headers.get('cf-connecting-ip') || '');

    const upstream = await fetch(new URL(url.pathname + url.search, ORIGIN), {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    const response = new Response(upstream.body, upstream);
    const location = response.headers.get('location');
    if (location?.startsWith(ORIGIN)) response.headers.set('location', SITE + location.slice(ORIGIN.length));
    return response;
  },
};
