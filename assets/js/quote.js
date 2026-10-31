/* Quote builder UI. State lives in sessionStorage (shared with calculator) so nothing is lost when jumping between pages. */
(function () {
  'use strict';
  const Q = window.HHQuote, $ = id => document.getElementById(id), fmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
  let s = Q.load(sessionStorage), cal = new Date(), navMonth = false; const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const p = new URLSearchParams(location.search); if (Q.PRODUCTS.some(x => x[0] === p.get('product'))) s.product = p.get('product');
  const density = () => s.density > 0 ? s.density : Q.CFG.density[s.product];
  const capKL = () => { const v = parseFloat(s.capacity); return v > 0 ? Q.toKL(v, s.unit, density()) : 0; };

  $('qProduct').innerHTML = Q.PRODUCTS.map(([id, n]) => `<option value="${id}">${n}</option>`).join('');
  $('qMaterial').innerHTML = Q.MATERIALS.map(([id, n]) => `<label><input type="radio" name="material" value="${id}"><span>${n}</span></label>`).join('');
  $('qAcc').innerHTML = Q.ACCESSORIES.map(([id, n]) => `<label><input type="checkbox" name="acc" value="${id}"><span>${n}</span></label>`).join('');
  const persist = () => Q.save(sessionStorage, s);

  function render() {
    $('qProduct').value = s.product; $('qCap').value = s.capacity; $('qDensity').value = s.density ?? '';
    document.querySelectorAll('[data-unit]').forEach(b => b.setAttribute('aria-pressed', b.dataset.unit === s.unit));
    $('qDensityRow').hidden = s.unit !== 'TON'; $('qDensity').placeholder = `default ${Q.CFG.density[s.product]} t/KL`;
    document.querySelectorAll('[name=material]').forEach(i => i.checked = i.value === s.material);
    document.querySelectorAll('[name=acc]').forEach(i => i.checked = s.accessories.includes(i.value));
    $('qImported').hidden = !s.fromCalculator; $('qImported').textContent = s.fromCalculator ? 'Imported from your calculator: ' + s.fromCalculator : '';
    summary();
  }
  function summary() {
    const kl = capKL(), L = kl * 1000, size = Q.sizeTank(L), bf = Q.baffles(L), name = a => Q.PRODUCTS.find(x => x[0] === a)[1];
    $('dW').textContent = size ? size.W + ' mm' : '—'; $('dH').textContent = size ? size.H + ' mm' : '—'; $('dL').textContent = size ? fmt.format(Math.round(size.L)) + ' mm' : '—';
    $('dDish').textContent = size ? `${size.dishEnds} × ${size.emboss} mm emboss` : '—'; $('dBaf').textContent = L ? `${bf.plates} plates · ${bf.sections} sections` : '—'; $('dSec').textContent = L ? `${fmt.format(Math.round(bf.eachL))} L each` : '—';
    $('qErr').textContent = kl > 0 && !size ? 'This capacity is too small for the standard cross-section. Use the calculator for a custom size.' : '';
    $('sProduct').textContent = name(s.product); $('sCap').textContent = kl ? `${fmt.format(kl)} KL` : '—';
    $('sMat').textContent = Q.MATERIALS.find(x => x[0] === s.material)[1]; $('sAcc').textContent = s.accessories.length + ' of ' + Q.ACCESSORIES.length + ' selected';
    const pr = Q.price({ capacityKL: kl, material: s.material, accessories: s.accessories }), cur = '₹ ', f = v => cur + fmt.format(Math.round(v));
    $('sSub').textContent = pr ? f(pr.subtotal) : cur + 'X'; $('sGst').textContent = pr ? f(pr.gst) : cur + 'X'; $('sTot').textContent = pr ? f(pr.total) : cur + 'X';
    $('sPriceNote').textContent = pr ? 'Indicative price. Final quote is confirmed by HH FABTECH.' : 'Rate card not loaded yet. Amounts shown as X until pricing is added.';
    const d = Q.estimateDelivery(new Date(), kl); $('sDate').textContent = d.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    $('sLead').textContent = `${d.workingDays} working days${d.peak ? ' (includes peak-season allowance)' : ''}. Estimate only.`; if (!navMonth) cal = new Date(d.date.getFullYear(), d.date.getMonth(), 1); navMonth = false; drawCal(d);
  }
  function drawCal(d) {
    const y = cal.getFullYear(), m = cal.getMonth(), first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate(), today = Q.iso(new Date());
    $('calTitle').textContent = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); let h = '<tr>' + 'SMTWTFS'.split('').map(c => `<th>${c}</th>`).join('') + '</tr><tr>' + '<td></td>'.repeat(first.getDay());
    for (let i = 1; i <= days; i++) { const dt = new Date(y, m, i), id = Q.iso(dt), c = [];
      if (id === Q.iso(d.date)) c.push('del'); else if (Q.CFG.lead.holidays.includes(id)) c.push('hol'); else if (dt.getDay() === 0) c.push('sun'); if (Q.CFG.lead.peakMonths.includes(m)) c.push('peak'); if (id === today) c.push('today');
      h += `<td class="${c.join(' ')}">${i}</td>`; if ((first.getDay() + i) % 7 === 0 && i < days) h += '</tr><tr>'; }
    $('qCal').innerHTML = h + '</tr>';
  }
  $('qProduct').addEventListener('change', e => { s.product = e.target.value; persist(); render(); });
  $('qCap').addEventListener('input', e => { s.capacity = e.target.value.replace(/[^0-9.]/g, ''); s.fromCalculator = null; persist(); summary(); });
  $('qDensity').addEventListener('input', e => { const v = parseFloat(e.target.value); s.density = v > 0 ? v : null; persist(); summary(); });
  document.querySelectorAll('[data-unit]').forEach(b => b.addEventListener('click', () => { s.unit = b.dataset.unit; persist(); render(); }));
  $('qMaterial').addEventListener('change', e => { s.material = e.target.value; persist(); summary(); });
  $('qAcc').addEventListener('change', () => { s.accessories = [...document.querySelectorAll('[name=acc]:checked')].map(i => i.value); persist(); summary(); });
  $('calPrev').addEventListener('click', () => { cal.setMonth(cal.getMonth() - 1); navMonth = true; summary(); }); $('calNext').addEventListener('click', () => { cal.setMonth(cal.getMonth() + 1); navMonth = true; summary(); });
  $('qCalc').addEventListener('click', () => { persist(); });
  $('qInquire').addEventListener('click', e => { e.preventDefault(); const kl = capKL(); if (!kl) { $('qMsg').textContent = 'Please enter the tank capacity first, or use "Calculate now".'; $('qCap').focus(); return; }
    const size = Q.sizeTank(kl * 1000), bf = Q.baffles(kl * 1000), acc = Q.ACCESSORIES.filter(a => s.accessories.includes(a[0])).map(a => a[1]);
    const spec = [`Product: ${$('sProduct').textContent}`, `Capacity: ${fmt.format(kl)} KL`, `Material: ${$('sMat').textContent}`, size ? `Size: ${size.W} mm wide × ${size.H} mm high × ${Math.round(size.L)} mm long` : '', `Baffle plates: ${bf.plates}`, `Accessories: ${acc.join(', ') || 'none'}`, `Estimated delivery: ${$('sDate').textContent} (estimate)`, 'Source: HH FABTECH quote builder'].filter(Boolean).join('\n');
    location.href = 'contact.html?' + new URLSearchParams({ cap: fmt.format(kl) + ' KL', spec }) + '#inquiry'; });
  persist(); render();
})();
