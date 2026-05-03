# ProductCamp Amsterdam — Static Site

The 2026 edition's website. Pure HTML / CSS / JavaScript. Zero build step. Deployable to GitHub Pages, Netlify, S3, or any static host.

## Local preview

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000
```

Or:

```bash
npx serve .
```

## Structure

```
site/
├── index.html         Home — hero, why-attend, stats, who, gallery, when/where, program, sponsors preview
├── about.html         Team — 8 organiser cards + mission
├── sponsors.html      Tier table + 2025 sponsors + CTA
├── patterns.html      Component gallery (noindexed) — colours/typography/buttons/cards/motion
├── 404.html           Branded fallback
├── robots.txt         /patterns.html disallowed
├── sitemap.xml        3 public pages
├── CNAME              productcampamsterdam.org
└── assets/
    ├── css/
    │   ├── reset.css      Modern minimal reset
    │   ├── tokens.css     Design tokens (colour, type, spacing, motion, focus)
    │   └── styles.css     Components + layout + scroll-driven animations
    ├── js/main.js         Motion One (CDN ESM) + nav + reveals + counters + parallax
    ├── img/               Self-hosted event photos (was Webflow CDN)
    └── brand/             Logos + favicon (mirror of /brand-assets at repo root)
```

## Tech notes

- **Motion**: [Motion One](https://motion.dev) loaded via jsDelivr ESM CDN inside `main.js`. 3.8 kB gzip, MIT.
- **Native CSS scroll-driven animations** progressively enhance browsers that support `animation-timeline: view()`.
- **Reduced motion**: every animation collapses to a 200 ms opacity fade when `prefers-reduced-motion: reduce` is set.
- **Fonts**: Rubik (Google Fonts) for headings; system stack for body.
- **WCAG 2.2 AAA**: every text/background pair tested. Brand red `#AA3D2F` and brand green `#8EAB30` are display-only on body text — AAA-darkened variants `#7C2A1F` (red) and `#4D6118` (green) handle anything < 24 px.

## Activating the contact form (one-time, before deploy)

The contact form (`contact.html`) posts to **Web3Forms** — a free, serverless form provider. Your email address is never in this site's HTML; submissions are forwarded by Web3Forms to whichever inbox you register the access key against.

1. Visit https://web3forms.com
2. Enter the email address you want submissions forwarded to (the inbox the organising committee monitors)
3. Copy the access key it generates (a UUID-looking string)
4. Open `site/contact.html`, find the line `value="REPLACE_WITH_WEB3FORMS_ACCESS_KEY"`, and paste your key in
5. Test the form locally — you should receive the email within seconds

If you ever want to switch providers, the same form HTML works on Formspree, Formsubmit, or Getform — just swap the `action="…"` and the access-key field.

## Editing content

- **Eventbrite link** lives in every `.html` page in five places (header CTA, hero CTA, when/where CTA, footer link, etc.). When the 2026 page goes live, find/replace the URL `https://www.eventbrite.com/e/productcamp-amsterdam-2025-tickets-1278041660009` across the site.
- **Team members** (`about.html`): each is a `<article class="card card--media">` block. Add or remove copy/paste.
- **Sponsor tiers** (`sponsors.html`): `<article class="tier">` blocks. Mark one with `tier--featured` to highlight.
- **Program** (`index.html`): `<ol class="timeline">` — edit `<li>` entries.
- **2026 placeholders**: search for the string `TBA` or `2026` to update venue, exact date, keynote.

## Deploying to GitHub Pages

1. Create a public repo at `github.com/<org>/productcampamsterdam-site`.
2. Push the contents of this `site/` directory to the `main` branch root.
3. Settings → Pages → Source: `main` branch, root `/`.
4. Settings → Pages → Custom domain: `productcampamsterdam.org` (the `CNAME` file is already in this directory).
5. At your DNS host, point `productcampamsterdam.org` to GitHub Pages: `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Add a `CNAME` record from `www` → `<org>.github.io`.
6. Enable HTTPS (GitHub Pages issues a Let's Encrypt cert automatically).

## Deploying anywhere else (S3, Netlify, Cloudflare Pages)

Upload the contents of `site/` to your static host. The `CNAME` file is GitHub-Pages-specific — delete it for other hosts.

## Verification checklist

- [ ] `python3 -m http.server` works locally and all pages render
- [ ] No 404s in DevTools Network tab on any page
- [ ] Tab through every page — focus visible at every step
- [ ] Toggle `prefers-reduced-motion: reduce` in DevTools → animations collapse
- [ ] Disable JavaScript → site still readable and navigable
- [ ] Mobile (375 px), tablet (768 px), desktop (1280 px), wide (1920 px)
- [ ] Lighthouse: Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95, SEO = 100
- [ ] axe DevTools: 0 violations
- [ ] Eventbrite link opens in new tab
- [ ] Sponsor `mailto:` opens with correct subject

## Credits & rights

© Stichting ProductCamp Amsterdam. All rights reserved.

Photos: event photography from 2024 editions, used with attendee consent for promotional purposes.
Brand and visual identity: © Stichting ProductCamp Amsterdam.

This source is published for transparency and contributor convenience. It is not licensed for reuse, redistribution, or derivative works without written permission from the organising committee.
