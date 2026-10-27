/* "Other shapes" module + Inquire button. Uses HHGeometry. Original Spell/Circle/Oval code is untouched. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const G = window.HHGeometry; if (!G) return;           // core calculator keeps working without this module
  const $ = id => document.getElementById(id), UNITS = ['mm', 'cm', 'm', 'in', 'ft'];
  const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
  const L = (k, n) => ({ k, n });
  const S = {
    horizontalCylinder: { name: 'Horizontal cylinder', d: 'Circular cross-section, lying on its side', f: [L('D', 'Internal diameter'), L('L', 'Internal length')],
      info: 'A round tank lying on its side. D is measured across the inside of the circle, L along the inside length. Fill depth is measured up from the bottom of the circle. Result is exact for an ideal cylinder.',
      nerd: 'V = L·[r²·arccos((r−h)/r) − (r−h)·√(2rh−h²)],  r = D/2, 0 ≤ h ≤ D.  Full: πr²L.' },
    verticalCylinder: { name: 'Vertical cylinder', d: 'Upright round tank', f: [L('D', 'Internal diameter'), L('H', 'Internal height')],
      info: 'An upright round tank. Fill depth is the liquid height from the floor. Flat floor and roof assumed.', nerd: 'V = πr²h,  r = D/2, 0 ≤ h ≤ H.' },
    rectangular: { name: 'Rectangular tank', d: 'Box-shaped tank', f: [L('L', 'Internal length'), L('W', 'Internal width'), L('H', 'Internal height')],
      info: 'A box-shaped tank. Fill depth is liquid height from the floor.', nerd: 'V = L·W·h,  0 ≤ h ≤ H.' },
    sphere: { name: 'Sphere', d: 'Full ball-shaped vessel', f: [L('D', 'Internal diameter')],
      info: 'A ball-shaped vessel. Fill depth is measured up from the lowest point. Exact for an ideal sphere.', nerd: 'V = (4/3)πr³;  partial: V = πh²(r − h/3),  r = D/2, 0 ≤ h ≤ D.' },
    ellipse: { name: 'Horizontal ellipse', d: 'True elliptical cross-section', f: [L('W', 'Cross-section width (full axis)'), L('H', 'Cross-section height (full axis)'), L('L', 'Internal length')],
      info: 'A tank whose end is a true ellipse, not a rounded rectangle. W and H are the full widths across the ellipse. Same geometry as the existing Oval option.',
      nerd: 'V = πabL, a = W/2, b = H/2.  Partial: V = L·ab·[arccos(t) − t√(1−t²)], t = (b−h)/b.' },
    stadium: { name: 'Stadium oval', d: 'Flat top/bottom, round sides', f: [L('W', 'Overall width'), L('H', 'Overall height (W ≥ H)'), L('L', 'Internal length')],
      info: 'The end view is a rectangle with half-circles on the left and right (a “stadium”). Not an ellipse. Width must be at least the height.',
      nerd: 'A = (W−H)·H + πH²/4;  partial: A(h) = (W−H)·h + circular segment(r = H/2, h);  V = A·L.' },
    capsuleHorizontal: { name: 'Capsule (horizontal)', d: 'Cylinder with hemispherical ends', f: [L('D', 'Internal diameter'), L('Lc', 'Straight section length')],
      info: 'A cylinder capped by half-spheres. Straight section length excludes the two end domes, so overall length = Lc + D.', nerd: 'V = πr²·Lc + (4/3)πr³;  partial: cylinder segment·Lc + πh²(r − h/3) (two hemispheres = one sphere).' },
    ellipsoidalHeadsHorizontal: { name: '2:1 ellipsoidal heads', d: 'Cylinder shell + 2:1 elliptical ends', f: [L('D', 'Internal diameter'), L('Ls', 'Straight shell length')],
      info: 'A horizontal shell with standard 2:1 elliptical ends (each end is D/4 deep). Straight shell length excludes the heads. Dished (torispherical) heads are not included.',
      nerd: 'V = πr²·Ls + (4/3)πr²·(D/4);  partial: cylinder segment·Ls + ½·πh²(r − h/3).' } };
  // Outline in metres: returns {w,h,path(s)} for a side/end view that shows the true liquid surface.
  const view = { horizontalCylinder: d => ({ w: d.D, h: d.D, p: s => circ(d.D * s) }), sphere: d => ({ w: d.D, h: d.D, p: s => circ(d.D * s) }),
    verticalCylinder: d => ({ w: d.D, h: d.H, p: s => `M0 0H${d.D * s}V${d.H * s}H0Z` }), rectangular: d => ({ w: d.L, h: d.H, p: s => `M0 0H${d.L * s}V${d.H * s}H0Z` }),
    ellipse: d => ({ w: d.W, h: d.H, p: s => ell(d.W * s / 2, d.H * s / 2) }),
    stadium: d => ({ w: d.W, h: d.H, p: s => { const r = d.H * s / 2, w = d.W * s; return `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w - r} ${2 * r}H${r}A${r} ${r} 0 0 1 ${r} 0Z`; } }),
    capsuleHorizontal: d => ({ w: d.Lc + d.D, h: d.D, p: s => { const r = d.D * s / 2, w = (d.Lc + d.D) * s; return `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w - r} ${2 * r}H${r}A${r} ${r} 0 0 1 ${r} 0Z`; } }),
    ellipsoidalHeadsHorizontal: d => ({ w: d.Ls + d.D / 2, h: d.D, p: s => { const rx = d.D * s / 4, ry = d.D * s / 2, w = (d.Ls + d.D / 2) * s; return `M${rx} 0H${w - rx}A${rx} ${ry} 0 0 1 ${w - rx} ${2 * ry}H${rx}A${rx} ${ry} 0 0 1 ${rx} 0Z`; } }) };
  const circ = D => ell(D / 2, D / 2), ell = (a, b) => `M0 ${b}A${a} ${b} 0 1 0 ${2 * a} ${b}A${a} ${b} 0 1 0 0 ${b}Z`;
  let cur = null, state = {};

  // ---- Build UI ----
  const grid = document.querySelector('.tc-shape-grid'), sec = grid.parentElement, work = document.querySelector('.tc-workspace');
  const advT = $('advancedToggle'), advP = $('advancedPanel');
  const tog = Object.assign(document.createElement('button'), { type: 'button', className: 'tc-btn xs-toggle', id: 'xsToggle', innerHTML: 'Other shapes <span aria-hidden="true">＋</span>' });
  tog.setAttribute('aria-expanded', 'false'); tog.setAttribute('aria-controls', 'xsPanel');
  const panel = Object.assign(document.createElement('div'), { id: 'xsPanel', className: 'xs-panel', hidden: true });
  panel.innerHTML = '<div class="xs-grid" role="group" aria-label="Other tank shapes">' + Object.keys(S).map(id =>
    `<button type="button" class="tc-shape-card" data-xs="${id}" aria-pressed="false"><div class="tc-shape-svg"><svg class="xs-ico" viewBox="0 0 100 50" aria-hidden="true"><path class="o" style="fill:none;stroke:#667085;stroke-width:2.5" d="${icon(id)}"/></svg></div><h3>${S[id].name}</h3><p>${S[id].d}</p></button>`).join('') + '</div>';
  sec.append(tog, panel);
  function icon(id) { const v = view[id]({ D: 1, L: 1, H: 1, W: 2, Lc: 1, Ls: 1 }), k = Math.min(90 / v.w, 40 / v.h); return v.p(k).replace(/^M/, 'M5 5M').replace('M5 5M', 'M'); }
  const wk = document.createElement('section'); wk.className = 'xs-work'; wk.hidden = true; wk.id = 'xsWork';
  wk.innerHTML = `<div class="xs-cols"><div><h2 id="xsTitle"></h2><div id="xsFields"></div>
    <div class="tc-field"><label for="xsFill"><span>Fill depth</span><span class="tc-field-label-meta">% of height</span></label><div class="tc-input-group single"><input id="xsFill" type="text" inputmode="decimal" value="100"></div><p class="xs-err" id="xsErr-depth" role="alert"></p></div>
    <div class="tc-field"><label for="xsVol"><span>Result unit</span></label><select id="xsVol"><option value="L">Litres</option><option value="m3">m³</option><option value="galUS">US gallons</option><option value="galImp">Imperial gallons</option></select></div></div>
    <div><svg class="xs-svg" id="xsSvg" viewBox="0 0 400 260" role="img" aria-label="Tank profile"></svg><p class="tc-visual-note">Proportional illustration of the idealised internal geometry. Not a fabrication drawing.</p>
    <div class="tc-primary-result"><strong id="xsMain">0</strong><span id="xsMainU">litres</span></div><div class="tc-metrics" id="xsMetrics"></div><p class="tc-status" id="xsStatus" aria-live="polite"></p></div></div>
    <div class="xs-det"><button type="button" aria-expanded="false" aria-controls="xsInfo">Info</button><div id="xsInfo" hidden></div></div>
    <div class="xs-det"><button type="button" aria-expanded="false" aria-controls="xsNerd">Nerd stuff</button><div id="xsNerd" hidden></div></div>`;
  work.before(wk);
  document.querySelectorAll('.xs-det>button').forEach(b => b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); $(b.getAttribute('aria-controls')).hidden = !o; }));
  tog.addEventListener('click', () => { const o = tog.getAttribute('aria-expanded') !== 'true'; tog.setAttribute('aria-expanded', o); panel.hidden = !o; tog.lastChild.textContent = o ? '－' : '＋'; });

  function show(xs) {
    wk.hidden = !xs; work.hidden = !!xs; advT.hidden = !!xs; if (xs) advP.classList.remove('open');
    document.querySelectorAll('.tc-shape-card').forEach(b => { const a = xs ? b.dataset.xs === xs : b.classList.contains('active') && !b.dataset.xs; b.classList.toggle('active', a && !!(xs ? b.dataset.xs : 1)); if (b.dataset.xs) b.setAttribute('aria-pressed', b.dataset.xs === xs); });
  }
  panel.addEventListener('click', e => { const b = e.target.closest('[data-xs]'); if (!b) return; cur = b.dataset.xs; document.querySelectorAll('.tc-shape-grid .tc-shape-card').forEach(x => x.classList.remove('active')); show(cur); build(); update(); });
  grid.addEventListener('click', e => { if (e.target.closest('.tc-shape-card')) { cur = null; show(null); document.querySelectorAll('[data-xs]').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); }); } });

  function build() {
    const s = S[cur]; $('xsTitle').textContent = s.name; $('xsInfo').textContent = s.info; $('xsNerd').textContent = s.nerd;
    $('xsFields').innerHTML = s.f.map(f => `<div class="tc-field"><label for="xs-${f.k}"><span>${f.n}</span><span class="tc-field-label-meta">${f.k}</span></label><div class="tc-input-group"><input id="xs-${f.k}" type="text" inputmode="decimal" value="${state[f.k]?.v ?? ''}" placeholder="Enter ${f.k}"><select id="xs-${f.k}-u" aria-label="${f.n} unit">${UNITS.map(u => `<option ${u === (state[f.k]?.u || 'mm') ? 'selected' : ''}>${u}</option>`).join('')}</select></div><p class="xs-err" id="xsErr-${f.k}" role="alert"></p></div>`).join('');
  }
  wk.addEventListener('input', update); wk.addEventListener('change', update);
  const parse = t => { const s = String(t).replace(/,/g, '').trim(); return s !== '' && /^[0-9]*\.?[0-9]+$/.test(s) ? Number(s) : NaN; };
  const msg = { notNumber: 'Enter a number.', mustBePositive: 'Must be greater than zero.', widthLessThanHeight: 'Width must be at least the height.', invalidDepth: 'Enter 0–100.', depthExceedsHeight: 'Enter 0–100.' };
  function read() { const s = S[cur], raw = {}; s.f.forEach(f => { const v = $('xs-' + f.k)?.value ?? '', u = $('xs-' + f.k + '-u').value; raw[f.k] = { value: parse(v), unit: u }; state[f.k] = { v, u }; });
    return { raw, d: G.normalizeDimensions(raw) }; }
  function update() {
    if (!cur) return; const { raw, d } = read(), p = parse($('xsFill').value);
    const dims = G.validateDimensions(cur, d), pctOk = p >= 0 && p <= 100;
    document.querySelectorAll('.xs-err').forEach(e => e.textContent = '');
    Object.keys(dims).forEach(k => { const e = $('xsErr-' + k); if (e) e.textContent = msg[dims[k]] || 'Invalid value.'; });
    if (!pctOk && !('depth' in dims)) $('xsErr-depth').textContent = msg.invalidDepth;
    if (Object.keys(dims).length || !pctOk) { $('xsMain').textContent = '—'; $('xsMetrics').innerHTML = ''; $('xsStatus').textContent = 'Enter valid dimensions to calculate capacity.'; draw(null); state.result = null; return; }
    const depth = G.SHAPES[cur].maxDepth(d) * p / 100, r = G.calculate(cur, d, depth), vu = $('xsVol').value;
    const f = (m3, u) => num.format(G.convertVolume(m3, 'm3', u)), name = { L: 'litres', m3: 'm³', galUS: 'US gal', galImp: 'Imp gal' };
    $('xsMain').textContent = f(r.filledM3, vu); $('xsMainU').textContent = name[vu];
    $('xsMetrics').innerHTML = ['L', 'm3', 'galUS', 'galImp'].map(u => `<div class="tc-result-item"><span>Filled (${name[u]})</span><strong>${f(r.filledM3, u)}</strong></div>`).join('') + `<div class="tc-result-item"><span>Total capacity</span><strong>${f(r.totalM3, 'L')} L</strong></div><div class="tc-result-item"><span>Fill</span><strong>${num.format(r.filledM3 / r.totalM3 * 100)}% volume</strong></div>`;
    $('xsStatus').textContent = `Total capacity ${f(r.totalM3, 'L')} L; filled ${f(r.filledM3, 'L')} L at ${num.format(p)}% depth.`;
    state.result = { raw, p, total: r.totalM3, filled: r.filledM3 }; draw(d, p / 100); }
  function draw(d, frac) {
    const svg = $('xsSvg'); if (!d) { svg.innerHTML = ''; return; }
    const v = view[cur](d), s = Math.min(300 / v.w, 190 / v.h), w = v.w * s, h = v.h * s, id = 'xsc' + cur;
    const ox = (400 - w) / 2, oy = 25, ly = h * (1 - frac), path = v.p(s);
    svg.innerHTML = `<defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs><g transform="translate(${ox} ${oy})"><path class="o" d="${path}"/><rect class="l" x="0" y="${ly}" width="${w}" height="${h - ly}" clip-path="url(#${id})"/><path class="o" style="fill:none" d="${path}"/></g>
      <text x="200" y="${oy + h + 28}" text-anchor="middle">${num.format(v.w * 1000)} mm wide</text><text x="200" y="14" text-anchor="middle">${num.format(v.h * 1000)} mm high · ${num.format(frac * 100)}% fill</text>`;
    svg.setAttribute('aria-label', `${S[cur].name} profile, ${num.format(frac * 100)} percent full`);
  }

  // ---- Inquire about this ----
  const btn = Object.assign(document.createElement('a'), { className: 'tc-btn xs-inquire', textContent: 'Inquire about this', id: 'inquireBtn', href: 'contact.html#inquiry' });
  (advP.after ? advP : sec).after(btn);
  btn.addEventListener('click', e => { const q = spec(); if (!q) return; e.preventDefault(); location.href = 'contact.html?' + new URLSearchParams({ cap: q.cap, spec: q.spec }) + '#inquiry'; });
  function spec() {
    const U = (id, uid) => `${$(id).value} ${$(uid).value}`;
    if (cur && state.result) { const s = S[cur], r = state.result, lines = [`Tank shape: ${s.name}`, ...s.f.map(f => `${f.n} (${f.k}): ${r.raw[f.k].value} ${r.raw[f.k].unit}`),
      `Calculated total capacity: ${num.format(G.convertVolume(r.total, 'm3', 'L'))} L (${num.format(r.total)} m³)`, `Fill depth: ${num.format(r.p)}% of height`, 'Source: HH FABTECH tank volume calculator (ideal internal geometry, estimate only)'];
      return { cap: `${num.format(G.convertVolume(r.total, 'm3', 'L'))} L`, spec: lines.join('\n') }; }
    if (!cur && $('capacityResult') && $('capacityResult').textContent !== '0 L') {
      const c = $('inputTitle').textContent, lines = [`Tank shape: ${c}`, `Length: ${U('length', 'lengthUnit')}`];
      if (c.startsWith('Circle')) lines.push(`Diameter: ${U('diameter', 'diameterUnit')}`); else lines.push(`Overall width: ${U('width', 'widthUnit')}`, `Overall height: ${U('height', 'heightUnit')}`);
      if (c.startsWith('Spell')) lines.push(`Rwidth: ${U('rwidth', 'rwidthUnit')}`, `Rheight: ${U('rheight', 'rheightUnit')}`, `Corner bend radius: ${$('filInput') ? $('filInput').value : 140} mm`);
      lines.push(`Embossed dish ends: ${$('embossOn').checked ? 'included, ' + U('emboss', 'embossUnit') + ' per end' : 'excluded'}`, `Calculated total capacity: ${$('capacityResult').textContent}`, `Fill: ${$('fillPercentResult').textContent}`, 'Source: HH FABTECH tank volume calculator (estimate only)');
      return { cap: $('capacityResult').textContent, spec: lines.join('\n') }; }
    return null;
  }
});
