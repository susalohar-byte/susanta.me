# Sushanta Digital — website + admin panel

Static, SEO-friendly site on **Cloudflare Pages**, with an admin panel at `/admin` for editing the logo, homepage hero, contact details, portfolio projects, reviews and blog posts, and for uploading images.

| Piece | Where |
|---|---|
| Pages (HTML/CSS/JS) | `public/` (built by `scripts/build.mjs`) |
| Admin panel | `public/admin/` → `https://your-site/admin` |
| API + live content | `functions/` (Cloudflare Pages Functions) |
| Database (settings, projects, reviews, posts) | Cloudflare **D1**, schema in `migrations/` |
| Uploaded images | Cloudflare **R2**, served at `/media/...` |

Content edited in `/admin` shows up on the site immediately — `functions/_middleware.js` fills it into each page before it's sent, so Google sees it too. Blog posts get their own pages at `/blog/{slug}` and are added to `/sitemap.xml` automatically.

## First-time deploy (about 10 minutes)

```bash
npm install
npx wrangler login

# 1. Database — copy the printed database_id into wrangler.toml
npx wrangler d1 create susanta-me-db
npm run db:migrate:remote          # creates tables + current site content

# 2. Image storage
npx wrangler r2 bucket create susanta-me-media

# 3. Create the Pages project and deploy
npx wrangler pages project create susanta-me --production-branch main
npm run deploy

# 4. Admin password + session secret (use a strong password)
npx wrangler pages secret put ADMIN_PASSWORD
npx wrangler pages secret put SESSION_SECRET     # paste a long random string, e.g. from: openssl rand -hex 32
npm run deploy                                   # redeploy so the secrets take effect
```

Then in the Cloudflare dashboard: **Workers & Pages → susanta-me → Custom domains → add `susanta.me`**.

**Recommended extra lock:** Cloudflare **Zero Trust → Access → Applications**, protect `susanta.me/admin*` and `susanta.me/api/admin*` so only your email can even reach the login page.

## Everyday use

- Log in at `https://susanta.me/admin`.
- **Site settings:** logos, favicon, hero image/title/subtitle (wrap a word in `[[ ]]` to highlight it), WhatsApp number, email, social links, homepage numbers, share image.
- **Projects / Reviews:** add, edit, hide or reorder. Projects can link to the client's live website.
- **Pricing plans:** name, price, what's included, button text, “Most popular” highlight — used on the homepage and Pricing page.
- **FAQs:** questions grouped by category; tick “Show on homepage” for the homepage FAQ. Categories containing “Pricing” or “Payment” also appear on the Pricing page. Google's FAQ data updates automatically.
- **Blog:** write in Markdown, preview, save as draft or publish.
- **Media library:** upload images (max 5 MB) and copy their links.
- **Leads:** every enquiry-form submission is saved here (name, phone, business, need, page, ad source). Mark each as New / Contacted / Won / Lost, add notes, WhatsApp or call in one click, and download everything as CSV. The form still opens WhatsApp for the visitor as before.

## Local development

```bash
cp .dev.vars.example .dev.vars     # set a local ADMIN_PASSWORD (8+ chars) and SESSION_SECRET
npm run db:migrate:local
npm run dev                        # http://localhost:8788  (admin: /admin)
```

## Changing page layouts or fixed text

Page layouts and fixed copy live in `scripts/build.mjs` (shared header/footer/SEO in `functions/_lib/layout.js`). Edit, then run `npm run build` and deploy. Things managed in `/admin` don't need a rebuild.

## Notes

- SEO: every page has its own title, description, canonical URL, Open Graph tags and structured data; `/sitemap.xml` and `robots.txt` are generated.
- Review and stat numbers are seeded from the old site — replace them with real ones in `/admin`.
