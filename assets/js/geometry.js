/*! HH FABTECH geometry engine. Pure functions, SI internally (metres, m³). No DOM access. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HHGeometry = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PI = Math.PI;

  // ---- Unit constants (exact definitions) ----
  const LENGTH_TO_M = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 };
  const M3_TO = { m3: 1, L: 1000, galUS: 1000 / 3.785411784, galImp: 1000 / 4.54609 };
  const convertLength = (v, from, to) => (v * LENGTH_TO_M[from]) / LENGTH_TO_M[to];
  const convertVolume = (v, from, to) => (v / M3_TO[from]) * M3_TO[to];

  // ---- Primitives ----
  /** Area (m²) of a circular segment of radius r filled to depth h from the bottom. */
  function circleSegmentArea(r, h) {
    if (h <= 0) return 0;
    if (h >= 2 * r) return PI * r * r;           // explicit full case avoids acos rounding
    return r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(2 * r * h - h * h);
  }
  /** Area (m²) of an ellipse (semi-axes a horizontal, b vertical) filled to depth h from the bottom. */
  function ellipseSegmentArea(a, b, h) {
    if (h <= 0) return 0;
    if (h >= 2 * b) return PI * a * b;
    const t = (b - h) / b;
    return a * b * (Math.acos(t) - t * Math.sqrt(1 - t * t));
  }
  /** Volume (m³) of a sphere of radius r filled to depth h. */
  function sphereCapVolume(r, h) {
    if (h <= 0) return 0;
    if (h >= 2 * r) return (4 / 3) * PI * r ** 3;
    return PI * h * h * (r - h / 3);
  }
  /**
   * Existing HH "Spell" profile area (m² if inputs in m), ported from calculator.html.
   * Rectangle Rw×Rh + four circular-arc blends inside overall W×H, minus corner fillet term.
   * The fillet term (4−π)f² is the legacy approximation; f defaults to 140 mm.
   */
  function spellArea(W, H, Rw, Rh, f = 0.14) {
    const h1 = (H - Rh) / 2, h2 = (W - Rw) / 2;
    if (!(W > 0 && H > 0 && Rw > 0 && Rh > 0) || Rw > W || Rh > H) return NaN;
    const seg = (c, h) => {
      if (h <= 0) return 0;
      const r = (c * c + 4 * h * h) / (8 * h);
      return r * r * Math.acos(Math.max(-1, Math.min(1, (r - h) / r))) - ((r - h) * c) / 2;
    };
    return Rw * Rh + 2 * seg(Rw, h1) + 2 * seg(Rh, h2) - (4 - PI) * f * f;
  }

  /** Area (m²) between a square corner and its rounding arc (radius R), from the corner up to height y. */
  function cornerLoss(R, y) {
    if (y <= 0 || R <= 0) return 0;
    if (y >= R) return (1 - PI / 4) * R * R;
    const u = R - y;
    return R * y - (PI * R * R / 4 - (u * Math.sqrt(R * R - u * u) / 2 + R * R / 2 * Math.asin(u / R)));
  }
  /** Liquid area of a W×H rectangle with all four corners rounded to radius R, filled to depth h. */
  function roundedRectFill(W, H, R, h) {
    if (h <= 0) return 0;
    if (h >= H) return W * H - (4 - PI) * R * R;
    const top = h > H - R ? cornerLoss(R, R) - cornerLoss(R, H - h) : 0;
    return W * h - 2 * cornerLoss(R, Math.min(h, R)) - 2 * top;
  }

  // ---- Shape registry: dims in metres. total(d) and partial(d,h) return m³; depth h from the bottom. ----
  const SHAPES = {
    horizontalCylinder: { dims: ['D', 'L'], maxDepth: d => d.D,
      total: d => PI * (d.D / 2) ** 2 * d.L,
      partial: (d, h) => circleSegmentArea(d.D / 2, h) * d.L },
    verticalCylinder: { dims: ['D', 'H'], maxDepth: d => d.H,
      total: d => PI * (d.D / 2) ** 2 * d.H,
      partial: (d, h) => PI * (d.D / 2) ** 2 * h },
    // Optional R = corner radius of the cross-section (roll-bent plate). R = 0 / absent is a plain box.
    rectangular: { dims: ['L', 'W', 'H'], opt: ['R'], maxDepth: d => d.H,
      check: d => d.R > Math.min(d.W, d.H) / 2 * (1 + 1e-12) ? { k: 'R', e: 'radiusTooLarge' } : null,
      total: d => d.L * (d.W * d.H - (4 - PI) * (d.R || 0) ** 2),
      partial: (d, h) => d.L * roundedRectFill(d.W, d.H, d.R || 0, h) },
    sphere: { dims: ['D'], maxDepth: d => d.D,
      total: d => (4 / 3) * PI * (d.D / 2) ** 3,
      partial: (d, h) => sphereCapVolume(d.D / 2, h) },
    // True ellipse cross-section: W = full horizontal axis, H = full vertical axis.
    ellipse: { dims: ['W', 'H', 'L'], maxDepth: d => d.H,
      total: d => PI * (d.W / 2) * (d.H / 2) * d.L,
      partial: (d, h) => ellipseSegmentArea(d.W / 2, d.H / 2, h) * d.L },
    // Stadium: flat top/bottom, semicircular left/right ends of diameter H. Requires W >= H.
    stadium: { dims: ['W', 'H', 'L'], maxDepth: d => d.H, check: d => d.W >= d.H ? null : { k: 'W', e: 'widthLessThanHeight' },
      total: d => ((d.W - d.H) * d.H + PI * d.H * d.H / 4) * d.L,
      partial: (d, h) => ((d.W - d.H) * Math.min(h, d.H) + circleSegmentArea(d.H / 2, h)) * d.L },
    // Capsule: Lc is the straight section only; hemispherical ends add exactly one sphere (no double count).
    capsuleHorizontal: { dims: ['D', 'Lc'], maxDepth: d => d.D,
      total: d => PI * (d.D / 2) ** 2 * d.Lc + (4 / 3) * PI * (d.D / 2) ** 3,
      partial: (d, h) => circleSegmentArea(d.D / 2, h) * d.Lc + sphereCapVolume(d.D / 2, h) },
    // Horizontal shell with ellipsoidal dished ends. L = overall length end to end, E = dish depth per end (D/4 for a true 2:1 head).
    // Straight shell = L − 2E. Each head is a half-ellipsoid with semi-axes r, r, E.
    ellipsoidalHeadsHorizontal: { dims: ['D', 'L', 'E'], maxDepth: d => d.D,
      check: d => d.E > d.D / 2 * (1 + 1e-12) ? { k: 'E', e: 'depthExceedsRadius' } : (d.L > 2 * d.E ? null : { k: 'L', e: 'lengthTooShort' }),
      total: d => PI * (d.D / 2) ** 2 * (d.L - 2 * d.E) + (4 / 3) * PI * (d.D / 2) ** 2 * d.E,
      partial: (d, h) => circleSegmentArea(d.D / 2, h) * (d.L - 2 * d.E) + (d.E / (d.D / 2)) * sphereCapVolume(d.D / 2, h) },
    // Dished bowl, opening upward: a spherical cap with base diameter D and depth E (E = D/2 is a full hemisphere).
    dishBowl: { dims: ['D', 'E'], maxDepth: d => d.E,
      check: d => d.E > d.D / 2 * (1 + 1e-12) ? { k: 'E', e: 'depthExceedsRadius' } : null,
      total: d => PI * d.E * (3 * (d.D / 2) ** 2 + d.E * d.E) / 6,
      partial: (d, h) => { const R = ((d.D / 2) ** 2 + d.E * d.E) / (2 * d.E); return PI * h * h * (3 * R - h) / 3; } },
    // Vertical tank with a conical bottom (apex down), cylindrical shell and an optional embossed (half-ellipsoid) top of depth E.
    coneBottom: { dims: ['D', 'Hc', 'Hs'], opt: ['E'], maxDepth: d => d.Hc + d.Hs + (d.E || 0),
      check: d => d.E > d.D / 2 * (1 + 1e-12) ? { k: 'E', e: 'depthExceedsRadius' } : null,
      total: d => PI * (d.D / 2) ** 2 * (d.Hc / 3 + d.Hs + 2 / 3 * (d.E || 0)),
      partial: (d, h) => { const A = PI * (d.D / 2) ** 2, E = d.E || 0;
        if (h <= d.Hc) return A * h ** 3 / (3 * d.Hc * d.Hc);
        if (h <= d.Hc + d.Hs) return A * d.Hc / 3 + A * (h - d.Hc);
        const z = Math.min(h - d.Hc - d.Hs, E); return A * d.Hc / 3 + A * d.Hs + A * (z - z ** 3 / (3 * E * E)); } },
  };

  /** Validate SI dims (metres) and optional fill depth. Returns { field: errorKey }. */
  function validateDimensions(shapeId, d, depth) {
    const s = SHAPES[shapeId], errors = {};
    if (!s) return { shape: 'unknownShape' };
    s.dims.forEach(k => {
      const v = d[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) errors[k] = 'notNumber';
      else if (v <= 0) errors[k] = 'mustBePositive';
    });
    (s.opt || []).forEach(k => { const v = d[k]; if (v != null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0)) errors[k] = 'notNumber'; });
    if (!Object.keys(errors).length && s.check) { const bad = s.check(d); if (bad) errors[bad.k] = bad.e; }
    if (depth != null) {
      if (!Number.isFinite(depth) || depth < 0) errors.depth = 'invalidDepth';
      else if (!Object.keys(errors).length && depth > s.maxDepth(d) * (1 + 1e-12)) errors.depth = 'depthExceedsHeight';
    }
    return errors;
  }

  /** Convert {key: {value, unit}} to metres. Never reinterprets keys. Non-numeric stays NaN. */
  function normalizeDimensions(input) {
    const out = {};
    Object.keys(input).forEach(k => {
      const { value, unit } = input[k];
      out[k] = typeof value === 'number' && LENGTH_TO_M[unit] ? value * LENGTH_TO_M[unit] : NaN;
    });
    return out;
  }

  function calculateTotalVolume(shapeId, d) { return SHAPES[shapeId].total(d); }
  function calculatePartialFillVolume(shapeId, d, depth) {
    const s = SHAPES[shapeId], max = s.maxDepth(d);
    if (depth <= 0) return 0;
    if (depth >= max) return s.total(d);          // explicit full case
    return Math.min(s.partial(d, depth), s.total(d));
  }

  /** One-call API for the UI. Returns { ok, errors, totalM3, filledM3 }. Depth in metres, or null for full. */
  function calculate(shapeId, d, depth = null) {
    const errors = validateDimensions(shapeId, d, depth);
    if (Object.keys(errors).length) return { ok: false, errors };
    const totalM3 = calculateTotalVolume(shapeId, d);
    const filledM3 = depth == null ? totalM3 : calculatePartialFillVolume(shapeId, d, depth);
    return { ok: true, errors: {}, totalM3, filledM3 };
  }


  /** Circular segment of radius r filled to depth h: central angle (rad) and area, 0 <= h <= 2r. */
  function segment(r, h) {
    const theta = 2 * Math.acos(Math.max(-1, Math.min(1, (r - h) / r)));
    return { theta, seg: 0.5 * r * r * (theta - Math.sin(theta)) };
  }

  /**
   * Numeric intermediates (SI) behind a result, so the UI can show the working with the user's own numbers.
   * Every figure here is tested to add up to calculate() (see tests). Returns null for unknown shapes.
   */
  function workings(shapeId, d, depth) {
    const s = SHAPES[shapeId]; if (!s) return null;
    const f = Math.max(0, Math.min(depth, s.maxDepth(d)));
    const w = { f, total: s.total(d), filled: calculatePartialFillVolume(shapeId, d, f) };
    switch (shapeId) {
      case 'horizontalCylinder': w.r = d.D / 2; Object.assign(w, segment(w.r, f)); break;
      case 'verticalCylinder': w.r = d.D / 2; w.base = PI * w.r * w.r; break;
      case 'rectangular': { w.R = d.R || 0; w.base = d.L * d.W;
        w.loss = cornerLoss(w.R, Math.min(f, w.R)); w.lossTop = f > d.H - w.R ? cornerLoss(w.R, w.R) - cornerLoss(w.R, d.H - f) : 0;
        w.area = roundedRectFill(d.W, d.H, w.R, f); w.profile = d.W * d.H - (4 - PI) * w.R * w.R; break; }
      case 'sphere': w.r = d.D / 2; w.cap = PI * f * f * (3 * w.r - f) / 3; break;
      case 'ellipse': {
        w.a = d.W / 2; w.b = d.H / 2; w.t = Math.max(-1, Math.min(1, (w.b - f) / w.b));
        w.area = w.a * w.b * (Math.acos(w.t) - w.t * Math.sqrt(1 - w.t * w.t)); break; }
      case 'stadium':
        w.r = d.H / 2; w.a = d.W - d.H; Object.assign(w, segment(w.r, f)); w.rect = w.a * Math.min(f, d.H); w.area = w.seg + w.rect; break;
      case 'capsuleHorizontal':
        w.r = d.D / 2; w.a = d.Lc; Object.assign(w, segment(w.r, f)); w.cyl = w.seg * w.a; w.cap = PI * f * f * (3 * w.r - f) / 3; break;
      case 'ellipsoidalHeadsHorizontal':
        w.r = d.D / 2; w.a = d.L - 2 * d.E; w.E = d.E; Object.assign(w, segment(w.r, f)); w.cyl = w.seg * w.a; w.cap = PI * f * f * (3 * w.r - f) / 3; w.heads = w.cap * d.E / w.r; break;
      case 'dishBowl': w.a = d.D / 2; w.R = (w.a * w.a + d.E * d.E) / (2 * d.E); w.cap = PI * f * f * (3 * w.R - f) / 3; break;
      case 'coneBottom': { w.r = d.D / 2; w.base = PI * w.r * w.r; w.E = d.E || 0; const A = w.base;
        w.coneFull = A * d.Hc / 3; w.part = f <= d.Hc ? 'cone' : (f <= d.Hc + d.Hs ? 'shell' : 'top');
        w.cone = f <= d.Hc ? A * f ** 3 / (3 * d.Hc * d.Hc) : w.coneFull;
        w.shell = f <= d.Hc ? 0 : A * (Math.min(f, d.Hc + d.Hs) - d.Hc);
        w.z = Math.max(0, f - d.Hc - d.Hs); w.top = w.E > 0 && w.z > 0 ? A * (w.z - w.z ** 3 / (3 * w.E * w.E)) : 0; break; }
    }
    return w;
  }

  return { LENGTH_TO_M, M3_TO, SHAPES, convertLength, convertVolume, circleSegmentArea, ellipseSegmentArea,
    sphereCapVolume, spellArea, normalizeDimensions, validateDimensions, calculateTotalVolume,
    calculatePartialFillVolume, calculate, workings, roundedRectFill, cornerLoss };
});
