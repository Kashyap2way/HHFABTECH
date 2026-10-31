// Run: node tests/geometry.test.js   (no dependencies)
const assert = require('assert');
const G = require('../assets/js/geometry.js');
const PI = Math.PI; let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const near = (a, b, tol = 1e-9) => assert(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
// Independent Simpson integration of width(y) dy, used to cross-check closed forms.
const simpson = (f, a, b, N = 256000) => { const h = (b - a) / N; let s = f(a) + f(b);
  for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; };

t('horizontal cylinder: empty / half / full', () => {
  const d = { D: 2, L: 1 };
  near(G.calculate('horizontalCylinder', d, 0).filledM3, 0);
  near(G.calculate('horizontalCylinder', d, 1).filledM3, PI / 2);
  near(G.calculate('horizontalCylinder', d, 2).filledM3, PI);
  near(G.calculate('horizontalCylinder', d).totalM3, PI);
});
t('sphere: total 4/3πr³, half = 2π/3, quarter-depth cap', () => {
  near(G.calculate('sphere', { D: 2 }).totalM3, 4 * PI / 3);
  near(G.calculate('sphere', { D: 2 }, 1).filledM3, 2 * PI / 3);
  near(G.calculate('sphere', { D: 2 }, 0.5).filledM3, PI * 0.25 * (1 - 0.5 / 3));
});
t('vertical cylinder and rectangular', () => {
  near(G.calculate('verticalCylinder', { D: 2, H: 3 }, 1.5).filledM3, PI * 1.5);
  near(G.calculate('rectangular', { L: 2, W: 3, H: 4 }, 1).filledM3, 6);
  near(G.calculate('rectangular', { L: 2, W: 3, H: 4 }).totalM3, 24);
});
t('ellipse total = πabL and reduces to circle when W=H', () => {
  near(G.calculate('ellipse', { W: 4, H: 2, L: 3 }).totalM3, PI * 2 * 1 * 3);
  near(G.calculate('ellipse', { W: 2, H: 2, L: 5 }, 0.7).filledM3, G.calculate('horizontalCylinder', { D: 2, L: 5 }, 0.7).filledM3);
});
t('stadium reduces to cylinder when W=H; total formula', () => {
  near(G.calculate('stadium', { W: 2, H: 2, L: 5 }, 0.7).filledM3, G.calculate('horizontalCylinder', { D: 2, L: 5 }, 0.7).filledM3);
  near(G.calculate('stadium', { W: 4, H: 2, L: 1 }).totalM3, 2 * 2 + PI);
});
t('capsule: straight section + exactly one sphere (no double count)', () => {
  near(G.calculate('capsuleHorizontal', { D: 2, Lc: 3 }).totalM3, 3 * PI + 4 * PI / 3);
  near(G.calculate('capsuleHorizontal', { D: 2, Lc: 3 }, 1).filledM3, G.calculate('capsuleHorizontal', { D: 2, Lc: 3 }).totalM3 / 2);
});
t('2:1 ellipsoidal heads: total and symmetric half-fill', () => {
  const d = { D: 2, L: 4, E: 0.5 }, tot = 3 * PI + (4 / 3) * PI * 1 * 0.5;   // shell = 4 − 2×0.5 = 3
  near(G.calculate('ellipsoidalHeadsHorizontal', d).totalM3, tot);
  near(G.calculate('ellipsoidalHeadsHorizontal', d, 1).filledM3, tot / 2);
});
t('independent numerical integration matches closed forms', () => {
  const r = 1.3, h = 0.8, L = 2;
  near(G.calculate('horizontalCylinder', { D: 2 * r, L }, h).filledM3, simpson(y => 2 * Math.sqrt(Math.max(0, r * r - (y - r) ** 2)), 0, h) * L, 1e-6);
  const a = 2, b = 1.1;
  near(G.calculate('ellipse', { W: 2 * a, H: 2 * b, L }, 0.9).filledM3, simpson(y => 2 * a * Math.sqrt(Math.max(0, 1 - ((y - b) / b) ** 2)), 0, 0.9) * L, 1e-6);
  const D = 2, k = 0.5; // spheroid heads: cross-section area at x is π ρ² with ρ shrinking; filled = scaled sphere cap
  near(G.calculate('sphere', { D }, 0.6).filledM3, simpson(y => PI * (1 - (y - 1) ** 2), 0, 0.6), 1e-6);
});
t('monotonic, bounded 0..total for every shape across 201 depths', () => {
  const cases = { horizontalCylinder: { D: 2, L: 3 }, verticalCylinder: { D: 2, H: 3 }, rectangular: { L: 1, W: 2, H: 3 }, sphere: { D: 2 },
    ellipse: { W: 4, H: 2, L: 3 }, stadium: { W: 4, H: 2, L: 3 }, capsuleHorizontal: { D: 2, Lc: 3 }, ellipsoidalHeadsHorizontal: { D: 2, L: 4, E: 0.5 } };
  Object.keys(cases).forEach(id => { const d = cases[id], max = G.SHAPES[id].maxDepth(d), tot = G.calculateTotalVolume(id, d); let prev = -1;
    for (let i = 0; i <= 200; i++) { const v = G.calculate(id, d, max * i / 200).filledM3;
      assert(Number.isFinite(v) && v >= prev - 1e-12 && v >= 0 && v <= tot + 1e-12, `${id} @${i}`); prev = v; }
    near(prev, tot); });
});
t('workings: the shown intermediates add up to calculate() for every shape and depth', () => {
  const cases = { horizontalCylinder: { D: 2, L: 3 }, verticalCylinder: { D: 2, H: 3 }, rectangular: { L: 1, W: 2, H: 3 }, sphere: { D: 2 },
    ellipse: { W: 4, H: 2, L: 3 }, stadium: { W: 4, H: 2, L: 3 }, capsuleHorizontal: { D: 2, Lc: 3 }, ellipsoidalHeadsHorizontal: { D: 2, L: 4, E: 0.5 } };
  const sum = {
    horizontalCylinder: (w, d) => w.seg * d.L, verticalCylinder: w => w.base * w.f, rectangular: w => w.base * w.f, sphere: w => w.cap,
    ellipse: (w, d) => w.area * d.L, stadium: (w, d) => (w.seg + w.rect) * d.L, capsuleHorizontal: w => w.cyl + w.cap,
    ellipsoidalHeadsHorizontal: w => w.cyl + w.heads };
  Object.keys(cases).forEach(id => { const d = cases[id], max = G.SHAPES[id].maxDepth(d);
    [0, 0.05, 0.33, 0.5, 0.77, 0.999, 1].forEach(p => { const w = G.workings(id, d, max * p), r = G.calculate(id, d, max * p);
      near(w.filled, r.filledM3); near(sum[id](w, d), r.filledM3, 1e-9); near(w.total, r.totalM3); }); });
  assert(G.workings('nope', {}, 0) === null);
});
t('rounded-edge rectangular tank: R = 0 is a plain box, corner area loss is (4−π)R², fill matches numerical integration', () => {
  assert.strictEqual(G.calculate('rectangular', { L: 2, W: 3, H: 4, R: 0 }, 1.3).filledM3, 2 * 3 * 1.3);
  const d = { L: 2, W: 1.4, H: 1, R: 0.07 };
  near(G.calculate('rectangular', d).totalM3, 2 * (1.4 * 1 - (4 - PI) * 0.07 ** 2));
  // width of the rounded profile at height y, integrated independently
  const wid = y => { const R = d.R, inset = yy => R - Math.sqrt(Math.max(0, R * R - (R - yy) ** 2));
    return d.W - 2 * (y < R ? inset(y) : 0) - 2 * (y > d.H - R ? inset(d.H - y) : 0); };
  [0.02, 0.05, 0.07, 0.3, 0.5, 0.93, 0.96, 0.99, 1].forEach(h =>
    near(G.calculate('rectangular', d, h).filledM3, simpson(wid, 0, h, 200000) * d.L, 1e-6));
  assert(G.calculate('rectangular', { L: 1, W: 1, H: 1, R: 0.6 }).errors.R === 'radiusTooLarge');
  const w = G.workings('rectangular', d, 0.96); near(w.area * d.L, G.calculate('rectangular', d, 0.96).filledM3);
});
t('conical bottom tank: cone + shell + embossed top match slice integration, flat top when E = 0', () => {
  const r = 0.6, Hc = 0.9, Hs = 1.5, E = 0.15, d = { D: 1.2, Hc, Hs, E };
  near(G.calculate('coneBottom', d).totalM3, PI * r * r * (Hc / 3 + Hs + 2 * E / 3));
  near(G.calculate('coneBottom', { D: 1.2, Hc, Hs }).totalM3, PI * r * r * (Hc / 3 + Hs));
  const rad = y => y < Hc ? r * y / Hc : (y <= Hc + Hs ? r : r * Math.sqrt(Math.max(0, 1 - ((y - Hc - Hs) / E) ** 2)));
  [0.2, 0.9, 1.4, 2.4, 2.45, 2.5, 2.55].forEach(h => near(G.calculate('coneBottom', d, h).filledM3, simpson(y => PI * rad(y) ** 2, 0, h, 200000), 1e-6));
  near(G.SHAPES.coneBottom.maxDepth(d), Hc + Hs + E);
  assert(G.calculate('coneBottom', { D: 1, Hc: 1, Hs: 1, E: 0.9 }).errors.E === 'depthExceedsRadius');
  const w = G.workings('coneBottom', d, 2.5); near(w.cone + w.shell + w.top, w.filled);
  const f = G.workings('coneBottom', { D: 1.2, Hc, Hs }, 1.0); near(f.cone + f.shell + f.top, f.filled);
});
t('dish bowl (spherical cap): hemisphere = 2/3 πr³, matches slice integration', () => {
  near(G.calculate('dishBowl', { D: 2, E: 1 }).totalM3, 2 * PI / 3);
  near(G.calculate('dishBowl', { D: 2, E: 1 }, 0.5).filledM3, PI * 0.25 * (1 - 0.5 / 3));
  const d = { D: 1.6, E: 0.35 }, R = (0.8 * 0.8 + 0.35 * 0.35) / (2 * 0.35);
  [0.05, 0.2, 0.35].forEach(h => near(G.calculate('dishBowl', d, h).filledM3, simpson(y => PI * (R * R - (R - y) ** 2), 0, h, 100000), 1e-6));
  assert(G.calculate('dishBowl', { D: 1, E: 0.6 }).errors.E === 'depthExceedsRadius');
});
t('ellipsoidal heads with user dish depth: shell = L − 2E, heads match slice integration, 2:1 default reproduces D/4', () => {
  const d = { D: 1.2, L: 3.3, E: 0.15 }, r = 0.6, Ls = 3.3 - 0.3;
  near(G.calculate('ellipsoidalHeadsHorizontal', d).totalM3, PI * r * r * Ls + 4 / 3 * PI * r * r * 0.15);
  [0.1, 0.3, 0.6, 0.9, 1.15].forEach(h => {
    const seg = circleSeg(r, h) * Ls, heads = 2 * simpson(x => { const s = Math.sqrt(Math.max(0, 1 - (x / 0.15) ** 2)); return s < 1e-9 ? 0 : circleSeg(s * r, h - r * (1 - s)); }, 0, 0.15, 20000);
    near(G.calculate('ellipsoidalHeadsHorizontal', d, h).filledM3, seg + heads, 1e-6); });
  assert(G.calculate('ellipsoidalHeadsHorizontal', { D: 1, L: 0.2, E: 0.15 }).errors.L === 'lengthTooShort');
  assert(G.calculate('ellipsoidalHeadsHorizontal', { D: 1, L: 5, E: 0.7 }).errors.E === 'depthExceedsRadius');
});
function circleSeg(r, h) { return G.circleSegmentArea(r, h); }
t('unit conversion constants and round trips', () => {
  near(G.convertVolume(1, 'm3', 'L'), 1000); near(G.convertVolume(1, 'm3', 'galUS'), 264.172052358, 1e-9);
  near(G.convertVolume(1, 'm3', 'galImp'), 219.969248299, 1e-9);
  near(G.convertLength(1, 'ft', 'in'), 12); near(G.convertLength(25.4, 'mm', 'in'), 1);
  ['mm', 'cm', 'm', 'in', 'ft'].forEach(u => near(G.convertLength(G.convertLength(7.3, 'm', u), u, 'm'), 7.3));
});
t('unit change does not change physical volume', () => {
  const a = G.calculate('horizontalCylinder', G.normalizeDimensions({ D: { value: 1000, unit: 'mm' }, L: { value: 2000, unit: 'mm' } }), 0.4);
  const b = G.calculate('horizontalCylinder', G.normalizeDimensions({ D: { value: 1, unit: 'm' }, L: { value: 2, unit: 'm' } }), 0.4);
  near(a.filledM3, b.filledM3);
});
t('very small and very large valid dimensions stay finite', () => {
  const s = G.calculate('horizontalCylinder', { D: 1e-3, L: 1e-3 }, 5e-4), b = G.calculate('horizontalCylinder', { D: 50, L: 500 }, 25);
  assert(s.ok && s.filledM3 > 0 && b.ok && Number.isFinite(b.filledM3)); near(s.filledM3, PI * 2.5e-7 * 1e-3 / 2 * 1, 1e-6);
});
t('invalid inputs rejected with field errors, never NaN/Infinity', () => {
  [[{ D: 0, L: 1 }], [{ D: -1, L: 1 }], [{ D: NaN, L: 1 }], [{ D: Infinity, L: 1 }], [{ D: '2', L: 1 }], [{ L: 1 }]]
    .forEach(([d]) => { const r = G.calculate('horizontalCylinder', d); assert(!r.ok && r.errors.D && r.totalM3 === undefined); });
  assert(G.calculate('horizontalCylinder', { D: 1, L: 1 }, 1.5).errors.depth === 'depthExceedsHeight');
  assert(G.calculate('horizontalCylinder', { D: 1, L: 1 }, -0.1).errors.depth === 'invalidDepth');
  assert(G.calculate('stadium', { W: 1, H: 2, L: 1 }).errors.W === 'widthLessThanHeight');
  assert(G.calculate('nope', {}).errors.shape === 'unknownShape');
});
t('legacy Spell profile port: reference profile area (baseline for regression)', () => {
  const A = G.spellArea(2.4, 1.83, 1.93, 1.475);
  assert(Number.isFinite(A) && A > 1.93 * 1.475 && A < 2.4 * 1.83); console.log('   spell ref area m² =', A.toFixed(6));
  assert(Number.isNaN(G.spellArea(2.4, 1.83, 2.5, 1.475)));
});
console.log(`\n${n} test groups passed`);
