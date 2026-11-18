# GEO Analysis — susanta.me

**Date:** 5 Nov 2026 · **Scope:** live site (home, /services, 2 service pages, about, faq, pricing, work, blog + 1 post), robots.txt, crawler access tests, web search for brand mentions.

Google's position (AI optimization guide, 2026): optimizing for AI search *is* SEO. The findings below are SEO fundamentals applied to AI answers (Google AI Overviews / AI Mode, ChatGPT Search, Perplexity, Claude).

---

## 1. GEO Readiness Score: **51 / 100**

| Area | Weight | Score | Why |
|---|---|---|---|
| Citability | 25 | 11 | Good lists, but no "X is…" answer blocks, few specific facts, short blog posts (~350 words) |
| Structural readability | 20 | 14 | Clean H1→H2→H3, lists, FAQ page; almost no question-style headings outside the FAQ |
| Multi-modal | 15 | 7 | Images and illustrations; no video, no charts or tables |
| Authority & brand | 20 | 6 | Person + author on blog, but no `sameAs`, social links empty, almost no web mentions |
| Technical accessibility | 20 | 13 | Fully server-rendered, sitemap OK; Perplexity and all user-triggered AI fetchers blocked |

## 2. Platform readiness (not measured with a visibility tool)

No DataForSEO/SE Ranking data was used, so these are qualitative.

| Platform | Readiness | Main blocker |
|---|---|---|
| Google AI Overviews / AI Mode | Medium | Googlebot allowed; weak entity/brand signals and thin answer content |
| ChatGPT Search | Medium-low | `OAI-SearchBot` allowed, but `ChatGPT-User` (live fetch when a user asks about your site) is blocked |
| Perplexity | Low | `PerplexityBot` returned **403** and `Perplexity-User` is disallowed |
| Claude | Medium-low | `Claude-SearchBot` allowed; `Claude-User` disallowed |

## 3. AI crawler access

robots.txt is **Cloudflare's managed robots.txt** (the "BEGIN Cloudflare Managed content" block), plus your own rules. Requests were tested with each user-agent against `/services/local-business-promotion`. A spoofed UA is not the real bot, so confirm in Cloudflare → AI Crawl Control.

**Search / citation crawlers**

| Crawler | Governs | robots.txt | HTTP test |
|---|---|---|---|
| Googlebot | Google Search, AI Overviews, AI Mode | Allowed | 200 ✅ |
| OAI-SearchBot | ChatGPT Search citations | Allowed | 200 ✅ |
| Claude-SearchBot | Claude search citations | Allowed | 200 ✅ |
| PerplexityBot | Perplexity search index | Not listed (allowed) | **403 ❌** (blocked at Cloudflare firewall level, likely AI Crawl Control) |
| Applebot | Siri / Spotlight / Safari | Allowed | — |

**User-triggered fetchers** (a person asks an AI to open your page)

| Crawler | robots.txt |
|---|---|
| ChatGPT-User | **Disallowed** |
| Claude-User | **Disallowed** (Anthropic honors this) |
| Perplexity-User | **Disallowed** |
| Google-Agent, Google-GeminiNotebook | Disallowed (Google says these generally ignore robots.txt) |

**Training crawlers** (licensing choice, *not* a search-visibility issue)

| Crawler | Governs | Status |
|---|---|---|
| GPTBot | OpenAI training | Disallowed (403) |
| ClaudeBot | Anthropic training | Disallowed (403) |
| Google-Extended | Gemini training/grounding (does **not** affect Google Search or AI Overviews) | Disallowed |
| Applebot-Extended | Apple Intelligence training (does not affect Siri/Spotlight) | Disallowed |
| CCBot, Bytespider, cohere-ai, meta-externalagent | Training | Disallowed |

**Content-Signal:** `search=yes, ai-train=no, use=reference`. `ai-input` is **not set**, so you neither grant nor refuse use in AI answers. For a lead-generation business, `ai-input=yes` matches your goal.

## 4. llms.txt

`/llms.txt` → **404**. It's optional: Google says it doesn't help or hurt, and no major AI provider confirms using it. It carries no weight in this score. Low priority. A template is at the end in case you want one for other tools.

## 5. Brand mentions

| Source | Found |
|---|---|
| Web search "Sushanta Digital" Purulia | **Nothing about you.** The only match is a different business, "Susanta Digital Seva Kendra" (a CSC centre in Neturia, Purulia) |
| Web search "Sushanta Lohar" digital marketing | Nothing linked to you |
| Wikipedia / Wikidata | None (normal for a local business, not a goal) |
| LinkedIn / YouTube / Instagram / Facebook | Social link fields in /admin are **empty**, so the footer hides them and schema has no `sameAs` |
| Google Business Profile | Not verifiable from here; check you have one |

**Risk:** AI systems may confuse "Sushanta Digital" with "Susanta Digital Seva Kendra" in the same district. Consistent name + address + `sameAs` links across profiles is how you separate the two.

## 6. Passage-level citability

**What works**
- Service pages have clear numbered "How it works" lists and "What you get / Perfect for" lists, server-rendered.
- The FAQ page has real Q&A with FAQPage schema (FAQ rich results are limited to government and health sites, but the Q&A format itself is citable).
- Pricing page has concrete figures (₹6,999 / ₹14,999 / ₹24,999).

**What's missing**
- No page answers "What is Local Business Promotion / lead generation for a local business?" in the first 60 words.
- Service pages have no facts an AI could quote: price range, timeline, area served, budget, typical result.
- Blog post `/blog/whatsapp-vs-forms` is ~350 words with two H2s. That's too thin to be the best answer for anything.
- Several key sentences are in Bengali on a page declared `lang="en-IN"`. Search engines and AI may misread or skip them.

## 7. Server-side rendering

✅ **Pass.** Every page, including `/services/{slug}`, is complete in raw HTML: static pages plus Cloudflare Functions, with content filled server-side by HTMLRewriter. No JavaScript is needed to see content, so GPTBot/PerplexityBot-style fetchers (no JS) see everything they're allowed to fetch.

---

## 8. Top 5 highest-impact changes

1. **Let AI answer engines read you (Cloudflare dashboard, 10 min).**
   In AI Crawl Control / managed robots.txt, allow `PerplexityBot`, `Perplexity-User`, `ChatGPT-User` and `Claude-User`, and add `ai-input=yes` to the Content-Signal. Training bots (GPTBot, ClaudeBot, Google-Extended…) can stay blocked. Right now, when someone asks ChatGPT, Claude or Perplexity "check susanta.me", it can't open the page.

2. **Build one consistent entity.**
   Fill Instagram / Facebook / LinkedIn / YouTube in /admin → Site settings. Then add them as `sameAs` on the `ProfessionalService` and `Person` schema (code change in `functions/_lib/layout.js`). Make sure your Google Business Profile uses exactly "Sushanta Digital", the same address and phone. This is the main fix for the "Susanta Digital Seva Kendra" confusion.

3. **Give every service page an answer-first block + facts.**
   Add a 2–4 sentence "What is X?" paragraph at the top, then a short facts list (who it's for, area served, timeline, starting price), and 3–5 question headings with direct answers (e.g. "How much does local promotion cost in Purulia?"). See section 10 for a ready draft.

4. **Fix language signals.**
   Wrap Bengali text in `lang="bn"`, and use an English meta description on service pages. Today `/services/meta-ads` and three others use the Bengali card summary as the Google description. A separate "Google description" field in the Services admin form would fix this cleanly.

5. **Freshness and depth.**
   Show "Updated <date>" on service pages and add `dateModified` (the DB already has `updated_at`). Expand blog posts to 800–1,200 words with real local examples and numbers from your own clients. That kind of first-hand data is exactly what AI answers cite.

## 9. Schema recommendations

| Where | Add |
|---|---|
| `ProfessionalService` (all pages) | `sameAs` [social + GBP URL], `geo` coordinates, `openingHours`, `hasMap` |
| `Person` (about) | `sameAs` [LinkedIn etc.], `knowsAbout`, `worksFor` → business |
| `Service` (/services/{slug}) | `areaServed` as cities (Manbazar, Purulia, Bankura…) instead of only `IN`; `offers` with `priceSpecification` when you have a starting price; `audience` (LocalBusiness) |
| `WebPage` (service pages) | `dateModified` from `updated_at`, `inLanguage` |
| Case studies (/work) | Each project as `CreativeWork` with `about` + `author` |

Skip FAQPage schema on new service pages for rich results (restricted to gov/health). Keep the visible Q&A anyway.

## 10. Content rewrite suggestions

**/services/local-business-promotion: opening block (draft, ~140 words, edit in /admin → Intro paragraph)**

> **Local business promotion** is marketing that helps a shop, clinic, salon or restaurant get known by people who live and shop nearby. Sushanta Digital runs these campaigns for local businesses in Manbazar, Purulia and across West Bengal. A campaign usually combines four things: a clear offer or discount, eye-catching posters and social media creatives, collaborations with local influencers people already follow, and promotion on Facebook, Instagram, WhatsApp status and local groups. Unlike pure paid ads, the goal is lasting local visibility: more walk-ins, more enquiries on WhatsApp, and a name people recognise. Most campaigns are planned around a festival, launch or weekend offer and go live within a week. *(Add your real starting price and timeline here.)*

**Question headings to add under "More details" (each answered in 2–3 sentences):**
- How much does local business promotion cost?
- How do local influencer collaborations work?
- Which businesses get the best results from local promotion?
- How do you measure the results?

**/services/meta-ads**: the meta description is Bengali (`আপনার দোকানের আশেপাশের…`). Suggested English description:
> "Facebook and Instagram ads for local businesses in Purulia and West Bengal: targeted within 5–15 km, with creatives, tracking and weekly optimisation. Budgets from ₹200/day."

**/blog/whatsapp-vs-forms**: add a section with your own numbers (e.g. enquiries before vs after switching a client to WhatsApp), a short comparison table (Form vs WhatsApp: reply time, drop-off, follow-up), and a direct-answer first paragraph.

---

### Optional: llms.txt template (`public/llms.txt`)

```
# Sushanta Digital
> Lead generation, WhatsApp automation, local business promotion, Meta ads and fast websites for local businesses in Manbazar, Purulia, West Bengal and across India. Run by Sushanta Lohar.

## Services
- [Lead Generation](https://susanta.me/services/lead-generation): Landing pages, offers and tracked enquiries
- [WhatsApp Automation](https://susanta.me/services/whatsapp): 24/7 replies, bookings, follow-ups
- [Local Business Promotion](https://susanta.me/services/local-business-promotion): Offers, posters, local influencers, social media
- [Websites & Apps](https://susanta.me/services/web-dev): Mobile-first websites under 1.5s
- [Meta Ads](https://susanta.me/services/meta-ads): Facebook & Instagram ads within 5–15 km

## Key pages
- [Pricing](https://susanta.me/pricing): Plans from ₹6,999
- [Case studies](https://susanta.me/work)
- [FAQ](https://susanta.me/faq)
- [Contact](https://susanta.me/contact): WhatsApp +91 95477 71118
```

### Sources
- Google AI optimization guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Brand search results: [publicservicesmap.in — Susanta Digital Seva Kendra](https://www.publicservicesmap.in/csc-centers/centre/517174430014) (different business)
