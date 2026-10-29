/* HH FABTECH calculator — premium layer. Needs HHGeometry (geometry.js). */
const WIRE = (function () {
  const r1 = n => Math.round(n * 10) / 10;
  const V = [34, -16];                                   // oblique extrusion vector (depth direction)
  const ell = (cx, cy, rx, ry) => `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;
  const half = (cx, cy, rx, ry, front) => `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 0 ${front ? 0 : 1} ${r1(cx + rx)} ${r1(cy)}`;   // front = lower half
  const ln = (x1, y1, x2, y2) => `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`;
  const el = (cls, d) => `<path class="${cls}" pathLength="1" d="${d}"/>`;
  const wrap = body => `<svg class="w-ico" viewBox="0 0 180 100" aria-hidden="true" focusable="false">${body}</svg>`;
  const shift = (d, dx, dy) => `<g transform="translate(${r1(dx)} ${r1(dy)})">${d}</g>`;
  /* tangent points of an ellipse (rx,ry) whose tangent is parallel to V */
  const tang = (cx, cy, rx, ry) => { const t = Math.atan2(-(ry * V[0]), rx * V[1]); return [[cx + rx * Math.cos(t), cy + ry * Math.sin(t)], [cx - rx * Math.cos(t), cy - ry * Math.sin(t)]]; };
  /* generic oblique extrusion of a front outline: back copy, 2 mid slices, silhouette edges */
  function extrude(frontD, edges, meshEdges, fillD) {
    let s = '';
    s += `<g class="w-bk">${shift(el('w-b', frontD), V[0], V[1])}</g>`;
    s += `<g>${shift(el('w-m', frontD), V[0] * 2 / 3, V[1] * 2 / 3)}${shift(el('w-m', frontD), V[0] / 3, V[1] / 3)}</g>`;
    edges.forEach(([x, y]) => { s += el('w-e', ln(x, y, x + V[0], y + V[1])); });
    meshEdges.forEach(([x, y]) => { s += el('w-m', ln(x, y, x + V[0], y + V[1])); });
    s += `<path class="w-fill" d="${fillD || frontD}"/>` + el('w-f', frontD);
    return s;
  }
  const C = { fx: 73, fy: 58 };                           // front-face centre for extruded icons
  const icons = {
    circle() { const r = 23, d = ell(C.fx, C.fy, r, r), t = tang(C.fx, C.fy, r, r);
      return wrap(extrude(d, t, [], d) + el('w-m', ln(C.fx - r, C.fy, C.fx + r, C.fy)) + el('w-m', ln(C.fx, C.fy - r, C.fx, C.fy + r))); },
    oval() { const rx = 31, ry = 20, d = ell(C.fx, C.fy, rx, ry), t = tang(C.fx, C.fy, rx, ry);
      return wrap(extrude(d, t, [], d) + el('w-m', ln(C.fx - rx, C.fy, C.fx + rx, C.fy)) + el('w-m', ln(C.fx, C.fy - ry, C.fx, C.fy + ry))); },
    stadium() { const w = 31, h = 17, a = w - h, cx = C.fx, cy = C.fy;
      const d = `M${cx - a} ${cy - h}H${cx + a}A${h} ${h} 0 0 1 ${cx + a} ${cy + h}H${cx - a}A${h} ${h} 0 0 1 ${cx - a} ${cy - h}Z`;
      const tl = tang(cx - a, cy, h, h)[0], br = tang(cx + a, cy, h, h)[1];
      return wrap(extrude(d, [tl, br], [[cx - a, cy - h], [cx + a, cy - h], [cx + a, cy + h]], d) + el('w-m', ln(cx - w, cy, cx + w, cy))); },
    /* dd = outline path "d" of the Spell profile, bb = its bounding box. slot = optional markup placed inside the profile's own coordinate system. */
    spell(dd, bb, slot, sil) {
      const k = Math.min(70 / bb.width, 52 / bb.height), cx0 = bb.x + bb.width / 2, cy0 = bb.y + bb.height / 2,
        tx = C.fx - k * cx0, ty = C.fy - k * cy0, hw = bb.width * k / 2, hh = bb.height * k / 2, ix = hw * .88, iy = hh * .88;
      const T = `translate(${r1(tx)} ${r1(ty)}) scale(${Math.round(k * 1000) / 1000})`;
      const ghost = c => `<g transform="${T}"><path class="${c}" pathLength="1" vector-effect="non-scaling-stroke" d="${dd}"/></g>`;
      let s = `<g class="w-bk">${shift(ghost('w-b'), V[0], V[1])}</g><g>${shift(ghost('w-m'), V[0] * 2 / 3, V[1] * 2 / 3)}${shift(ghost('w-m'), V[0] / 3, V[1] / 3)}</g>`;
      const at = p => [tx + k * p[0], ty + k * p[1]];                       // outline point -> icon coordinates
      const sp = sil ? { e: sil.e.map(at), m: sil.m.map(at) } : { e: [[C.fx - ix, C.fy - iy], [C.fx + ix, C.fy + iy]], m: [[C.fx + ix, C.fy - iy], [C.fx - ix, C.fy + iy]] };
      sp.e.forEach(p => s += el('w-e', ln(p[0], p[1], p[0] + V[0], p[1] + V[1])));
      sp.m.forEach(p => s += el('w-m', ln(p[0], p[1], p[0] + V[0], p[1] + V[1])));
      s += `<g transform="${T}"><path class="w-fill" d="${dd}"/>${slot == null ? `<path class="w-f" vector-effect="non-scaling-stroke" d="${dd}"/>` : '<g data-slot></g>'}</g>`;
      return wrap(s);
    },
    horizontalCylinder() { const x1 = 46, x2 = 134, cy = 50, rx = 8, ry = 25; let s = '';
      s += el('w-b', half(x2, cy, rx, ry, false)) + el('w-b', ln(x1, cy - ry, x2, cy - ry)) + '';
      [x1 + 22, x1 + 44, x1 + 66].forEach(x => s += el('w-m', ell(x, cy, rx, ry)));
      [-.62, 0, .62].forEach(u => s += el('w-m', ln(x1, cy + ry * u, x2, cy + ry * u)));
      s += el('w-e', ln(x1, cy - ry, x2, cy - ry)) + el('w-e', ln(x1, cy + ry, x2, cy + ry)) + el('w-e', ell(x2, cy, rx, ry));
      s += `<path class="w-fill" d="${ell(x1, cy, rx, ry)}"/>` + el('w-f', ell(x1, cy, rx, ry)); return wrap(s); },
    verticalCylinder() { const cx = 90, rx = 27, ry = 9, yt = 22, yb = 76; let s = '';
      s += el('w-b', half(cx, yb, rx, ry, false));
      [38, 50, 62].forEach(y => { s += el('w-b', half(cx, y, rx, ry, false)) + el('w-m', half(cx, y, rx, ry, true)); });
      [.28, .5, .72].forEach(u => { const t = Math.PI * u, x = cx + rx * Math.cos(t); s += el('w-m', ln(x, yt + ry * Math.sin(t), x, yb + ry * Math.sin(t))); });
      s += el('w-e', ln(cx - rx, yt, cx - rx, yb)) + el('w-e', ln(cx + rx, yt, cx + rx, yb)) + el('w-e', half(cx, yb, rx, ry, true));
      s += `<path class="w-fill" d="${ell(cx, yt, rx, ry)}"/>` + el('w-f', ell(cx, yt, rx, ry)); return wrap(s); },
    rectangular() { const fx = 44, fy = 44, w = 62, h = 34, dx = 32, dy = -20; let s = '';
      const rect = (x, y) => `M${x} ${y}h${w}v${h}h${-w}Z`, sh = (c, d, k) => `<g transform="translate(${dx * k} ${dy * k})">${el(c, d)}</g>`;
      s += `<g class="w-bk">${sh('w-b', rect(fx, fy), 1)}</g>` + sh('w-m', rect(fx, fy), 2 / 3) + sh('w-m', rect(fx, fy), 1 / 3);
      [[fx, fy], [fx + w, fy], [fx + w, fy + h], [fx, fy + h]].forEach((p, i) => s += el(i === 3 ? 'w-m' : 'w-e', ln(p[0], p[1], p[0] + dx, p[1] + dy)));
      [1 / 3, 2 / 3].forEach(u => { s += el('w-m', ln(fx + w * u, fy, fx + w * u, fy + h)) + el('w-m', ln(fx, fy + h * u, fx + w, fy + h * u)); });
      s += `<path class="w-fill" d="${rect(fx, fy)}"/>` + el('w-f', rect(fx, fy)); return wrap(s); },
    sphere() { const cx = 90, cy = 50, r = 31; let s = '';
      s += el('w-b', half(cx, cy, r, 10, false));
      [-17, 17].forEach(dy => { const rr = Math.sqrt(r * r - dy * dy); s += el('w-b', half(cx, cy + dy, rr, rr * 10 / r, false)) + el('w-m', half(cx, cy + dy, rr, rr * 10 / r, true)); });
      [11, 22].forEach(rx => s += el('w-m', ell(cx, cy, rx, r)));
      s += el('w-m', half(cx, cy, r, 10, true)) + `<path class="w-fill" d="${ell(cx, cy, r, r)}"/>` + el('w-f', ell(cx, cy, r, r)); return wrap(s); },
    capsuleHorizontal() { const x1 = 56, x2 = 124, cy = 50, r = 23; let s = '';
      const d = `M${x1} ${cy - r}H${x2}A${r} ${r} 0 0 1 ${x2} ${cy + r}H${x1}A${r} ${r} 0 0 1 ${x1} ${cy - r}Z`;
      [x1, x1 + 17, x1 + 34, x1 + 51, x2].forEach(x => s += el('w-m', ell(x, cy, 6.5, r)));
      [11, 19].forEach(o => { const rr = Math.sqrt(r * r - o * o); s += el('w-m', ell(x1 - o, cy, 3 * rr / r, rr)) + el('w-m', ell(x2 + o, cy, 3 * rr / r, rr)); });
      [-.66, 0, .66].forEach(u => s += el('w-m', ln(x1, cy + r * u, x2, cy + r * u)));
      s += `<path class="w-fill" d="${d}"/>` + el('w-f', d); return wrap(s); },
    ellipsoidalHeadsHorizontal() { const x1 = 50, x2 = 130, cy = 50, r = 23, hd = 12; let s = '';
      const d = `M${x1} ${cy - r}H${x2}A${hd} ${r} 0 0 1 ${x2} ${cy + r}H${x1}A${hd} ${r} 0 0 1 ${x1} ${cy - r}Z`;
      [x1, x1 + 20, x1 + 40, x1 + 60, x2].forEach(x => s += el('w-m', ell(x, cy, 6.5, r)));
      [5, 9.5].forEach(o => { const rr = r * Math.sqrt(1 - (o / hd) ** 2); s += el('w-m', ell(x1 - o, cy, 3 * rr / r, rr)) + el('w-m', ell(x2 + o, cy, 3 * rr / r, rr)); });
      [-.66, 0, .66].forEach(u => s += el('w-m', ln(x1, cy + r * u, x2, cy + r * u)));
      s += `<path class="w-fill" d="${d}"/>` + el('w-f', d); return wrap(s); }
  };
  icons.ellipse = icons.oval;
  return { icons, V };
})();


/* ===================================================================================================
   HH FABTECH calculator — premium layer
   1. 3D wire-mesh icons            2. "More tank shapes" launcher + glass sheet
   3. Live preview + inputs for the other shapes (uses HHGeometry)
   4. "Understand the result" (how it works + formulas) for every shape, including Spell / Circle / Oval
   5. Inquire button with validation
   The original Spell / Circle / Oval calculator code is untouched.
   =================================================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const G = window.HHGeometry;
  const shell = document.querySelector('.tc-shell'), grid = document.querySelector('.tc-shape-grid'), work = document.querySelector('.tc-workspace');
  if (!G || !shell || !grid || !work) return;                       // the core calculator keeps working without this module
  const $ = id => document.getElementById(id), sec = grid.parentElement, advT = $('advancedToggle');
  const fmt = (v, d = 1) => Number.isFinite(v) ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v) : '—';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UNITS = ['mm', 'cm', 'm', 'in', 'ft'], NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHECK = '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"/></svg>';
  const CHEV = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const GO = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SEND = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 3L3 10.5l6.5 2.5L12 20l2.6-5.6L21 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 13l11.5-10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  /* ---------- shape content ---------- */
  const F = (k, n) => ({ k, n });
  const D_ = (b, t, h) => ({ b, t, h });
  const S = {
    horizontalCylinder: { name: 'Horizontal cylinder', tag: 'Round tank lying on its side', f: [F('D', 'Internal diameter'), F('L', 'Internal length')],
      measure: [D_('D', 'Internal diameter', 'Across the inside of the round end, wall to wall.'), D_('L', 'Internal length', 'Along the inside of the tank, between the two flat ends.')],
      how: ['The end of the tank is a circle. At your fill depth the liquid covers a slice of that circle, called a circular segment. Multiply the segment’s area by the tank length and you have the volume of liquid.', 'At exactly half depth the tank is exactly half full. Above or below that, the volume changes fastest near the middle and slowest near the top and bottom.'],
      notes: ['Fill depth is measured up from the lowest point inside the tank.', 'Flat ends are assumed. For domed or dished ends, use Capsule or 2:1 heads.', 'Use internal dimensions: shell thickness is not added.'] },
    verticalCylinder: { name: 'Vertical cylinder', tag: 'Upright round tank', f: [F('D', 'Internal diameter'), F('H', 'Internal height')],
      measure: [D_('D', 'Internal diameter', 'Across the inside of the tank, wall to wall.'), D_('H', 'Internal height', 'From the inside floor to the inside roof.')],
      how: ['A standing tank fills like a stack: the liquid is a shorter cylinder with the same diameter, as tall as your fill depth.', 'Volume of liquid = base area × fill depth, so every extra centimetre of depth adds the same amount.'],
      notes: ['Fill depth is the liquid height measured from the floor.', 'A flat floor and flat roof are assumed.', 'Use internal dimensions: shell thickness is not added.'] },
    rectangular: { name: 'Rectangular tank', tag: 'Box-shaped tank', f: [F('L', 'Internal length'), F('W', 'Internal width'), F('H', 'Internal height')],
      measure: [D_('L', 'Internal length', 'The longer side of the floor, measured inside.'), D_('W', 'Internal width', 'The shorter side of the floor, measured inside.'), D_('H', 'Internal height', 'From the inside floor to the inside roof.')],
      how: ['A box tank is the simplest case: volume = length × width × height.', 'The liquid is a shallower box with the same floor, so liquid volume = length × width × fill depth.'],
      notes: ['Fill depth is the liquid height measured from the floor.', 'Square corners are assumed; internal braces and fittings are ignored.'] },
    sphere: { name: 'Sphere', tag: 'Ball-shaped vessel', f: [F('D', 'Internal diameter')],
      measure: [D_('D', 'Internal diameter', 'Across the widest part of the inside of the ball.')],
      how: ['The liquid in a sphere forms a spherical cap: a dome of liquid whose size depends on the fill depth and the radius.', 'The full sphere holds (4/3)πr³. At half depth it holds exactly half of that.'],
      notes: ['Fill depth is measured up from the lowest point.', 'A perfect sphere is assumed; the result is exact for that ideal shape.'] },
    ellipse: { name: 'Horizontal ellipse', tag: 'True elliptical cross-section', f: [F('W', 'Cross-section width (full axis)'), F('H', 'Cross-section height (full axis)'), F('L', 'Internal length')],
      measure: [D_('W', 'Width', 'The full horizontal width of the elliptical end, inside.'), D_('H', 'Height', 'The full vertical height of the elliptical end, inside.'), D_('L', 'Internal length', 'Along the inside of the tank.')],
      how: ['The end of the tank is a true ellipse, not a rounded rectangle. At your fill depth the liquid covers an elliptical segment; multiply that area by the length.', 'This is the same geometry as the Oval Cylinder option above.'],
      notes: ['Fill depth is measured up from the lowest point inside the tank.', 'W and H are full widths across the ellipse, not half-axes.'] },
    stadium: { name: 'Stadium oval', tag: 'Flat top and bottom, round sides', f: [F('W', 'Overall width'), F('H', 'Overall height (W ≥ H)'), F('L', 'Internal length')],
      measure: [D_('W', 'Overall width', 'Edge to edge across the end, inside. Must be at least the height.'), D_('H', 'Overall height', 'Floor to roof of the end, inside.'), D_('L', 'Internal length', 'Along the inside of the tank.')],
      how: ['The end looks like a running track: a rectangle in the middle with a half-circle on each side. It is not an ellipse.', 'We treat it as a circle of diameter H split in two, with a rectangle of width W − H between the halves, then multiply by the length.'],
      notes: ['Width must be at least the height; otherwise the profile is not a stadium.', 'Fill depth is measured up from the flat bottom.'] },
    capsuleHorizontal: { name: 'Capsule (horizontal)', tag: 'Cylinder with half-sphere ends', f: [F('D', 'Internal diameter'), F('Lc', 'Straight section length')],
      measure: [D_('D', 'Internal diameter', 'Across the inside of the tube and of the round ends.'), D_('Lc', 'Straight section length', 'Only the straight middle part. The two domes are extra.')],
      how: ['We treat the two domed ends together as one sphere, and the middle as a cylinder.', 'Liquid in the cylinder part is a circular segment times the straight length. Liquid in the domes is one spherical cap. Add the two for the total.'],
      notes: ['Overall length = Lc + D, because each dome adds half a diameter.', 'Fill depth is measured up from the lowest point inside.'] },
    ellipsoidalHeadsHorizontal: { name: '2:1 ellipsoidal heads', tag: 'Cylinder with 2:1 elliptical ends', f: [F('D', 'Internal diameter'), F('Ls', 'Straight shell length')],
      measure: [D_('D', 'Internal diameter', 'Across the inside of the shell.'), D_('Ls', 'Straight shell length', 'Only the straight shell. The two heads are extra.')],
      how: ['A standard 2:1 head is half an ellipsoid whose depth is a quarter of the diameter. Both heads together equal half of a sphere of the same diameter.', 'Liquid in the shell is a circular segment times the shell length. Liquid in the heads is half of a spherical cap. Add the two.'],
      notes: ['Overall length = Ls + D/2, since each head is D/4 deep.', 'Dished (torispherical) heads are not included.'] } };
  const M = {
    spell: { name: 'Spell cylinder', tag: 'The HH FABTECH truck profile',
      measure: [D_('L', 'Straight shell length', 'Along the tank, not counting the embossed dish ends.'), D_('W', 'Overall width', 'The widest point of the profile.'), D_('H', 'Overall height', 'Floor to roof of the profile.'), D_('Rw', 'Rwidth and Rheight', 'The central rectangle. They scale automatically; edit them in Advanced.')],
      how: ['The Spell profile is a truck-optimised cross-section: a central rectangle blended into the overall width and height by four circular arcs, then rounded at the corners (140 mm by default).', 'We find the area of that profile, multiply by the straight length, and add an allowance for the embossed dish ends.'],
      notes: ['Each embossed end adds about two-thirds of A × E. Untick the dish-end option to leave it out.', 'Fill percentages are by volume, so 95% means 95% of the tank’s capacity, not 95% of its height.', 'Estimate only: shell thickness, fittings and tolerances are not included.'] },
    circle: { name: 'Circle cylinder', tag: 'Standard round tank',
      measure: [D_('D', 'Diameter', 'Across the circle, measured inside.'), D_('L', 'Straight shell length', 'Along the tank, not counting the dish ends.')],
      how: ['The profile is a circle, so the area is πD²/4. Multiply by the length for the volume.', 'For a part-filled tank the liquid covers a circular segment, and we multiply that area by the length instead.'],
      notes: ['Each embossed end adds about two-thirds of A × E. Untick the dish-end option to leave it out.', 'Fill percentages are by volume, not by height.'] },
    oval: { name: 'Oval cylinder', tag: 'Elliptical cross-section',
      measure: [D_('W', 'Overall width', 'The full width across the ellipse.'), D_('H', 'Overall height', 'The full height across the ellipse.'), D_('L', 'Straight shell length', 'Along the tank, not counting the dish ends.')],
      how: ['The profile is a true ellipse, so the area is πWH/4. Multiply by the length for the volume.', 'For a part-filled tank the liquid covers an elliptical segment, and we multiply that area by the length.'],
      notes: ['Each embossed end adds about two-thirds of A × E. Untick the dish-end option to leave it out.', 'Fill percentages are by volume, not by height.'] } };
  const XS_IDS = Object.keys(S);

  /* ---------- 1. wire icons ---------- */
  let spellD = null, spellBB = null;
  const spellPath = $('spellIconPath'), spellRect = $('spellIconRect');
  let spellSil = null;
  if (spellPath && spellPath.getAttribute('d')) {
    spellD = spellPath.getAttribute('d');
    try {
      spellBB = spellPath.getBBox();
      const len = spellPath.getTotalLength(), pts = []; for (let i = 0; i < 360; i++) pts.push(spellPath.getPointAtLength(len * i / 360));
      const far = (nx, ny) => { let hi = pts[0], lo = pts[0]; pts.forEach(p => { if (p.x * nx + p.y * ny > hi.x * nx + hi.y * ny) hi = p; if (p.x * nx + p.y * ny < lo.x * nx + lo.y * ny) lo = p; }); return [[hi.x, hi.y], [lo.x, lo.y]]; };
      const V = WIRE.V; spellSil = { e: far(-V[1], V[0]), m: far(V[0], V[1]) };    // silhouette edges (solid) and the other two corners (mesh)
    } catch (e) { spellBB = null; }
  }
  const icon = id => id === 'spell' ? (spellD && spellBB ? WIRE.icons.spell(spellD, spellBB, undefined, spellSil) : WIRE.icons.oval()) : (WIRE.icons[id] || WIRE.icons.circle)();
  (function upgradeMainIcons() {
    grid.querySelectorAll('.tc-shape-card[data-shape]').forEach(card => {
      const holder = card.querySelector('.tc-shape-svg'), id = card.dataset.shape; if (!holder) return;
      if (id === 'spell') {
        if (!spellD || !spellBB) return;                                   // leave the original icon alone if anything is missing
        holder.innerHTML = WIRE.icons.spell(spellD, spellBB, '', spellSil);
        const slot = holder.querySelector('[data-slot]');
        [[spellPath, 'w-f'], [spellRect, 'w-m']].forEach(([n, c]) => { if (!n) return; ['stroke', 'stroke-width', 'fill'].forEach(a => n.removeAttribute(a)); n.setAttribute('class', c); n.setAttribute('vector-effect', 'non-scaling-stroke'); slot.appendChild(n); });
      } else holder.innerHTML = WIRE.icons[id] ? WIRE.icons[id]() : holder.innerHTML;
    });
  })();

  /* ---------- 2. launcher + glass sheet ---------- */
  const launch = Object.assign(document.createElement('button'), { type: 'button', className: 'xs-launch', id: 'xsToggle' });
  launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'xsPanel');
  launch.innerHTML = `<span class="xs-orb" id="xsOrb">${WIRE.icons.sphere()}</span><span class="xs-launch-text"><strong id="xsLaunchTitle">More tank shapes</strong><small id="xsLaunchSub">Capsule, sphere, stadium oval, 2:1 heads and more</small></span><span class="xs-launch-count">${XS_IDS.length}</span><span class="xs-launch-chev">${CHEV}</span>`;
  const wrap = Object.assign(document.createElement('div'), { id: 'xsPanel', className: 'xs-sheet-wrap' });
  wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'More tank shapes'); wrap.inert = true;
  wrap.innerHTML = `<div class="xs-sheet-clip"><div class="xs-sheet"><div class="xs-grid">${XS_IDS.map((id, i) =>
    `<button type="button" class="xs-card" data-xs="${id}" aria-pressed="false" style="--i:${i}"><span class="xs-tick">${CHECK}</span><span class="xs-ico">${WIRE.icons[id]()}</span><h3>${esc(S[id].name)}</h3><p>${esc(S[id].tag)}</p></button>`).join('')}</div></div></div>`;
  sec.append(launch, wrap);
  const setSheet = open => { wrap.classList.toggle('is-open', open); launch.setAttribute('aria-expanded', String(open)); wrap.inert = !open; };
  launch.addEventListener('click', () => setSheet(!wrap.classList.contains('is-open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && wrap.classList.contains('is-open')) { setSheet(false); launch.focus(); } });

  /* ---------- 3. workspace for the other shapes ---------- */
  const wk = document.createElement('section'); wk.className = 'tc-workspace xs-work'; wk.id = 'xsWork';
  wk.innerHTML = `
    <div class="tc-visual-panel">
      <div class="tc-visual-top"><div><p class="tc-visual-title">2D Profile Preview</p><p class="tc-visual-subtitle">Live geometry based on your dimensions</p></div><div class="tc-profile-badge" id="xsBadge"></div></div>
      <div class="tc-canvas"><svg id="xsSvg" viewBox="0 0 700 470" role="img" aria-label="Tank profile visualization">
        <defs><linearGradient id="xsMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eef1f4"/><stop offset="38%" stop-color="#cbd1d7"/><stop offset="55%" stop-color="#f7f8f9"/><stop offset="100%" stop-color="#aeb6bf"/></linearGradient>
        <linearGradient id="xsWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5caee0"/><stop offset="100%" stop-color="#17649b"/></linearGradient>
        <clipPath id="xsClip"><path id="xsClipPath" d=""/></clipPath></defs><g id="xsGraphic"></g><g id="xsDims"></g></svg></div>
      <p class="tc-visual-note" id="xsHint"></p>
    </div>
    <div class="tc-input-panel">
      <p class="tc-section-kicker">02 / Enter Dimensions</p>
      <h2 class="tc-input-title" id="xsTitle"></h2>
      <p class="tc-input-description" id="xsDesc"></p>
      <div id="xsFields"></div>
      <div class="tc-fill-card">
        <div class="tc-fill-head"><div><p class="tc-fill-kicker">03 / Fill Calculation</p><h3>Calculate filled volume</h3></div>
          <div class="tc-fill-switch" role="group" aria-label="Fill input mode"><button type="button" class="tc-fill-mode active" data-xsmode="depth">Fill Depth</button><button type="button" class="tc-fill-mode" data-xsmode="volume">Known Volume</button></div></div>
        <div id="xsDepthPanel"><div class="tc-field"><label for="xsFill"><span>Fill depth</span><span class="tc-field-label-meta" id="xsFillMeta">95% default</span></label>
          <div class="tc-input-group"><input id="xsFill" type="text" inputmode="decimal" value="95"><select id="xsFillUnit" aria-label="Fill depth unit"><option value="%" selected>%</option>${UNITS.map(u => `<option>${u}</option>`).join('')}</select></div>
          <input id="xsRange" class="xs-range" type="range" min="0" max="100" step="1" value="95" aria-label="Fill level in percent of capacity">
          <p class="xs-err" id="xsErr-depth" role="alert"></p><p class="tc-note" id="xsFillNote"></p></div></div>
        <div id="xsVolPanel" class="tc-hidden"><div class="tc-field"><label for="xsVol"><span>Target fill volume</span><span class="tc-field-label-meta">Vf</span></label>
          <div class="tc-input-group"><input id="xsVol" type="text" inputmode="decimal" placeholder="Enter volume"><select id="xsVolUnit" aria-label="Volume unit"><option value="L">L</option><option value="m3">m³</option><option value="galUS">US gal</option><option value="galImp">Imp gal</option></select></div>
          <p class="xs-err" id="xsErr-vol" role="alert"></p><p class="tc-note" id="xsVolNote"></p></div></div>
      </div>
      <div class="tc-results" aria-live="polite">
        <div class="tc-result-label">Calculated Filled Volume</div>
        <div class="tc-primary-result"><strong id="xsLitres">0</strong><span>litres</span></div>
        <div class="tc-result-grid">
          <div class="tc-result-item"><span>Capacity</span><strong id="xsCap">0 L</strong></div><div class="tc-result-item"><span>KL / m³</span><strong id="xsKL">0.000</strong></div><div class="tc-result-item"><span>Cubic feet</span><strong id="xsFt3">0.0</strong></div>
          <div class="tc-result-item"><span>US gallons</span><strong id="xsGal">0</strong></div><div class="tc-result-item"><span>Fill level</span><strong id="xsPct">0%</strong></div><div class="tc-result-item"><span>Fill depth</span><strong id="xsDepth">0 mm</strong></div>
        </div>
        <p class="tc-status" id="xsStatus">Enter valid dimensions to calculate capacity.</p>
      </div>
      <div class="tc-info"><strong>Calculation note:</strong> Results are geometric volumes of the ideal internal shape. Shell thickness, fittings, ullage and manufacturing tolerances are not included. Open <strong>How the result is worked out</strong> below for the formulas.</div>
    </div>`;
  work.before(wk);

  const PROF = (() => {
    const circ = (cx, cy, r) => `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
    const ell = (cx, cy, rx, ry) => `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
    const rect = (cx, cy, w, h) => `M ${cx - w / 2} ${cy - h / 2} H ${cx + w / 2} V ${cy + h / 2} H ${cx - w / 2} Z`;
    const pill = (cx, cy, w, h, rx) => { const l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2, ry = h / 2; return `M ${l + rx} ${t} H ${r - rx} A ${rx} ${ry} 0 0 1 ${r - rx} ${b} H ${l + rx} A ${rx} ${ry} 0 0 1 ${l + rx} ${t} Z`; };
    const L = (v, key) => `${key} ${fmt(v, 0)} mm`;
    return {
      horizontalCylinder: { ref: { D: 1000, L: 2000 }, size: d => [d.D, d.D], path: (s, cx, cy, d) => circ(cx, cy, d.D * s / 2),
        lab: (d, g) => ({ w: g ? 'D' : L(d.D, 'D'), h: g ? 'D' : L(d.D, 'D'), foot: g ? 'L  •  Tank length' : `${L(d.L, 'L')}  •  Tank length` }) },
      verticalCylinder: { ref: { D: 1000, H: 1800 }, size: d => [d.D, d.H], path: (s, cx, cy, d) => rect(cx, cy, d.D * s, d.H * s),
        lab: (d, g) => ({ w: g ? 'D' : L(d.D, 'D'), h: g ? 'H' : L(d.H, 'H'), foot: 'Vertical tank  •  Side view' }) },
      rectangular: { ref: { L: 2000, W: 1000, H: 1000 }, size: d => [d.L, d.H], path: (s, cx, cy, d) => rect(cx, cy, d.L * s, d.H * s),
        lab: (d, g) => ({ w: g ? 'L' : L(d.L, 'L'), h: g ? 'H' : L(d.H, 'H'), foot: g ? 'W  •  Tank width' : `${L(d.W, 'W')}  •  Tank width` }) },
      sphere: { ref: { D: 1000 }, size: d => [d.D, d.D], path: (s, cx, cy, d) => circ(cx, cy, d.D * s / 2),
        lab: (d, g) => ({ w: g ? 'D' : L(d.D, 'D'), h: g ? 'D' : L(d.D, 'D'), foot: 'Sphere' }) },
      ellipse: { ref: { W: 2400, H: 1600, L: 3000 }, size: d => [d.W, d.H], path: (s, cx, cy, d) => ell(cx, cy, d.W * s / 2, d.H * s / 2),
        lab: (d, g) => ({ w: g ? 'W' : L(d.W, 'W'), h: g ? 'H' : L(d.H, 'H'), foot: g ? 'L  •  Tank length' : `${L(d.L, 'L')}  •  Tank length` }) },
      stadium: { ref: { W: 2400, H: 1600, L: 3000 }, size: d => [d.W, d.H], path: (s, cx, cy, d) => pill(cx, cy, d.W * s, d.H * s, d.H * s / 2),
        lab: (d, g) => ({ w: g ? 'W' : L(d.W, 'W'), h: g ? 'H' : L(d.H, 'H'), foot: g ? 'L  •  Tank length' : `${L(d.L, 'L')}  •  Tank length` }) },
      capsuleHorizontal: { ref: { D: 1000, Lc: 2000 }, size: d => [d.Lc + d.D, d.D], path: (s, cx, cy, d) => pill(cx, cy, (d.Lc + d.D) * s, d.D * s, d.D * s / 2),
        seams: (s, cx, d) => [cx - d.Lc * s / 2, cx + d.Lc * s / 2],
        lab: (d, g) => ({ w: g ? 'Lc + D  •  Overall length' : `${fmt(d.Lc + d.D, 0)} mm overall`, h: g ? 'D' : L(d.D, 'D'), foot: g ? 'Lc  •  Straight section' : `${L(d.Lc, 'Lc')}  •  Straight section` }) },
      ellipsoidalHeadsHorizontal: { ref: { D: 1000, Ls: 2000 }, size: d => [d.Ls + d.D / 2, d.D], path: (s, cx, cy, d) => pill(cx, cy, (d.Ls + d.D / 2) * s, d.D * s, d.D * s / 4),
        seams: (s, cx, d) => [cx - d.Ls * s / 2, cx + d.Ls * s / 2],
        lab: (d, g) => ({ w: g ? 'Ls + D/2  •  Overall length' : `${fmt(d.Ls + d.D / 2, 0)} mm overall`, h: g ? 'D' : L(d.D, 'D'), foot: g ? 'Ls  •  Straight shell' : `${L(d.Ls, 'Ls')}  •  Straight shell` }) } };
  })();

  const svgEl = (tag, attrs, parent, text) => { const e = document.createElementNS(NS, tag); Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); if (text !== undefined) e.textContent = text; if (parent) parent.appendChild(e); return e; };
  function draw(dd, ratio, ref, pct) {
    const g = $('xsGraphic'), dm = $('xsDims'), clip = $('xsClipPath'); g.innerHTML = ''; dm.innerHTML = '';
    const pr = PROF[cur], d = ref ? pr.ref : Object.keys(dd).reduce((o, k) => (o[k] = dd[k] * 1000, o), {}), [rw, rh] = pr.size(d);   // dd is in metres; the drawing and labels work in mm
    const cx = 350, cy = 215, sc = Math.min(470 / rw, 285 / rh), w = rw * sc, h = rh * sc, left = cx - w / 2, right = cx + w / 2, top = cy - h / 2, bottom = cy + h / 2;
    const path = pr.path(sc, cx, cy, d), rc = ref ? ' is-ref' : '', gh = ref ? ' ghost' : '';
    clip.setAttribute('d', path);
    svgEl('path', { d: path, class: 'tank-outline' + rc }, g);
    if (!ref && ratio > 0) {
      const lh = h * Math.min(1, ratio), ly = bottom - lh;
      svgEl('rect', { x: left - 20, y: ly, width: w + 40, height: lh + 20, class: 'tank-liquid', 'clip-path': 'url(#xsClip)' }, g);
      if (ratio > .01 && ratio < .995) svgEl('path', { d: `M ${left - 10} ${ly} C ${left + w * .17} ${ly - 7}, ${left + w * .33} ${ly + 7}, ${left + w * .5} ${ly} S ${right - w * .17} ${ly - 7}, ${right + 10} ${ly}`, class: 'tank-liquid-wave', 'clip-path': 'url(#xsClip)' }, g);
    }
    svgEl('path', { d: path, class: 'tank-inner' + rc, transform: 'scale(.96)', 'transform-origin': `${cx}px ${cy}px` }, g);
    if (pr.seams) { const sg = svgEl('g', { 'clip-path': 'url(#xsClip)' }, g); pr.seams(sc, cx, d).forEach(x => svgEl('line', { x1: x, y1: top, x2: x, y2: bottom, class: 'xs-seam' }, sg)); }
    const lab = pr.lab(d, ref), yD = bottom + 54, xD = right + 58;
    svgEl('line', { x1: left, y1: bottom + 7, x2: left, y2: yD - 10, class: 'dim-line' }, dm); svgEl('line', { x1: right, y1: bottom + 7, x2: right, y2: yD - 10, class: 'dim-line' }, dm); svgEl('line', { x1: left, y1: yD, x2: right, y2: yD, class: 'dim-arrow' }, dm);
    svgEl('text', { x: cx, y: yD + 18, 'text-anchor': 'middle', class: 'dim-text' + gh }, dm, lab.w);
    svgEl('line', { x1: right + 7, y1: top, x2: xD - 10, y2: top, class: 'dim-line' }, dm); svgEl('line', { x1: right + 7, y1: bottom, x2: xD - 10, y2: bottom, class: 'dim-line' }, dm); svgEl('line', { x1: xD, y1: top, x2: xD, y2: bottom, class: 'dim-arrow' }, dm);
    svgEl('text', { x: xD + 18, y: cy + 4, 'text-anchor': 'middle', class: 'dim-text' + gh, transform: `rotate(90 ${xD + 18} ${cy + 4})` }, dm, lab.h);
    svgEl('text', { x: cx, y: yD + 40, 'text-anchor': 'middle', class: 'dim-text' + gh }, dm, lab.foot);
    svgEl('text', { x: cx, y: 35, 'text-anchor': 'middle', class: 'dim-text' + gh }, dm, ref ? 'Reference profile — no values entered' : `${fmt(pct, 1)}% full by volume`);
    $('xsHint').textContent = ref ? 'Empty reference outline. Enter dimensions to see the live cross-section.' : (/Horizontal|ellipse|stadium/i.test(S[cur].name) && !pr.seams ? 'End view of the tank: the liquid level is shown across the cross-section. Proportional illustration, not a fabrication drawing.' : 'Proportional engineering illustration. Not a fabrication drawing.');
    $('xsSvg').setAttribute('aria-label', ref ? `${S[cur].name} reference outline` : `${S[cur].name} profile, ${fmt(pct, 1)} percent full by volume`);
  }

  /* ---- inputs ---- */
  function evalExpr(raw) {                                  // same grammar as the main calculator: + - * / ( ) and x; "" -> null, invalid -> NaN
    const str = String(raw == null ? '' : raw).replace(/,/g, '').replace(/[xX×]/g, '*').replace(/\s+/g, '');
    if (!str) return null;
    if (!/^[0-9.+*/()\-]+$/.test(str)) return NaN;
    const tokens = str.match(/(?:\d*\.\d+|\d+\.?\d*|[()+*/-])/g) || []; if (tokens.join('') !== str) return NaN;
    let i = 0;
    const expr = () => { let v = term(); while (tokens[i] === '+' || tokens[i] === '-') { const op = tokens[i++], b = term(); v = op === '+' ? v + b : v - b; } return v; };
    const term = () => { let v = factor(); while (tokens[i] === '*' || tokens[i] === '/') { const op = tokens[i++], b = factor(); v = op === '*' ? v * b : v / b; } return v; };
    const factor = () => { if (tokens[i] === '+') { i++; return factor(); } if (tokens[i] === '-') { i++; return -factor(); } if (tokens[i] === '(') { i++; const v = expr(); if (tokens[i++] !== ')') throw Error('paren'); return v; } const n = Number(tokens[i++]); if (!Number.isFinite(n)) throw Error('num'); return n; };
    try { const v = expr(); return i === tokens.length && Number.isFinite(v) ? v : NaN; } catch (e) { return NaN; }
  }
  let cur = null, fillMode = 'depth', last = null;
  const store = {}, touched = {};
  const msg = { notNumber: 'Use numbers, or a sum like 2400/2.', mustBePositive: 'Must be greater than zero.', widthLessThanHeight: 'Width must be at least the height.' };

  function buildFields() {
    const s = S[cur]; $('xsTitle').textContent = s.name; $('xsBadge').textContent = s.name;
    $('xsDesc').textContent = 'Enter the internal dimensions of the tank. Dimensions are measured inside the shell.';
    $('xsFields').innerHTML = s.f.map(f => `<div class="tc-field" id="xsField-${f.k}"><label for="xs-${f.k}"><span>${esc(f.n)}</span><span class="tc-field-label-meta">${f.k}</span></label><div class="tc-input-group"><input id="xs-${f.k}" type="text" inputmode="decimal" autocomplete="off" value="${esc(store[f.k] ? store[f.k].v : '')}" placeholder="Enter ${f.k}"><select id="xs-${f.k}-u" aria-label="${esc(f.n)} unit">${UNITS.map(u => `<option ${u === ((store[f.k] && store[f.k].u) || 'mm') ? 'selected' : ''}>${u}</option>`).join('')}</select></div><p class="xs-err" id="xsErr-${f.k}" role="alert"></p></div>`).join('');
  }
  function readDims() {
    const raw = {}, info = {};
    S[cur].f.forEach(f => { const el = $('xs-' + f.k), u = $('xs-' + f.k + '-u').value, v = evalExpr(el.value);
      store[f.k] = { v: el.value, u }; info[f.k] = v === null ? 'empty' : (Number.isNaN(v) ? 'invalid' : 'ok'); raw[f.k] = { value: v === null ? NaN : v, unit: u }; });
    return { raw, info, d: G.normalizeDimensions(raw) };
  }
  const LEN = G.LENGTH_TO_M;
  function depthFor(target, d, max, total) {
    if (target <= 0) return 0; if (target >= total) return max;
    let lo = 0, hi = max; for (let i = 0; i < 70; i++) { const mid = (lo + hi) / 2; if (G.calculatePartialFillVolume(cur, d, mid) < target) lo = mid; else hi = mid; } return (lo + hi) / 2;
  }
  function fillDepth(d) {                                    // -> { depth } or { error, where }
    const max = G.SHAPES[cur].maxDepth(d), total = G.calculateTotalVolume(cur, d);
    if (fillMode === 'volume') {
      const v = evalExpr($('xsVol').value), u = $('xsVolUnit').value;
      if (Number.isNaN(v)) return { error: 'Use numbers, or a sum like 100+50.', where: 'vol' };
      if (v === null) return { depth: 0 };
      const m3 = G.convertVolume(v, u, 'm3');
      if (m3 < 0) return { error: 'Volume cannot be negative.', where: 'vol' };
      if (m3 > total * (1 + 1e-9)) return { error: `Volume cannot exceed the tank capacity (${fmt(total * 1000, 0)} L).`, where: 'vol' };
      return { depth: depthFor(m3, d, max, total) };
    }
    const v = evalExpr($('xsFill').value), u = $('xsFillUnit').value;
    if (Number.isNaN(v)) return { error: 'Use numbers, or a sum like 100+50.', where: 'depth' };
    if (v === null) return { depth: 0 };
    if (u === '%') { if (v < 0 || v > 100) return { error: 'Enter a value from 0 to 100.', where: 'depth' }; return { depth: depthFor(total * v / 100, d, max, total) }; }
    const m = v * LEN[u];
    if (m < 0) return { error: 'Depth cannot be negative.', where: 'depth' };
    if (m > max * (1 + 1e-9)) return { error: `Depth cannot exceed the tank height (${fmt(max * 1000, 0)} mm).`, where: 'depth' };
    return { depth: Math.min(m, max) };
  }
  function resetResults(text) {
    ['xsLitres', 'xsKL', 'xsFt3', 'xsGal'].forEach(i => $(i).textContent = i === 'xsKL' ? '0.000' : '0'); $('xsCap').textContent = '0 L'; $('xsPct').textContent = '0%'; $('xsDepth').textContent = '0 mm'; $('xsStatus').textContent = text;
    $('xsFillNote').textContent = ''; $('xsVolNote').textContent = '';
  }
  function update() {
    if (!cur) return;
    const { info, d } = readDims(); const dimErr = G.validateDimensions(cur, d);
    document.querySelectorAll('#xsWork .xs-err').forEach(e => e.textContent = ''); document.querySelectorAll('#xsFields .tc-field').forEach(f => f.classList.remove('xs-bad'));
    Object.keys(dimErr).forEach(k => { const e = $('xsErr-' + k); if (!e) return; const bad = info[k] === 'invalid' || (info[k] === 'ok'), show = touched[k] || info[k] !== 'empty';
      if (show && (bad || touched[k])) { e.textContent = info[k] === 'empty' ? 'Enter a measurement.' : (msg[dimErr[k]] || 'Invalid value.'); $('xsField-' + k).classList.add('xs-bad'); } });
    if (Object.keys(dimErr).length) { last = null; resetResults('Enter valid dimensions to calculate capacity.'); draw(null, 0, true); renderMath(); return; }
    const fd = fillDepth(d);
    if (fd.error) { $('xsErr-' + fd.where).textContent = fd.error; last = null; resetResults('Check the fill value.'); draw(d, 0, false, 0); renderMath(); return; }
    const max = G.SHAPES[cur].maxDepth(d), r = G.calculate(cur, d, fd.depth);
    const L = r.filledM3 * 1000, capL = r.totalM3 * 1000, pct = r.totalM3 ? r.filledM3 / r.totalM3 * 100 : 0;
    $('xsLitres').textContent = fmt(L, 0); $('xsCap').textContent = fmt(capL, 0) + ' L'; $('xsKL').textContent = fmt(r.filledM3, r.filledM3 < 10 ? 3 : 1);
    $('xsFt3').textContent = fmt(r.filledM3 * 35.3146667, 1); $('xsGal').textContent = fmt(G.convertVolume(r.filledM3, 'm3', 'galUS'), 0); $('xsPct').textContent = fmt(pct, 1) + '%'; $('xsDepth').textContent = fmt(fd.depth * 1000, 0) + ' mm';
    $('xsStatus').textContent = `Tank capacity: ${fmt(capL, 0)} L (${fmt(capL / 1000, 1)} KL) • Fill: ${fmt(pct, 1)}% • ≈ ${fmt(G.convertVolume(r.filledM3, 'm3', 'galUS'), 0)} US gal / ${fmt(G.convertVolume(r.filledM3, 'm3', 'galImp'), 0)} Imp gal filled.`;
    const depthTxt = `${fmt(fd.depth * 1000, 1)} mm / ${fmt(fd.depth, 2)} m / ${fmt(fd.depth / 0.0254, 1)} inch / ${fmt(fd.depth / 0.3048, 2)} ft`;
    $('xsFillNote').textContent = fillMode === 'depth' ? ($('xsFillUnit').value === '%' ? `${fmt(pct, 1)}% of capacity ≈ ${depthTxt} deep (${fmt(fd.depth / max * 100, 1)}% of the tank height).` : `Equivalent depth ≈ ${depthTxt}; the volume is computed from the actual profile shape.`) : '';
    $('xsVolNote').textContent = fillMode === 'volume' ? `${fmt(pct, 1)}% of capacity ≈ ${depthTxt} deep.` : '';
    last = { d, depth: fd.depth, max, r, pct };
    draw(d, fd.depth / max, false, pct); renderMath();
    const rg = $('xsRange'); if (rg && fillMode === 'depth' && $('xsFillUnit').value === '%' && document.activeElement !== rg) { rg.value = Math.round(Math.min(100, Math.max(0, evalExpr($('xsFill').value) || 0))); rg.style.setProperty('--p', rg.value + '%'); }
  }

  /* ---- events for the other-shapes workspace ---- */
  wk.addEventListener('input', e => { const t = e.target; if (t.id === 'xsFillUnit') return;   // unit changes are handled on 'change' so the value can be converted first
    if (t.id && t.id.startsWith('xs-') && !t.id.endsWith('-u')) touched[t.id.slice(3)] = true; if (t.id === 'xsRange') { $('xsFill').value = t.value; t.style.setProperty('--p', t.value + '%'); } update(); });
  wk.addEventListener('change', e => { if (e.target.id === 'xsFillUnit') convertFillUnit(); update(); });
  wk.addEventListener('focusout', e => { const t = e.target; if (t.tagName !== 'INPUT' || t.type !== 'text') return; const v = evalExpr(t.value); if (v != null && Number.isFinite(v) && /[+*/()xX×-]/.test(t.value.replace(/^-/, ''))) { t.value = String(Math.round(v * 1000) / 1000); update(); } });
  let priorUnit = '%';
  wk.addEventListener('focusin', e => { if (e.target.id === 'xsFillUnit') priorUnit = e.target.value; });
  function convertFillUnit() {
    const next = $('xsFillUnit').value, snap = last; $('xsRange').hidden = next !== '%';
    if (snap && next !== priorUnit) $('xsFill').value = next === '%' ? (snap.pct).toFixed(1) : (snap.depth / LEN[next]).toFixed(next === 'mm' ? 0 : 2);
    $('xsFillMeta').textContent = next === '%' ? '% of capacity' : 'depth'; priorUnit = next;
  }
  wk.querySelectorAll('[data-xsmode]').forEach(b => b.addEventListener('click', () => {
    fillMode = b.dataset.xsmode; wk.querySelectorAll('[data-xsmode]').forEach(x => x.classList.toggle('active', x === b));
    $('xsDepthPanel').classList.toggle('tc-hidden', fillMode !== 'depth'); $('xsVolPanel').classList.toggle('tc-hidden', fillMode !== 'volume'); update(); }));
  $('xsFillMeta').textContent = '% of capacity'; $('xsRange').style.setProperty('--p', '95%');

  /* ---------- mode + selection ---------- */
  function syncLauncher() {
    const pick = cur ? S[cur] : null; launch.classList.toggle('has-pick', !!pick);
    $('xsLaunchTitle').textContent = pick ? pick.name : 'More tank shapes';
    $('xsLaunchSub').textContent = pick ? 'Selected shape · tap to change' : 'Capsule, sphere, stadium oval, 2:1 heads and more';
    $('xsOrb').innerHTML = WIRE.icons[cur || 'sphere']();
    wrap.querySelectorAll('.xs-card').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.xs === cur)));
  }
  function setMode(id) {
    cur = id; shell.dataset.mode = id ? 'xs' : 'main';
    if (id) grid.querySelectorAll('.tc-shape-card').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    syncLauncher(); renderLearn(); syncInquire();
  }
  wrap.addEventListener('click', e => {
    const b = e.target.closest('.xs-card'); if (!b) return;
    setMode(b.dataset.xs); buildFields(); update();
    setTimeout(() => setSheet(false), reduce ? 0 : 260);
    setTimeout(() => wk.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), reduce ? 0 : 120);
  });
  grid.addEventListener('click', e => { if (e.target.closest('.tc-shape-card')) { if (cur) { setMode(null); } else renderLearn(); } });
  shell.dataset.mode = 'main';

  /* ---------- 4. understand the result ---------- */
  const learn = document.createElement('section'); learn.className = 'xs-learn'; learn.id = 'xsLearn'; learn.setAttribute('aria-label', 'How the result is worked out');
  learn.innerHTML = `<div class="xs-learn-head"><span class="xs-learn-icon" id="xsLearnIcon"></span><div class="xs-learn-title"><h2 id="xsLearnH">How the result is worked out</h2><p id="xsLearnLead"></p></div>
    <div class="xs-seg" role="tablist" aria-label="Explanation or formulas" id="xsSeg"><span class="xs-seg-pill" aria-hidden="true"></span><button type="button" role="tab" id="xsTabInfo" aria-selected="true" aria-controls="xsPaneInfo">How it works</button><button type="button" role="tab" id="xsTabMath" aria-selected="false" aria-controls="xsPaneMath" tabindex="-1">Formulas</button></div></div>
    <div class="xs-pane" id="xsPaneInfo" role="tabpanel" aria-labelledby="xsTabInfo"></div><div class="xs-pane xs-math" id="xsPaneMath" role="tabpanel" aria-labelledby="xsTabMath" hidden></div>`;
  (advT || work.parentElement.lastElementChild).before(learn);
  let tab = 'info';
  function setTab(t, focus) { tab = t; const m = t === 'math'; $('xsSeg').style.setProperty('--i', m ? 1 : 0);
    [['xsTabInfo', !m], ['xsTabMath', m]].forEach(([id, on]) => { const b = $(id); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    $('xsPaneInfo').hidden = m; $('xsPaneMath').hidden = !m; if (m) renderMath(); }
  $('xsTabInfo').addEventListener('click', () => setTab('info')); $('xsTabMath').addEventListener('click', () => setTab('math'));
  $('xsSeg').addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') { e.preventDefault(); setTab(e.key === 'ArrowLeft' || e.key === 'Home' ? 'info' : 'math', true); } });

  const mainId = () => { const a = grid.querySelector('.tc-shape-card.active[data-shape]'); return a ? a.dataset.shape : 'spell'; };
  function renderLearn() {
    const id = cur || mainId(), c = cur ? S[cur] : M[id]; if (!c) return;
    $('xsLearnIcon').innerHTML = icon(id); $('xsLearnLead').textContent = c.tag + '. Plain-English explanation, then the formulas filled with your numbers.';
    $('xsPaneInfo').innerHTML = `<div class="xs-info"><div><h3>What to measure</h3>${c.measure.map(m => `<div class="xs-dim"><b>${esc(m.b)}</b><div><strong>${esc(m.t)}</strong><span>${esc(m.h)}</span></div></div>`).join('')}</div>
      <div class="xs-how"><h3>How the volume is found</h3>${c.how.map(p => `<p>${esc(p)}</p>`).join('')}<h3>Good to know</h3><ul class="xs-notes">${c.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div></div>`;
    renderMath();
  }
  const tex = (el, s, block = true) => { if (!el) return; if (window.katex) { try { window.katex.render(s, el, { displayMode: block, throwOnError: false }); return; } catch (e) { /* fall through */ } } el.textContent = s; };
  const T = (v, dg = 2) => fmt(v, dg).replace(/,/g, '{,}');
  const eqCard = (host, cap, sym, num) => { const d = document.createElement('div'); d.className = 'tc-eq'; d.innerHTML = '<p class="tc-eq-cap"></p><div class="tc-eq-sym"></div><div class="tc-eq-num"></div>'; d.firstChild.textContent = cap; host.appendChild(d); tex(d.children[1], sym); if (num) tex(d.children[2], num); };
  function steps(id, w, d) {                                  // [caption, symbolic TeX, numeric TeX|null]; w = G.workings (SI) or null
    const mm = v => v * 1000, mm2 = v => v * 1e6, mm3 = v => v * 1e9, Ls = v => v * 1000, nf = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 6 }),
      n = (v, k) => Number.isFinite(v) ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: k }).format(v).replace(/,/g, '{,}') : '—';
    const vol = (sym, v) => `${sym}=${n(mm3(v), 0)}\\ \\text{mm}^3=${n(Ls(v), 2)}\\ \\text{L}`;
    const seg = r => w ? [String.raw`\theta=2\arccos\!\left(\frac{${n(mm(r), 1)}-${n(mm(w.f), 1)}}{${n(mm(r), 1)}}\right)=${n(w.theta, 4)}\ \text{rad},\quad A=\tfrac12\,(${n(mm(r), 1)})^{2}\,(${n(w.theta, 4)}-\sin ${n(w.theta, 4)})=${n(mm2(w.seg), 0)}\ \text{mm}^2`] : [null];
    const segSym = String.raw`\theta=2\arccos\!\left(\frac{r-f}{r}\right),\qquad A=\tfrac12\,r^{2}\,(\theta-\sin\theta)`;
    const R = w && w.r, f = w && mm(w.f);
    switch (id) {
      case 'horizontalCylinder': return [
        ['1 · Total volume', String.raw`V=\pi r^{2}L,\qquad r=\frac{D}{2}`, w && String.raw`V=\pi\times(${n(mm(R), 1)})^{2}\times${n(mm(d.L), 1)}\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Liquid segment', segSym, w && seg(R)[0]],
        ['3 · Filled volume', String.raw`V_{\text{fill}}=A\,L`, w && String.raw`V_{\text{fill}}=${n(mm2(w.seg), 0)}\times${n(mm(d.L), 1)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'verticalCylinder': return [
        ['1 · Total volume', String.raw`V=\pi r^{2}H,\qquad r=\frac{D}{2}`, w && String.raw`V=\pi\times(${n(mm(R), 1)})^{2}\times${n(mm(d.H), 1)}\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Filled volume', String.raw`V_{\text{fill}}=\pi r^{2}f`, w && String.raw`V_{\text{fill}}=\pi\times(${n(mm(R), 1)})^{2}\times${n(f, 1)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'rectangular': return [
        ['1 · Total volume', String.raw`V=L\,W\,H`, w && String.raw`V=${n(mm(d.L), 1)}\times${n(mm(d.W), 1)}\times${n(mm(d.H), 1)}\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Filled volume', String.raw`V_{\text{fill}}=L\,W\,f`, w && String.raw`V_{\text{fill}}=${n(mm(d.L), 1)}\times${n(mm(d.W), 1)}\times${n(f, 1)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'sphere': return [
        ['1 · Total volume', String.raw`V=\frac{4}{3}\pi r^{3},\qquad r=\frac{D}{2}`, w && String.raw`V=\tfrac43\pi\,(${n(mm(R), 1)})^{3}\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Spherical cap of liquid', String.raw`V_{\text{fill}}=\frac{\pi f^{2}}{3}\,(3r-f)`, w && String.raw`V_{\text{fill}}=\frac{\pi\,(${n(f, 1)})^{2}}{3}\,(3\times${n(mm(R), 1)}-${n(f, 1)})\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'ellipse': return [
        ['1 · Total volume', String.raw`V=\pi\,a\,b\,L,\qquad a=\frac{W}{2},\ b=\frac{H}{2}`, w && String.raw`V=\pi\times${n(mm(w.a), 1)}\times${n(mm(w.b), 1)}\times${n(mm(d.L), 1)}\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Liquid segment', String.raw`t=\frac{b-f}{b},\qquad A=a\,b\,\left[\arccos t-t\sqrt{1-t^{2}}\right]`, w && String.raw`t=\frac{${n(mm(w.b), 1)}-${n(f, 1)}}{${n(mm(w.b), 1)}}=${n(w.t, 4)},\quad A=${n(mm2(w.area), 0)}\ \text{mm}^2`],
        ['3 · Filled volume', String.raw`V_{\text{fill}}=A\,L`, w && String.raw`V_{\text{fill}}=${n(mm2(w.area), 0)}\times${n(mm(d.L), 1)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'stadium': return [
        ['1 · Total volume', String.raw`r=\frac{H}{2},\qquad a=W-H,\qquad V=(\pi r^{2}+2ra)\,L`, w && String.raw`V=(\pi\times${n(mm(w.r), 1)}^{2}+2\times${n(mm(w.r), 1)}\times${n(mm(w.a), 1)})\times${n(mm(d.L), 1)}\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Round sides (circle segment)', segSym, w && seg(R)[0]],
        ['3 · Flat middle and filled volume', String.raw`V_{\text{fill}}=\left(A+a\,f\right)L`, w && String.raw`V_{\text{fill}}=(${n(mm2(w.seg), 0)}+${n(mm(w.a), 1)}\times${n(f, 1)})\times${n(mm(d.L), 1)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'capsuleHorizontal': return [
        ['1 · Total volume', String.raw`V=\pi r^{2}\left(\tfrac43\,r+a\right),\qquad r=\frac{D}{2},\ a=L_c`, w && String.raw`V=\pi\,(${n(mm(R), 1)})^{2}\left(\tfrac43\times${n(mm(R), 1)}+${n(mm(w.a), 1)}\right)\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Straight section', segSym + String.raw`,\qquad V_{\text{cyl}}=A\,a`, w && seg(R)[0].replace(/\\quad A=.*$/, '') + String.raw`,\quad A=${n(mm2(w.seg), 0)}\ \text{mm}^2,\quad V_{\text{cyl}}=${n(mm3(w.cyl), 0)}\ \text{mm}^3`],
        ['3 · Two domed ends (one spherical cap)', String.raw`V_{\text{caps}}=\frac{\pi f^{2}}{3}\,(3r-f)`, w && String.raw`V_{\text{caps}}=\frac{\pi\,(${n(f, 1)})^{2}}{3}\,(3\times${n(mm(R), 1)}-${n(f, 1)})=${n(mm3(w.cap), 0)}\ \text{mm}^3`],
        ['4 · Filled volume', String.raw`V_{\text{fill}}=V_{\text{cyl}}+V_{\text{caps}}`, w && String.raw`V_{\text{fill}}=${n(mm3(w.cyl), 0)}+${n(mm3(w.cap), 0)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
      case 'ellipsoidalHeadsHorizontal': return [
        ['1 · Total volume', String.raw`V=\pi r^{2}\left(L_s+\tfrac23\,r\right),\qquad r=\frac{D}{2}`, w && String.raw`V=\pi\,(${n(mm(R), 1)})^{2}\left(${n(mm(w.a), 1)}+\tfrac23\times${n(mm(R), 1)}\right)\;\Rightarrow\;${vol('V', w.total)}`],
        ['2 · Straight shell', segSym + String.raw`,\qquad V_{\text{shell}}=A\,L_s`, w && seg(R)[0].replace(/\\quad A=.*$/, '') + String.raw`,\quad A=${n(mm2(w.seg), 0)}\ \text{mm}^2,\quad V_{\text{shell}}=${n(mm3(w.cyl), 0)}\ \text{mm}^3`],
        ['3 · Two 2:1 heads (half a spherical cap)', String.raw`V_{\text{heads}}=\frac{\pi f^{2}}{6}\,(3r-f)`, w && String.raw`V_{\text{heads}}=\frac{\pi\,(${n(f, 1)})^{2}}{6}\,(3\times${n(mm(R), 1)}-${n(f, 1)})=${n(mm3(w.heads), 0)}\ \text{mm}^3`],
        ['4 · Filled volume', String.raw`V_{\text{fill}}=V_{\text{shell}}+V_{\text{heads}}`, w && String.raw`V_{\text{fill}}=${n(mm3(w.cyl), 0)}+${n(mm3(w.heads), 0)}\;\Rightarrow\;${vol('V_{\\text{fill}}', w.filled)}`]];
    }
    return [];
  }
  const eqSteps = $('eqSteps');
  function renderMath() {
    if (tab !== 'math') return;
    const host = $('xsPaneMath'); host.innerHTML = '';
    if (cur) {
      const w = last ? G.workings(cur, last.d, last.depth) : null;
      steps(cur, w, last && last.d).forEach(s => eqCard(host, s[0], s[1], s[2]));
      if (!w) { const p = document.createElement('p'); p.className = 'tc-eq-hint'; p.textContent = 'Enter valid dimensions to see these formulas filled with your numbers.'; host.appendChild(p); }
    } else if (eqSteps) { host.innerHTML = eqSteps.innerHTML; }
  }
  if (eqSteps && 'MutationObserver' in window) { let q = 0; new MutationObserver(() => { if (cur || tab !== 'math' || q) return; q = requestAnimationFrame(() => { q = 0; renderMath(); }); }).observe(eqSteps, { childList: true }); }

  /* ---------- 5. Inquire ---------- */
  const mkInquire = () => { const d = document.createElement('div'); d.className = 'xs-inq';
    d.innerHTML = `<a class="xs-inq-btn" href="contact.html#inquiry"><span class="xs-inq-icon">${SEND}</span><span class="xs-inq-text"><strong>Inquire about this tank</strong><small>Your dimensions and capacity are added to the enquiry</small></span><span class="xs-inq-go">${GO}</span></a><p class="xs-inq-msg" role="alert"><i aria-hidden="true">!</i><span></span></p>`; return d; };
  const mainRes = work.querySelector('.tc-results'), inqMain = mkInquire(), inqXs = mkInquire();
  if (mainRes) mainRes.after(inqMain); const xsRes = wk.querySelector('.tc-results'); xsRes.after(inqXs);
  function syncInquire() { [inqMain, inqXs].forEach(i => { i.querySelector('.xs-inq-msg').classList.remove('show'); }); }
  const showMsg = (box, text, fields) => {
    const m = box.querySelector('.xs-inq-msg'), b = box.querySelector('.xs-inq-btn'); m.querySelector('span').textContent = text; m.classList.remove('show'); void m.offsetWidth; m.classList.add('show');
    b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
    document.querySelectorAll('.xs-missing').forEach(f => f.classList.remove('xs-missing'));
    (fields || []).forEach(id => { const el = $(id); if (el && el.closest('.tc-field')) el.closest('.tc-field').classList.add('xs-missing'); });
    if (fields && fields[0] && $(fields[0])) $(fields[0]).focus({ preventScroll: true });
    setTimeout(() => document.querySelectorAll('.xs-missing').forEach(f => f.classList.remove('xs-missing')), 3200);
  };
  const joinNames = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const filled = id => { const el = $(id); if (!el) return false; const v = evalExpr(el.value); return v != null && Number.isFinite(v) && v > 0; };
  function inquire(box, e) {
    e.preventDefault(); box.querySelector('.xs-inq-msg').classList.remove('show');
    let missing = [], q = null;
    if (cur) {
      S[cur].f.forEach(f => { touched[f.k] = true; if (!filled('xs-' + f.k)) missing.push(f); });
      if (missing.length) { update(); return showMsg(box, `Enter the ${joinNames(missing.map(f => f.n.replace(/ \(.*\)$/, '').toLowerCase()))} first, so your enquiry includes the tank size.`, missing.map(f => 'xs-' + f.k)); }
      if (!last) { update(); return showMsg(box, 'These dimensions do not give a valid tank yet. Check the highlighted values above.', []); }
      q = specXs();
    } else {
      const id = mainId(), need = id === 'circle' ? [['length', 'length'], ['diameter', 'diameter']] : [['length', 'length'], ['width', 'width'], ['height', 'height']];
      missing = need.filter(n => !filled(n[0]));
      if (missing.length) return showMsg(box, `Enter the tank ${joinNames(missing.map(n => n[1]))} first, so your enquiry includes the tank size.`, missing.map(n => n[0]));
      q = specMain(id); if (!q) return showMsg(box, 'These dimensions do not give a valid tank yet. Check the values above.', []);
    }
    location.href = 'contact.html?' + new URLSearchParams({ cap: q.cap, spec: q.spec }).toString() + '#inquiry';
  }
  [inqMain, inqXs].forEach(box => box.querySelector('.xs-inq-btn').addEventListener('click', e => inquire(box, e)));
  function specXs() {
    const s = S[cur], r = last.r, capL = fmt(r.totalM3 * 1000, 0) + ' L';
    const dimsTxt = s.f.map(f => `${f.n.replace(/ \(.*\)$/, '')} (${f.k}): ${$('xs-' + f.k).value.trim()} ${$('xs-' + f.k + '-u').value}`);
    return { cap: capL, spec: [`Tank shape: ${s.name}`, ...dimsTxt, `Calculated total capacity: ${capL} (${fmt(r.totalM3, 3)} m³)`, `Fill: ${fmt(last.pct, 1)}% of capacity (${fmt(last.depth * 1000, 0)} mm deep)`, 'Source: HH FABTECH tank volume calculator (ideal internal geometry, estimate only)'].join('\n') };
  }
  function specMain(id) {
    const cap = $('capacityResult') ? $('capacityResult').textContent : '0 L'; if (!cap || cap === '0 L') return null;
    const U = (a, b) => `${$(a).value.trim()} ${$(b).value}`, name = $('inputTitle').textContent, lines = [`Tank shape: ${name}`, `Straight shell length (L): ${U('length', 'lengthUnit')}`];
    if (id === 'circle') lines.push(`Diameter (D): ${U('diameter', 'diameterUnit')}`); else lines.push(`Overall width (W): ${U('width', 'widthUnit')}`, `Overall height (H): ${U('height', 'heightUnit')}`);
    if (id === 'spell') lines.push(`Rwidth: ${U('rwidth', 'rwidthUnit')}`, `Rheight: ${U('rheight', 'rheightUnit')}`, `Corner bend radius: ${$('filInput') ? $('filInput').value : 140} mm`);
    lines.push(`Embossed dish ends: ${$('embossOn') && $('embossOn').checked ? 'included, ' + U('emboss', 'embossUnit') + ' per end' : 'excluded'}`, `Calculated total capacity: ${cap}`, `Fill: ${$('fillPercentResult').textContent} (${$('fillDepthResult').textContent} deep)`, 'Source: HH FABTECH tank volume calculator (estimate only)');
    return { cap, spec: lines.join('\n') };
  }

  /* ---------- go ---------- */
  setMode(null); setTab('info');
});
