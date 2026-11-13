/**
 * Shape outlines used by BOTH the 2D preview and the 3D model, so they can never disagree.
 * Coordinates are millimetres, y points up, and the polygon is centred on x = 0 (y starts at 0 for revolved profiles).
 */
import type { Dims } from "./geometry";
import { spellParts } from "./profile";
import type { ShapeId } from "./shapes";

export type Pt = [number, number];

const TAU = Math.PI * 2;

export function ellipsePts(rx: number, ry: number, n = 96): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    return [Math.cos(a) * rx, Math.sin(a) * ry] as Pt;
  });
}

/** Flat top/bottom with semicircular ends. Requires W >= H. */
export function stadiumPts(W: number, H: number, n = 32): Pt[] {
  const r = H / 2;
  const hx = Math.max(0, W / 2 - r);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI;
    pts.push([hx + Math.cos(a) * r, Math.sin(a) * r]);
  }
  for (let i = 0; i <= n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI;
    pts.push([-hx + Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

export function roundedRectPts(W: number, H: number, R: number, n = 10): Pt[] {
  const r = Math.max(0, Math.min(R, W / 2, H / 2));
  if (r === 0) {
    return [
      [-W / 2, -H / 2],
      [W / 2, -H / 2],
      [W / 2, H / 2],
      [-W / 2, H / 2],
    ];
  }
  const pts: Pt[] = [];
  const corners: Array<[number, number, number]> = [
    [W / 2 - r, -H / 2 + r, -Math.PI / 2],
    [W / 2 - r, H / 2 - r, 0],
    [-W / 2 + r, H / 2 - r, Math.PI / 2],
    [-W / 2 + r, -H / 2 + r, Math.PI],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  return pts;
}

/**
 * HH FABTECH "Spell" outline: a central Rw x Rh rectangle plus four circular-arc blends,
 * with `bend` radius rounded corners. Clockwise, centred on the origin.
 */
export function spellPts(
  W: number,
  H: number,
  Rw: number,
  Rh: number,
  bend: number,
): Pt[] {
  const p = spellParts(W, H, Rw, Rh, bend);
  if (!p.valid) return roundedRectPts(W, H, bend);
  const { h1, h2 } = p;
  const r1 = h1 > 0 ? (Rw * Rw + 4 * h1 * h1) / (8 * h1) : 0;
  const r2 = h2 > 0 ? (Rh * Rh + 4 * h2 * h2) / (8 * h2) : 0;
  const cap = (r: number, h: number, t: number) =>
    h > 0 ? Math.max(0, Math.sqrt(Math.max(0, r * r - t * t)) - (r - h)) : 0;

  const n = 48;
  const top: Pt[] = [];
  const right: Pt[] = [];
  const bottom: Pt[] = [];
  const left: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Rw / 2 + (Rw * i) / n;
    const b = Rh / 2 - (Rh * i) / n;
    const ar = Rw / 2 - (Rw * i) / n;
    const bl = -Rh / 2 + (Rh * i) / n;
    top.push([a, Rh / 2 + cap(r1, h1, a)]);
    right.push([Rw / 2 + cap(r2, h2, b), b]);
    bottom.push([ar, -Rh / 2 - cap(r1, h1, ar)]);
    left.push([-Rw / 2 - cap(r2, h2, bl), bl]);
  }
  const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const trim = (s: Pt[]) => {
    let i = 0;
    let j = s.length - 1;
    while (i < j - 2 && dist(s[i], s[0]) < bend) i++;
    while (j > i + 2 && dist(s[j], s[s.length - 1]) < bend) j--;
    return s.slice(i, j + 1);
  };
  const segs = [top, right, bottom, left];
  const trimmed = segs.map(trim);
  const corners = segs.map((s) => s[s.length - 1]);

  const out: Pt[] = [];
  trimmed.forEach((seg, k) => {
    out.push(...seg);
    const from = seg[seg.length - 1];
    const to = trimmed[(k + 1) % 4][0];
    const c = corners[k];
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      const u = 1 - t;
      out.push([
        u * u * from[0] + 2 * u * t * c[0] + t * t * to[0],
        u * u * from[1] + 2 * u * t * c[1] + t * t * to[1],
      ]);
    }
  });
  return out;
}

/** Centre a polygon so its bounding box sits on the origin. */
function centre(pts: Pt[]): Pt[] {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return pts.map(([x, y]) => [x - cx, y - cy]);
}

/** Cross-section outline for extruded (horizontal prismatic) tanks. */
export function crossSectionPts(shape: ShapeId, d: Dims): Pt[] | null {
  switch (shape) {
    case "spell":
      return centre(spellPts(d.W, d.H, d.Rw, d.Rh, d.bend ?? 70));
    case "circle":
      return ellipsePts(d.D / 2, d.D / 2);
    case "oval":
      return ellipsePts(d.W / 2, d.H / 2);
    case "rectangular":
      return roundedRectPts(d.W, d.H, d.R ?? 0);
    case "stadium":
      return stadiumPts(d.W, d.H);
    default:
      return null;
  }
}

/**
 * Half-profile of a solid of revolution as (radius, axial) points from the bottom axis point
 * to the top axis point. The axis is vertical for upright tanks and horizontal for capsule/heads.
 */
export function latheProfile(shape: ShapeId, d: Dims): Pt[] | null {
  const arc = (n: number, f: (t: number) => Pt) =>
    Array.from({ length: n + 1 }, (_, i) => f(i / n));
  switch (shape) {
    case "verticalCylinder": {
      const R = d.D / 2;
      return [
        [0, 0],
        [R, 0],
        [R, d.H],
        [0, d.H],
      ];
    }
    case "sphere": {
      const R = d.D / 2;
      return arc(48, (t) => {
        const a = -Math.PI / 2 + t * Math.PI;
        return [Math.cos(a) * R, R + Math.sin(a) * R];
      });
    }
    case "coneBottom": {
      const R = d.D / 2;
      const E = d.E ?? 0;
      const base = d.Hc + d.Hs;
      const pts: Pt[] = [
        [0, 0],
        [R, d.Hc],
        [R, base],
      ];
      if (E > 0)
        pts.push(
          ...arc(
            24,
            (t) =>
              [
                Math.cos(t * (Math.PI / 2)) * R,
                base + Math.sin(t * (Math.PI / 2)) * E,
              ] as Pt,
          ).slice(1),
        );
      else pts.push([0, base]);
      return pts;
    }
    case "dishBowl": {
      const R = d.D / 2;
      const E = Math.min(d.E, R);
      const Rs = (R * R + E * E) / (2 * E);
      const maxA = Math.asin(Math.min(1, R / Rs));
      const pts = arc(
        36,
        (t) => [Rs * Math.sin(t * maxA), Rs * (1 - Math.cos(t * maxA))] as Pt,
      );
      pts.push([0, E]);
      return pts;
    }
    case "capsuleHorizontal": {
      const R = d.D / 2;
      const left = arc(24, (t) => {
        const a = -Math.PI / 2 + t * (Math.PI / 2);
        return [Math.cos(a) * R, R + Math.sin(a) * R] as Pt;
      });
      const right = arc(24, (t) => {
        const a = t * (Math.PI / 2);
        return [Math.cos(a) * R, R + d.Lc + Math.sin(a) * R] as Pt;
      });
      return [...left, ...right.slice(1)];
    }
    case "ellipsoidalHeadsHorizontal": {
      const R = d.D / 2;
      const E = d.E;
      const left = arc(24, (t) => {
        const a = -Math.PI / 2 + t * (Math.PI / 2);
        return [Math.cos(a) * R, E + Math.sin(a) * E] as Pt;
      });
      const right = arc(24, (t) => {
        const a = t * (Math.PI / 2);
        return [Math.cos(a) * R, d.L - E + Math.sin(a) * E] as Pt;
      });
      return [...left, ...right.slice(1)];
    }
    default:
      return null;
  }
}

/** True when the lathe axis lies along X (tank lying on its side). */
export const isHorizontalLathe = (shape: ShapeId) =>
  shape === "capsuleHorizontal" || shape === "ellipsoidalHeadsHorizontal";

/**
 * The silhouette the 2D preview draws. The fill level is measured upward from the lowest point,
 * which is the fill depth for every shape: a cross-section for prismatic tanks, a side
 * elevation for the others.
 */
export function viewPolygon(shape: ShapeId, d: Dims): Pt[] | null {
  const cs = crossSectionPts(shape, d);
  if (cs) return cs;
  const half = latheProfile(shape, d);
  if (!half) return null;
  if (isHorizontalLathe(shape)) {
    const length = half[half.length - 1][1];
    const upper = half.map(([r, a]) => [a - length / 2, r] as Pt);
    const lower = [...half]
      .reverse()
      .map(([r, a]) => [a - length / 2, -r] as Pt);
    return [...upper, ...lower];
  }
  const right = half.map(([r, a]) => [r, a] as Pt);
  const left = [...half].reverse().map(([r, a]) => [-r, a] as Pt);
  return [...right, ...left];
}

export function bounds(pts: readonly Pt[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

/** Shoelace area of a polygon (mm²). */
export function polygonArea(pts: readonly Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Perimeter of a closed polygon (mm). */
export function polygonPerimeter(pts: readonly Pt[]): number {
  let p = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    p += Math.hypot(x2 - x1, y2 - y1);
  }
  return p;
}
