/**
 * Closed-form volumes for the non-profile shapes. Everything here is in METRES / m³
 * and depth is measured from the bottom. Ported from the legacy geometry.js engine.
 */

const PI = Math.PI;
export type Dims = Record<string, number>;

export function circleSegmentArea(r: number, h: number): number {
  if (h <= 0) return 0;
  if (h >= 2 * r) return PI * r * r;
  return (
    r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(2 * r * h - h * h)
  );
}

export function sphereCapVolume(r: number, h: number): number {
  if (h <= 0) return 0;
  if (h >= 2 * r) return (4 / 3) * PI * r ** 3;
  return PI * h * h * (r - h / 3);
}

/** Area (m²) between a square corner and its rounding arc of radius R, up to height y. */
function cornerLoss(R: number, y: number): number {
  if (y <= 0 || R <= 0) return 0;
  if (y >= R) return (1 - PI / 4) * R * R;
  const u = R - y;
  return (
    R * y -
    ((PI * R * R) / 4 -
      ((u * Math.sqrt(R * R - u * u)) / 2 + ((R * R) / 2) * Math.asin(u / R)))
  );
}

/** Liquid area of a W×H rectangle with four rounded corners of radius R, filled to depth h. */
function roundedRectFill(W: number, H: number, R: number, h: number): number {
  if (h <= 0) return 0;
  if (h >= H) return W * H - (4 - PI) * R * R;
  const top = h > H - R ? cornerLoss(R, R) - cornerLoss(R, H - h) : 0;
  return W * h - 2 * cornerLoss(R, Math.min(h, R)) - 2 * top;
}

export type SolidShape = {
  /** Required dimension keys */
  dims: readonly string[];
  /** Optional dimension keys (0 / absent = off) */
  opt?: readonly string[];
  maxDepth: (d: Dims) => number;
  check?: (d: Dims) => { key: string; message: string } | null;
  total: (d: Dims) => number;
  partial: (d: Dims, h: number) => number;
};

export const SOLIDS = {
  verticalCylinder: {
    dims: ["D", "H"],
    maxDepth: (d) => d.H,
    total: (d) => PI * (d.D / 2) ** 2 * d.H,
    partial: (d, h) => PI * (d.D / 2) ** 2 * h,
  },
  rectangular: {
    dims: ["L", "W", "H"],
    opt: ["R"],
    maxDepth: (d) => d.H,
    check: (d) =>
      (d.R ?? 0) > (Math.min(d.W, d.H) / 2) * (1 + 1e-12)
        ? {
            key: "R",
            message: "Corner radius is too large for this width and height.",
          }
        : null,
    total: (d) => d.L * (d.W * d.H - (4 - PI) * (d.R ?? 0) ** 2),
    partial: (d, h) => d.L * roundedRectFill(d.W, d.H, d.R ?? 0, h),
  },
  sphere: {
    dims: ["D"],
    maxDepth: (d) => d.D,
    total: (d) => (4 / 3) * PI * (d.D / 2) ** 3,
    partial: (d, h) => sphereCapVolume(d.D / 2, h),
  },
  stadium: {
    dims: ["W", "H", "L"],
    maxDepth: (d) => d.H,
    check: (d) =>
      d.W >= d.H
        ? null
        : { key: "W", message: "Width must be at least the height." },
    total: (d) => ((d.W - d.H) * d.H + (PI * d.H * d.H) / 4) * d.L,
    partial: (d, h) =>
      ((d.W - d.H) * Math.min(h, d.H) + circleSegmentArea(d.H / 2, h)) * d.L,
  },
  capsuleHorizontal: {
    dims: ["D", "Lc"],
    maxDepth: (d) => d.D,
    total: (d) => PI * (d.D / 2) ** 2 * d.Lc + (4 / 3) * PI * (d.D / 2) ** 3,
    partial: (d, h) =>
      circleSegmentArea(d.D / 2, h) * d.Lc + sphereCapVolume(d.D / 2, h),
  },
  ellipsoidalHeadsHorizontal: {
    dims: ["D", "L", "E"],
    maxDepth: (d) => d.D,
    check: (d) =>
      d.E > (d.D / 2) * (1 + 1e-12)
        ? { key: "E", message: "Dish depth cannot exceed the radius." }
        : d.L > 2 * d.E
          ? null
          : {
              key: "L",
              message: "Length must be more than twice the dish depth.",
            },
    total: (d) =>
      PI * (d.D / 2) ** 2 * (d.L - 2 * d.E) +
      (4 / 3) * PI * (d.D / 2) ** 2 * d.E,
    partial: (d, h) =>
      circleSegmentArea(d.D / 2, h) * (d.L - 2 * d.E) +
      (d.E / (d.D / 2)) * sphereCapVolume(d.D / 2, h),
  },
  dishBowl: {
    dims: ["D", "E"],
    maxDepth: (d) => d.E,
    check: (d) =>
      d.E > (d.D / 2) * (1 + 1e-12)
        ? { key: "E", message: "Dish depth cannot exceed half the diameter." }
        : null,
    total: (d) => (PI * d.E * (3 * (d.D / 2) ** 2 + d.E * d.E)) / 6,
    partial: (d, h) => {
      const R = ((d.D / 2) ** 2 + d.E * d.E) / (2 * d.E);
      return (PI * h * h * (3 * R - h)) / 3;
    },
  },
  coneBottom: {
    dims: ["D", "Hc", "Hs"],
    opt: ["E"],
    maxDepth: (d) => d.Hc + d.Hs + (d.E ?? 0),
    check: (d) =>
      (d.E ?? 0) > (d.D / 2) * (1 + 1e-12)
        ? { key: "E", message: "Dish depth cannot exceed the radius." }
        : null,
    total: (d) =>
      PI * (d.D / 2) ** 2 * (d.Hc / 3 + d.Hs + (2 / 3) * (d.E ?? 0)),
    partial: (d, h) => {
      const A = PI * (d.D / 2) ** 2;
      const E = d.E ?? 0;
      if (h <= d.Hc) return (A * h ** 3) / (3 * d.Hc * d.Hc);
      if (h <= d.Hc + d.Hs) return (A * d.Hc) / 3 + A * (h - d.Hc);
      const z = Math.min(h - d.Hc - d.Hs, E);
      return (A * d.Hc) / 3 + A * d.Hs + A * (z - z ** 3 / (3 * E * E));
    },
  },
} as const satisfies Record<string, SolidShape>;

export type SolidId = keyof typeof SOLIDS;
