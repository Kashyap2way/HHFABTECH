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

  // ---- Shape registry: dims in metres. total(d) and partial(d,h) return m³; depth h from the bottom. ----
  const SHAPES = {
    horizontalCylinder: { dims: ['D', 'L'], maxDepth: d => d.D,
      total: d => PI * (d.D / 2) ** 2 * d.L,
      partial: (d, h) => circleSegmentArea(d.D / 2, h) * d.L },
    verticalCylinder: { dims: ['D', 'H'], maxDepth: d => d.H,
      total: d => PI * (d.D / 2) ** 2 * d.H,
      partial: (d, h) => PI * (d.D / 2) ** 2 * h },
    rectangular: { dims: ['L', 'W', 'H'], maxDepth: d => d.H,
      total: d => d.L * d.W * d.H,
      partial: (d, h) => d.L * d.W * h },
    sphere: { dims: ['D'], maxDepth: d => d.D,
      total: d => (4 / 3) * PI * (d.D / 2) ** 3,
      partial: (d, h) => sphereCapVolume(d.D / 2, h) },
    // True ellipse cross-section: W = full horizontal axis, H = full vertical axis.
    ellipse: { dims: ['W', 'H', 'L'], maxDepth: d => d.H,
      total: d => PI * (d.W / 2) * (d.H / 2) * d.L,
      partial: (d, h) => ellipseSegmentArea(d.W / 2, d.H / 2, h) * d.L },
    // Stadium: flat top/bottom, semicircular left/right ends of diameter H. Requires W >= H.
    stadium: { dims: ['W', 'H', 'L'], maxDepth: d => d.H, check: d => d.W >= d.H ? null : 'W',
      total: d => ((d.W - d.H) * d.H + PI * d.H * d.H / 4) * d.L,
      partial: (d, h) => ((d.W - d.H) * Math.min(h, d.H) + circleSegmentArea(d.H / 2, h)) * d.L },
    // Capsule: Lc is the straight section only; hemispherical ends add exactly one sphere (no double count).
    capsuleHorizontal: { dims: ['D', 'Lc'], maxDepth: d => d.D,
      total: d => PI * (d.D / 2) ** 2 * d.Lc + (4 / 3) * PI * (d.D / 2) ** 3,
      partial: (d, h) => circleSegmentArea(d.D / 2, h) * d.Lc + sphereCapVolume(d.D / 2, h) },
    // Horizontal shell with 2:1 ellipsoidal heads (head depth = D/4 each). Ls = straight shell, heads excluded.
    ellipsoidalHeadsHorizontal: { dims: ['D', 'Ls'], maxDepth: d => d.D,
      total: d => PI * (d.D / 2) ** 2 * d.Ls + (4 / 3) * PI * (d.D / 2) ** 2 * (d.D / 4),
      // Two heads = oblate spheroid = sphere cap volume scaled along the axis by (D/4)/(D/2) = 1/2.
      partial: (d, h) => circleSegmentArea(d.D / 2, h) * d.Ls + 0.5 * sphereCapVolume(d.D / 2, h) },
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
    if (!Object.keys(errors).length && s.check) { const bad = s.check(d); if (bad) errors[bad] = 'widthLessThanHeight'; }
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

  return { LENGTH_TO_M, M3_TO, SHAPES, convertLength, convertVolume, circleSegmentArea, ellipseSegmentArea,
    sphereCapVolume, spellArea, normalizeDimensions, validateDimensions, calculateTotalVolume,
    calculatePartialFillVolume, calculate };
});
