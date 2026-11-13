/**
 * Horizontal tanks defined by a cross-section profile: Spell (HH FABTECH truck
 * profile), Circle and Oval, optionally with embossed (dished) ends.
 * Ported from the legacy calculator. ALL values are millimetres / mm².
 */

export type ProfileShape = "spell" | "circle" | "oval";

export type ProfileCfg = {
  shape: ProfileShape;
  /** Straight shell length */
  L: number;
  /** Overall width (circle: diameter) */
  W: number;
  /** Overall height (circle: diameter) */
  H: number;
  /** Spell: central rectangle width / height */
  Rw: number;
  Rh: number;
  /** Spell: corner bend radius (default 70 mm) */
  bend: number;
  /** Emboss (dish) depth per end; 0 = no dish ends */
  E: number;
};

/** HH FABTECH reference Spell profile (mm) used to derive Rw / Rh from W / H. */
export const SPELL_REF = {
  W: 2400,
  H: 1830,
  Rw: 1930,
  Rh: 1475,
  bend: 70,
} as const;
export const DEFAULT_EMBOSS_MM = 150;

/** Circular segment area for a chord c and rise h. */
function segmentArea(c: number, h: number): number {
  if (c <= 0 || h <= 0) return 0;
  const r = (c * c + 4 * h * h) / (8 * h);
  const q = Math.max(-1, Math.min(1, (r - h) / r));
  return r * r * Math.acos(q) - ((r - h) * c) / 2;
}

export type SpellParts = {
  valid: boolean;
  area: number;
  raw: number;
  rect: number;
  top: number;
  side: number;
  fillet: number;
  h1: number;
  h2: number;
};

export function spellParts(
  W: number,
  H: number,
  Rw: number,
  Rh: number,
  bend: number,
): SpellParts {
  const h1 = (H - Rh) / 2;
  const h2 = (W - Rw) / 2;
  if (
    !(W > 0 && H > 0 && Rw > 0 && Rh > 0) ||
    Rw > W ||
    Rh > H ||
    h1 < 0 ||
    h2 < 0
  ) {
    return {
      valid: false,
      area: Number.NaN,
      raw: Number.NaN,
      rect: 0,
      top: 0,
      side: 0,
      fillet: 0,
      h1,
      h2,
    };
  }
  const rect = Rw * Rh;
  const top = 2 * segmentArea(Rw, h1);
  const side = 2 * segmentArea(Rh, h2);
  const fillet = (4 - Math.PI) * bend * bend;
  return {
    valid: true,
    area: rect + top + side - fillet,
    raw: rect + top + side,
    rect,
    top,
    side,
    fillet,
    h1,
    h2,
  };
}

/** Half-width of the Spell outline at height y (0 = bottom). */
function spellHalf(
  y: number,
  H: number,
  Rw: number,
  Rh: number,
  h1: number,
  h2: number,
): number {
  if (y < 0 || y > H) return 0;
  const cap = (r: number, t: number) => Math.sqrt(Math.max(0, r * r - t * t));
  if (h1 > 0) {
    const r1 = (Rw * Rw + 4 * h1 * h1) / (8 * h1);
    if (y < h1) return cap(r1, r1 - y);
    if (y > H - h1) return cap(r1, r1 - (H - y));
  }
  let s = 0;
  if (h2 > 0) {
    const r2 = (Rh * Rh + 4 * h2 * h2) / (8 * h2);
    s = Math.max(0, cap(r2, y - H / 2) - (r2 - h2));
  }
  return Rw / 2 + s;
}

export function sectionArea(c: ProfileCfg): number {
  if (c.shape === "circle") return Math.PI * (c.H / 2) ** 2;
  if (c.shape === "oval") return Math.PI * (c.W / 2) * (c.H / 2);
  return spellParts(c.W, c.H, c.Rw, c.Rh, c.bend).area;
}

export function isProfileValid(c: ProfileCfg): boolean {
  if (!(c.L > 0 && c.H > 0)) return false;
  if (c.shape === "circle") return true;
  if (!(c.W > 0)) return false;
  return c.shape === "oval" || spellParts(c.W, c.H, c.Rw, c.Rh, c.bend).valid;
}

/** Developed arc length for a chord c and rise h. */
function arcLen(c: number, h: number): number {
  if (c <= 0 || h <= 0) return c;
  const r = (c * c + 4 * h * h) / (8 * h);
  return r * 2 * Math.acos(Math.max(-1, Math.min(1, (r - h) / r)));
}

/** Profile perimeter (mm). Oval uses Ramanujan's approximation. */
export function perimeter(c: ProfileCfg): number {
  if (c.shape === "circle") return Math.PI * c.H;
  if (c.shape === "oval") {
    const a = c.W / 2;
    const b = c.H / 2;
    return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  }
  const p = spellParts(c.W, c.H, c.Rw, c.Rh, c.bend);
  if (!p.valid) return Number.NaN;
  return (
    2 * arcLen(c.Rw, p.h1) + 2 * arcLen(c.Rh, p.h2) - (8 - 2 * Math.PI) * c.bend
  );
}

/** Liquid cross-section area (mm²) when filled to `depth` from the bottom. */
export function fillArea(c: ProfileCfg, depth: number): number {
  const h = Math.max(0, Math.min(depth, c.H));
  if (h <= 0) return 0;
  if (c.shape === "circle") {
    const r = c.H / 2;
    if (h >= c.H) return Math.PI * r * r;
    return (
      r * r * Math.acos((r - h) / r) -
      (r - h) * Math.sqrt(Math.max(0, 2 * r * h - h * h))
    );
  }
  let half: (y: number) => number;
  let k = 1;
  if (c.shape === "oval") {
    const a = c.W / 2;
    const b = c.H / 2;
    half = (y) => a * Math.sqrt(Math.max(0, 1 - ((y - b) / b) ** 2));
  } else {
    const p = spellParts(c.W, c.H, c.Rw, c.Rh, c.bend);
    if (!p.valid) return 0;
    half = (y) => spellHalf(y, c.H, c.Rw, c.Rh, p.h1, p.h2);
    k = p.area / p.raw; // fillet correction
  }
  const n = 600;
  const st = h / n;
  let s = half(0) + half(h);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * half(i * st);
  return ((2 * s * st) / 3) * k;
}

/** Liquid in ONE dished end at fill depth h. Each end is a half-ellipsoid-like cap. */
function dishFilled(c: ProfileCfg, h: number): number {
  const E = c.E;
  if (!(E > 0) || !(h > 0)) return 0;
  const N = 48;
  let s = 0;
  for (let i = 0; i <= N; i++) {
    const x = i / N;
    const t = 1 - x * x;
    const sc = t > 0 ? Math.sqrt(t) : 0;
    const a =
      sc > 1e-9 ? sc * sc * fillArea(c, (h - (c.H * (1 - sc)) / 2) / sc) : 0;
    s += (i === 0 || i === N ? 1 : i % 2 ? 4 : 2) * a;
  }
  return (s * (E / N)) / 3;
}

/** Total capacity (mm³) = A × (L + 4E/3). */
export function totalVolume(c: ProfileCfg): number {
  return sectionArea(c) * (c.L + (4 / 3) * c.E);
}

/** Liquid volume (mm³) at `depth`, including both dished ends. */
export function filledVolume(c: ProfileCfg, depth: number): number {
  return fillArea(c, depth) * c.L + 2 * dishFilled(c, depth);
}

export function straightVolume(c: ProfileCfg): number {
  return sectionArea(c) * c.L;
}

export function dishVolume(c: ProfileCfg): number {
  return sectionArea(c) * (4 / 3) * c.E;
}
