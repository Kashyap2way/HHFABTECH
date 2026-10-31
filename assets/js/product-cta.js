/* Replaces the single "Request a Quote" button on product pages with two options: Inquiry on this / Get quote now! */
document.addEventListener('DOMContentLoaded', function () {
  var map = { 'petroleum-tanker': ['petroleum', 'Petroleum / Diesel Tanker'], 'chemical-tanker': ['chemical', 'Chemical Tanker'], 'fuel-bowser': ['fuel', 'Fuel Bowser'], 'ss-tanker': ['ss', 'Stainless Steel Tanker'], 'storage-tank': ['storage', 'Storage Tank'], 'water-tanker': ['water', 'Water Tanker'] };
  var page = location.pathname.split('/').pop().replace('.html', ''), p = map[page], old = document.querySelector('.cta .container a.btn'); if (!p || !old) return;
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/quote.css'; document.head.appendChild(l);
  var spec = 'Product: ' + p[1] + '\nSource: ' + p[1] + ' product page';
  var wrap = document.createElement('div'); wrap.className = 'hh-cta-pair';
  wrap.innerHTML = '<a class="hh-cta-btn hh-cta-primary" href="contact.html?' + new URLSearchParams({ spec: spec }) + '#inquiry">Inquiry on this</a><a class="hh-cta-btn hh-cta-gold" href="quote.html?product=' + p[0] + '">Get quote now!</a>';
  old.replaceWith(wrap);
});
