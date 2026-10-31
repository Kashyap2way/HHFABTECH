# HH FABTECH — Company Website

Official website for **HH FABTECH**, a manufacturer of petroleum, diesel, chemical, stainless steel and water tankers, fuel bowsers and industrial storage tanks based in Ahmedabad, Gujarat, India.

The site is a static, multi-page website built with plain HTML, CSS and vanilla JavaScript — no build step or framework required.

- **Live site:** https://hhfabtech.com/
- **Tech:** Static HTML / CSS / JavaScript
- **Fonts:** Poppins (Google Fonts) · **Icons:** Font Awesome 6 · **Math (calculator):** KaTeX

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Company overview, product highlights, CTA |
| About | `about.html` | Company history (since 1967) and values |
| Products | `products.html` | Product range index |
| Petroleum / Diesel Tanker | `petroleum-tanker.html` | Specs, configurations, approved branding |
| Chemical Tanker | `chemical-tanker.html` | Capacities and chemical applications |
| SS Tanker | `ss-tanker.html` | SS304 / SS316 food-grade tankers |
| Fuel Bowser | `fuel-bowser.html` | Mobile diesel dispensing units |
| Storage Tank | `storage-tank.html` | Vertical and capsule storage tanks |
| Water Tanker | `water-tanker.html` | Municipal / industrial water tankers |
| Tank Volume Calculator | `calculator.html` | Interactive tank capacity calculator |
| Careers | `career.html` | Open positions (loaded from `assets/data/jobs.json`) |
| Contact | `contact.html` | Inquiry form (Netlify Forms) + map |
| 404 | `404.html` | Not-found page (auto-redirects home) |

## Project structure

```
HHFABTECH/
├── index.html                 # Home + page-level HTML for each route
├── about.html
├── products.html
├── petroleum-tanker.html
├── chemical-tanker.html
├── ss-tanker.html
├── fuel-bowser.html
├── storage-tank.html
├── water-tanker.html
├── calculator.html
├── career.html
├── contact.html
├── 404.html
├── sitemap.xml                # XML sitemap (all indexable pages)
├── robots.txt                 # Crawler directives + sitemap reference
├── llms.txt                   # AI/LLM site summary (llmstxt.org format)
├── favicon.ico
└── assets/
    ├── css/                   # One shared stylesheet + per-page styles
    │   ├── style.css          # Global styles (header, footer, cards, CTA)
    │   ├── responsive.css     # Shared responsive rules
    │   └── <page>.css         # about / career / chemical / fuel / petroleum …
    ├── js/
    │   ├── main.js            # Navbar toggle, hero slider, shared behavior
    │   ├── petroleum.js       # Petroleum page branding switcher + logo carousel
    │   └── career.js          # Loads jobs.json, renders cards, injects JobPosting schema
    ├── data/
    │   └── jobs.json          # Career listings (edit here to post/close jobs)
    └── images/                # Logo, hero, product and chemical imagery
```

## Running locally

No build tooling is needed. Because `career.js` and `contact.html` use `fetch()` and forms, open the site through a local web server (not `file://`) so those features work.

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000/`.

## Editing content

- **Text / layout:** edit the relevant `*.html` file directly.
- **Styles:** global rules live in `assets/css/style.css`; page-specific rules live in the matching `assets/css/<page>.css`.
- **Job listings:** edit `assets/data/jobs.json`. Set a job's `"status"` to `"Open"` to show it or anything else to hide it. The careers page renders cards and generates `JobPosting` structured data automatically.
- **Products:** product images live in `assets/images/products/`. Prefer `.webp` for new imagery.

## SEO

SEO is configured across every page. When adding a new page, replicate this setup:

**Per-page `<head>` tags**
- Unique `<title>` and `<meta name="description">`
- `<link rel="canonical">` pointing to the absolute page URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale`)
- Twitter/X Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- `<meta name="robots">`, `<meta name="theme-color">`, `<meta name="author">`
- Favicon link

**Structured data (JSON-LD)**
- `index.html` — `LocalBusiness` (address, geo, opening hours)
- `products.html` — `ItemList` of products
- Each product page — `Product` + `BreadcrumbList`
- `career.html` — `JobPosting` per open role, injected by `career.js`

**Site-wide files**
- `sitemap.xml` — list every indexable page here (exclude `404.html`). Keep `<lastmod>` current.
- `robots.txt` — allows all crawlers, disallows `/404.html`, references the sitemap, and explicitly allows major AI crawlers.
- `llms.txt` — plain-markdown summary for LLMs ([llmstxt.org](https://llmstxt.org) format).

**Social share image (Open Graph)**
- `assets/images/og-banner.png` — 1200×630 branded banner used as the default `og:image`/`twitter:image` on the home, about, products, contact, calculator and careers pages.
- Product pages intentionally use their own product image so each shared link previews the relevant product.

**Icons & web app manifest**
- `favicon.ico` — classic browser-tab favicon (linked on every page).
- `assets/images/apple-touch-icon.png` — 180×180 icon for iOS "Add to Home Screen".
- `assets/images/icon-192.png` / `icon-512.png` — PWA icons referenced by the manifest.
- `site.webmanifest` — web app manifest (name, theme color, icons) for "Add to Home Screen" on Android/Chrome. Linked from every page's `<head>`.

**Conventions**
- Every `<img>` must have descriptive `alt` text.
- Below-the-fold images use `loading="lazy"` and `decoding="async"`.
- The canonical domain is `https://hhfabtech.com/` (use absolute URLs in canonical/OG/sitemap).
- `404.html` is marked `noindex`.

### Checklist for adding a new page

1. Add all `<head>` SEO tags listed above (copy an existing page as a template).
2. Add relevant JSON-LD if it's a product or structured-content page.
3. Add the page URL to `sitemap.xml` with a `<lastmod>`.
4. Add a link to it in `llms.txt` if it's a meaningful content page.
5. Confirm every image has `alt` text and lazy-load below-the-fold images.

## Deployment (Netlify)

The site is hosted on **Netlify** (the contact form uses Netlify Forms via `data-netlify="true"`). As a static site it deploys by publishing the repository root — no build command required. Configuration lives in `netlify.toml`.

### Forcing HTTPS (fixing http:// being indexed)

If Google indexes `http://` URLs instead of `https://`, the site is being served on both schemes without a redirect. Fix it in two places:

1. **Netlify dashboard (required):** Site settings → Domain management → HTTPS → enable **Force HTTPS**. This is what actually issues the `http → https` 301 redirect and is the critical step. On Netlify, redirect rules in `netlify.toml` only fire for `https://` requests, so the http→https hop *cannot* be done from the config file alone — the dashboard toggle is mandatory.
2. **`netlify.toml` (in this repo):** sends an `HSTS` header (`Strict-Transport-Security`) telling browsers to always use HTTPS for a year, plus a canonical-host redirect from `www` to the bare domain. Keeping it in the repo makes the behavior version-controlled.

After forcing HTTPS, in Google Search Console: use the `https://` property, submit the sitemap there, and request re-indexing of key pages. Old `http://` entries drop out once Google re-crawls and sees the 301s.

### Post-deploy verification

- `https://hhfabtech.com/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/assets/images/og-banner.png` return HTTP 200
- `http://hhfabtech.com/` 301-redirects to `https://hhfabtech.com/` (test with `curl -I http://hhfabtech.com/`)
- Response includes `strict-transport-security` header (`curl -I https://hhfabtech.com/`)
- Social previews with the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [X Card Validator](https://cards-dev.twitter.com/validator)
- Structured data with [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Submit `sitemap.xml` in [Google Search Console](https://search.google.com/search-console)

## License

© HH FABTECH. All rights reserved.
