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

## Deployment

The contact form uses **Netlify Forms** (`data-netlify="true"`), indicating Netlify hosting. As a static site it deploys by publishing the repository root — no build command required.

After deploying, verify:
- `https://hhfabtech.com/robots.txt`, `/sitemap.xml` and `/llms.txt` return HTTP 200
- Social previews with the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [X Card Validator](https://cards-dev.twitter.com/validator)
- Structured data with [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Submit `sitemap.xml` in [Google Search Console](https://search.google.com/search-console)

## License

© HH FABTECH. All rights reserved.
