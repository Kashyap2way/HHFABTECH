/*! HH FABTECH quote builder core: pure functions + shared state. No DOM. Rules ported from calculator.html. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./geometry.js')); else root.HHQuote = factory(root.HHGeometry); })(typeof self !== 'undefined' ? self : this, function (G) {
  'use strict';
  const CFG = {
    maxW: 2400, maxH: 1830,                                   // mm, per your brief
    REF: { W: 2400, H: 1830, Rw: 1930, Rh: 1475 }, fillet: 70, emboss: 150,   // Spell profile reference (calculator.html); fillet is the corner bend RADIUS in mm (roll-bend machine is 140 mm diameter = 70 mm radius)
    baffle: { sectionL: 5000, overrunPct: 20, usablePct: 95, round4000: false, evenRound: true },
    // PLACEHOLDERS to fill later: tonnes per kilolitre by product (editable by the customer in the UI)
    density: { petroleum: 0.83, chemical: 1.0, fuel: 0.83, ss: 1.0, storage: 1.0, water: 1.0 },
    // PRICING: null = not set yet, UI shows "₹ X". Fill these in the next phase.
    pricing: { gstPct: 18, perKL: null, materialFactor: { ms: 1, ss202: null, ss304: null, ss316: null, al6016: null }, accessory: {} },
    // DELIVERY: all placeholders. Working days exclude Sundays and listed holidays.
    lead: { baseWorkingDays: 25, extraPer10KL: 2, peakMonths: [2, 3, 4, 9, 10], peakFactor: 1.25,   // 0=Jan. Peak months are an assumption to confirm.
      holidays: ['2026-11-08', '2026-11-10', '2026-12-25', '2027-01-14', '2027-01-26'] },           // TO VERIFY before going live
  };
  const MATERIALS = [['ms', 'MS (Mild Steel)'], ['ss202', 'SS 202'], ['ss304', 'SS 304'], ['ss316', 'SS 316'], ['al6016', 'Aluminium 6016']];
  const PRODUCTS = [['petroleum', 'Petroleum / Diesel Tanker'], ['chemical', 'Chemical Tanker'], ['fuel', 'Fuel Bowser'], ['ss', 'Stainless Steel Tanker'], ['storage', 'Storage Tank'], ['water', 'Water Tanker']];
  const ACCESSORIES = [['catwalk', 'Catwalk + Ladder', 1], ['bumper', 'Rear Bumper', 1], ['railguard', 'Railguard / Sideguard', 1], ['valvebox', 'Valve box', 1], ['eso', 'Emergency Shutoff Lever', 1],
    ['hosecarrier', 'Hose pipe carrier (10 ft × 4 in filling pipe)', 1], ['nozzlebox', 'Delivery nozzle box', 1], ['mudguard', 'Mudguard + steering-wheel tyre mudguard', 1], ['fire', 'Fire extinguisher + stand', 0]];

  const toKL = (value, unit, density) => unit === 'TON' ? value / density : value;       // TON → KL needs density (t/KL)
  /** Size the Spell tank at the maximum cross-section for a capacity in litres. Returns null if it cannot be sized. */
  function sizeTank(capL, opts = {}) {
    const W = Math.min(opts.W || CFG.maxW, CFG.maxW), H = Math.min(opts.H || CFG.maxH, CFG.maxH), emb = opts.emboss ?? CFG.emboss;
    if (!(capL > 0)) return null;
    const A = G.spellArea(W, H, W * CFG.REF.Rw / CFG.REF.W, H * CFG.REF.Rh / CFG.REF.H, CFG.fillet);   // mm²
    const L = capL * 1e6 / A - (4 / 3) * emb;                                                            // capacity = A·(L + 4/3·emb)
    return L > 0 ? { W, H, L, emboss: emb, areaMm2: A, dishEnds: 2 } : null;
  }
  /** Baffle sections, same rule as calculator.html updateBaffles(). */
  function baffles(capL, o = CFG.baffle) {
    const maxS = o.sectionL * (1 + o.overrunPct / 100); let Vu = capL * o.usablePct / 100;
    if (o.round4000 && Vu > 0) Vu = Math.max(4000, Math.round(Vu / 4000) * 4000);
    let n = Vu > 0 ? Math.max(1, Math.ceil(Vu / maxS - 1e-9)) : 0; if (o.evenRound && n > 1 && n % 2) n += 1;
    return { sections: n, plates: n > 1 ? n - 1 : 0, eachL: n ? Vu / n : 0 };
  }
  /** Price with GST. Returns null until the rate card (CFG.pricing) is filled in. */
  function price(q) {
    const P = CFG.pricing, mf = P.materialFactor[q.material]; if (P.perKL == null || mf == null) return null;
    let sub = P.perKL * q.capacityKL * mf;
    for (const id of q.accessories || []) { const a = P.accessory[id]; if (a == null) return null; sub += a; }
    const gst = sub * P.gstPct / 100; return { subtotal: sub, gst, total: sub + gst };
  }
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isWorking = d => d.getDay() !== 0 && !CFG.lead.holidays.includes(iso(d));
  /** Estimated delivery date: working days from start, stretched by a season-pressure factor. */
  function estimateDelivery(start, capacityKL) {
    const Ld = CFG.lead, peak = Ld.peakMonths.includes(start.getMonth()), factor = peak ? Ld.peakFactor : 1;
    const days = Math.ceil((Ld.baseWorkingDays + Math.floor(capacityKL / 10) * Ld.extraPer10KL) * factor);
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); let left = days;
    while (left > 0) { d.setDate(d.getDate() + 1); if (isWorking(d)) left--; }
    return { date: d, workingDays: days, peak, factor };
  }
  const KEY = 'hh_quote_v1';
  const defaults = () => ({ v: 1, product: 'petroleum', unit: 'KL', capacity: '', density: null, material: 'ms', accessories: ACCESSORIES.filter(a => a[2]).map(a => a[0]), fromCalculator: null });
  function load(store) { try { const s = JSON.parse(store.getItem(KEY)); return s && s.v === 1 ? Object.assign(defaults(), s) : defaults(); } catch (e) { return defaults(); } }
  function save(store, s) { try { store.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  return { CFG, MATERIALS, PRODUCTS, ACCESSORIES, toKL, sizeTank, baffles, price, estimateDelivery, isWorking, iso, load, save, defaults, KEY };
});
