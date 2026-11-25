// One-off: applies the Next.js-style redesign to every static page.
// Run from the repo root:  node scripts/apply-redesign.mjs
// Safe to re-run: it replaces whole blocks (header, footer, hero, CTA) rather than appending.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const PEOPLE = [
  ["Devarsh Patel", "+91 98791 11233", "+919879111233"],
  ["Kashyap Mistry", "+91 99986 90388", "+919998690388"],
];
const EMAIL = "hhfabtech@gmail.com";
const WA =
  "https://wa.me/919879111233?text=Hello%20HH%20FABTECH,%20I%20would%20like%20to%20know%20more%20about%20your%20tankers.";

const PRODUCT_PAGES = {
  "petroleum-tanker.html": "Petroleum / Diesel Tanker",
  "chemical-tanker.html": "Chemical Tanker",
  "ss-tanker.html": "SS Tanker",
  "fuel-bowser.html": "Fuel Bowser",
  "storage-tank.html": "Storage Tank",
  "water-tanker.html": "Water Tanker",
};
const PAGE_LABEL = {
  "about.html": "About Us",
  "products.html": "Products",
  "calculator.html": "Tank Volume Calculator",
  "career.html": "Careers",
  "contact.html": "Contact Us",
  "quote.html": "Get a quote",
  ...PRODUCT_PAGES,
};

const navActive = (file) =>
  file === "index.html" ? "index.html"
  : file === "products.html" || file in PRODUCT_PAGES ? "products.html"
  : file;

function header(file) {
  const on = navActive(file);
  const a = (href, label, extra = "") =>
    `<li><a${on === href ? ' class="active" aria-current="page"' : ""} href="${href}">${label}${extra}</a></li>`;
  return `<div class="topbar"><div class="topbar-in">
<ul>${PEOPLE.map(([n, d, t]) => `<li><a href="tel:${t}"><span class="sr-only" style="position:absolute;left:-9999px">${n}: </span>${d}</a></li>`).join("")}<li><a href="mailto:${EMAIL}">${EMAIL}</a></li></ul>
<p>Monday - Saturday, 9:00 AM - 7:00 PM</p>
</div></div>
<header>
<nav class="navbar" aria-label="Primary">
<div class="logo"><a href="index.html" aria-label="HH FABTECH, go to home page"><img width="432" height="240" src="assets/images/logo-transparent.webp" alt="HH FABTECH"></a></div>
<ul class="nav-links" id="nav-links">
${a("index.html", "Home")}
${a("about.html", "About Us")}
${a("products.html", "Products")}
${a("calculator.html", "Calculator", '<span class="nav-new">New</span>')}
${a("contact.html", "Contact Us")}
<li><a class="nav-cta" href="quote.html">Get a quote</a></li>
</ul>
<button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">☰</button>
</nav>
</header>`;
}

const footer = `<footer>
<div class="footer-container">
<div class="footer-about">
<img width="432" height="240" src="assets/images/logo-light.webp" alt="HH FABTECH" loading="lazy">
<p>HH FABTECH is a trusted manufacturer of petroleum, chemical, SS and water tankers, fuel bowsers and storage tanks, building to order from Ahmedabad since 1967.</p>
</div>
<div class="footer-links">
<h3>Company</h3>
<ul>
<li><a href="index.html">Home</a></li>
<li><a href="about.html">About Us</a></li>
<li><a href="products.html">Products</a></li>
<li><a href="calculator.html">Tank Volume Calculator</a></li>
<li><a href="quote.html">Get a quote</a></li>
<li><a href="career.html">Careers</a></li>
<li><a href="contact.html">Contact Us</a></li>
</ul>
</div>
<div class="footer-links">
<h3>Products</h3>
<ul>
${Object.entries(PRODUCT_PAGES).map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("\n")}
</ul>
</div>
<div class="footer-contact">
<h3>Contact</h3>
<p><a href="https://maps.app.goo.gl/byFU6Hq3dxLh6ciT8" target="_blank" rel="noopener" class="footer-location">Final Plot No. 18/2 TP No. 403/A,<br>Survey No. 329B/1 Paiky 2-2387,<br>Near Sanathal Circle Road, Fatewadi Canal,<br>Sanathal, Sanand, Ahmedabad, Gujarat - 382210</a></p>
<p><a href="mailto:${EMAIL}">${EMAIL}</a></p>
${PEOPLE.map(([n, d, t]) => `<p>${n}: <a href="tel:${t}">${d}</a></p>`).join("\n")}
<p>Monday - Saturday, 9:00 AM - 7:00 PM</p>
</div>
</div>
<div class="copyright">© 2026 HH FABTECH. All Rights Reserved.</div>
</footer>`;

const heroContent = `<div class="hero-content">
<p class="hero-pill"><i aria-hidden="true"></i>Tanker manufacturer in Ahmedabad · Since 1967</p>
<h1>Petroleum, chemical &amp; water tankers <em>engineered to last</em></h1>
<p>HH FABTECH builds petroleum, diesel, chemical, stainless steel and water tankers, fuel bowsers and storage tanks to your capacity, compartment and branding needs.</p>
<div class="hero-actions">
<a class="btn btn-gold" href="quote.html">Get a quote</a>
<a class="btn btn-glass" href="products.html">Explore products</a>
<a class="btn btn-glass" href="calculator.html">Volume calculator</a>
</div>
<ul class="hero-trust"><li>Hydro &amp; leakage tested</li><li>Custom compartments</li><li>Pan-India delivery</li></ul>
</div>
</section>

<section class="facts" aria-label="Key facts"><div class="container"><dl>
<div><dt>Founded</dt><dd>1967</dd></div>
<div><dt>Product lines</dt><dd>6</dd></div>
<div><dt>Petroleum tanker range</dt><dd>12–40 KL</dd></div>
<div><dt>Supply and support</dt><dd>Pan India</dd></div>
</dl></div></section>

<section class="approved" aria-label="Approved by oil companies"><div class="container">
<p>Built to the approved specifications of</p>
<ul><li>IOCL</li><li>HPCL</li><li>Jio-bp</li><li>Nayara</li><li>Essar</li></ul></div></section>

`;

const ICONS = {
  "✔": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  "☎": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4.5" height="6" rx="1.5"/><rect x="17" y="13" width="4.5" height="6" rx="1.5"/><path d="M19.5 19c0 1.7-1.6 2.5-4 2.5"/></svg>',
  "🚚": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h11v10H2zM13 9h4l4 3.5V16h-8"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></svg>',
};

const ctaActions = (primary) => `<div class="cta-actions">
${primary}
<a class="btn btn-ghost" href="${WA}" target="_blank" rel="noopener">WhatsApp us</a>
<a class="btn btn-ghost" href="tel:${PEOPLE[0][2]}">${PEOPLE[0][1]}</a>
</div>`;

function crumbs(file) {
  const label = PAGE_LABEL[file];
  if (!label) return "";
  const mid = file in PRODUCT_PAGES ? '<li><a href="products.html">Products</a></li>' : "";
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li>${mid}<li aria-current="page">${label}</li></ol></nav>`;
}

for (const file of readdirSync(".").filter((f) => f.endsWith(".html"))) {
  let s = readFileSync(file, "utf8");
  const before = s;

  // 1. Header (adds the top contact bar) and footer
  s = s.replace(/<div class="topbar"><div class="topbar-in">[\s\S]*?<\/div><\/div>\n?/g, "");
  if (/<header[\s>]/.test(s)) s = s.replace(/<header[\s\S]*?<\/header>/, header(file));
  if (/<footer[\s>]/.test(s)) s = s.replace(/<footer[\s\S]*?<\/footer>/, footer);

  // 2. Theme stylesheet, last so it wins. Index inlines its CSS, so go after that <style>.
  if (!s.includes("assets/css/theme.css") && s.includes("<header")) {
    const link = '<link rel="stylesheet" href="assets/css/theme.css">';
    if (file === "index.html") {
      s = s.replace(/(<style>@font-face[\s\S]*?<\/style>)/, `$1\n    ${link}`);
    } else {
      const re = /<link rel="stylesheet" href="assets\/css\/[^"]+">/g;
      let last, m;
      while ((m = re.exec(s))) last = m;
      if (last) s = s.slice(0, last.index + last[0].length) + `\n    ${link}` + s.slice(last.index + last[0].length);
    }
  }

  // 3. Breadcrumb on inner-page banners
  if (s.includes('<section class="page-banner">') && !s.includes('class="crumbs"')) {
    s = s.replace('<section class="page-banner">', `<section class="page-banner">\n${crumbs(file)}`);
  }

  // 4. Home only: new hero copy, key-facts strip, approved-by logos, SVG feature icons
  if (file === "index.html" && !s.includes('class="hero-pill"')) {
    const a = s.indexOf('<div class="hero-content">');
    const b = s.indexOf("<!--==================== WELCOME");
    if (a > 0 && b > a) s = s.slice(0, a) + heroContent + s.slice(b);
    for (const [glyph, svg] of Object.entries(ICONS)) {
      s = s.replace(new RegExp(`<div class="icon">\\s*${glyph}\\s*</div>`), `<div class="icon">${svg}</div>`);
    }
    s = s.replace("<h2>Why choose HH FABTECH?</h2>", "<h2>Why choose HH FABTECH?</h2>");
  }

  // 5. Closing CTA panel: add WhatsApp + call beside the primary button
  s = s.replace(/(<section class="cta">[\s\S]*?)(<a[^>]*class="btn"[^>]*>[\s\S]*?<\/a>)([\s\S]*?<\/section>)/, (m, pre, btn, post) =>
    pre.includes("cta-actions") ? m : pre + ctaActions(btn) + post);

  if (s !== before) {
    writeFileSync(file, s);
    console.log("updated", file);
  }
}
