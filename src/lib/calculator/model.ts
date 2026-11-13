/**
 * One API over all 11 shapes. Everything is in millimetres / mm³ unless a name says otherwise.
 * The UI never touches the shape-specific maths; it calls these functions.
 */
import { type Dims, SOLIDS, type SolidId, type SolidShape } from "./geometry";
import {
  dishVolume,
  filledVolume,
  isProfileValid,
  type ProfileCfg,
  type ProfileShape,
  perimeter,
  sectionArea,
  spellParts,
  straightVolume,
  totalVolume,
} from "./profile";
import { SHAPE_BY_ID, type ShapeId } from "./shapes";
import { MM3_PER_LITRE } from "./units";

export type TankInput = {
  shape: ShapeId;
  /** All keys in mm: L, W, H, D, Lc, E, R, Hc, Hs, Rw, Rh, bend */
  dims: Dims;
};

const isProfileShape = (s: ShapeId): s is ProfileShape =>
  s === "spell" || s === "circle" || s === "oval";

export function profileCfg(input: TankInput): ProfileCfg {
  const d = input.dims;
  const shape = input.shape as ProfileShape;
  const round = shape === "circle";
  return {
    shape,
    L: d.L ?? 0,
    W: round ? (d.D ?? 0) : (d.W ?? 0),
    H: round ? (d.D ?? 0) : (d.H ?? 0),
    Rw: d.Rw ?? 0,
    Rh: d.Rh ?? 0,
    bend: d.bend ?? 70,
    E: d.E ?? 0,
  };
}

/** Solids work in metres. */
const toMetres = (d: Dims): Dims =>
  Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v / 1000]));

export type Validation = { ok: boolean; errors: Record<string, string> };

export function validate(input: TankInput): Validation {
  const meta = SHAPE_BY_ID[input.shape];
  const errors: Record<string, string> = {};
  for (const f of meta.fields) {
    const v = input.dims[f.key];
    if (!(typeof v === "number" && Number.isFinite(v) && v > 0))
      errors[f.key] = "Enter a value greater than 0.";
  }
  if (meta.option?.field && (input.dims[meta.option.key] ?? 0) < 0)
    errors[meta.option.key] = "Cannot be negative.";
  if (Object.keys(errors).length) return { ok: false, errors };

  if (isProfileShape(input.shape)) {
    const c = profileCfg(input);
    if (
      input.shape === "spell" &&
      !spellParts(c.W, c.H, c.Rw, c.Rh, c.bend).valid
    ) {
      errors.Rw = "Rw and Rh must fit inside the overall width and height.";
    } else if (!isProfileValid(c)) {
      errors.L = "Check the dimensions.";
    }
  } else {
    const solid: SolidShape = SOLIDS[input.shape as SolidId];
    const bad = solid.check?.(toMetres(input.dims));
    if (bad) errors[bad.key] = bad.message;
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/** Total capacity (mm³). */
export function totalMm3(input: TankInput): number {
  if (isProfileShape(input.shape)) return totalVolume(profileCfg(input));
  return SOLIDS[input.shape as SolidId].total(toMetres(input.dims)) * 1e9;
}

/** Tallest fill depth (mm) = height of the liquid space. */
export function maxDepthMm(input: TankInput): number {
  if (isProfileShape(input.shape)) return profileCfg(input).H;
  return SOLIDS[input.shape as SolidId].maxDepth(toMetres(input.dims)) * 1000;
}

/** Liquid volume (mm³) at a fill depth measured from the bottom. */
export function filledMm3(input: TankInput, depthMm: number): number {
  const max = maxDepthMm(input);
  const h = Math.max(0, Math.min(depthMm, max));
  if (h <= 0) return 0;
  if (h >= max) return totalMm3(input);
  let v: number;
  if (isProfileShape(input.shape)) v = filledVolume(profileCfg(input), h);
  else
    v =
      SOLIDS[input.shape as SolidId].partial(toMetres(input.dims), h / 1000) *
      1e9;
  return Math.min(v, totalMm3(input));
}

/** Fill depth (mm) that holds `targetMm3`. Volume is monotonic in depth, so bisect. */
export function depthForMm3(input: TankInput, targetMm3: number): number {
  const total = totalMm3(input);
  const max = maxDepthMm(input);
  if (targetMm3 <= 0) return 0;
  if (targetMm3 >= total) return max;
  let lo = 0;
  let hi = max;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (filledMm3(input, mid) < targetMm3) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type FillSpec =
  | { mode: "depth"; kind: "percent"; percent: number }
  | { mode: "depth"; kind: "length"; depthMm: number }
  | { mode: "volume"; litres: number };

export type CalcResult = {
  capacityL: number;
  filledL: number;
  fillPercent: number;
  depthMm: number;
  maxDepthMm: number;
  /** Cross-section extras for profile shapes */
  areaMm2?: number;
  perimeterMm?: number;
  straightL?: number;
  dishL?: number;
};

export function calculate(input: TankInput, fill: FillSpec): CalcResult {
  const total = totalMm3(input);
  const max = maxDepthMm(input);
  let depth: number;
  let filled: number;
  if (fill.mode === "volume") {
    filled = Math.max(0, Math.min(total, fill.litres * MM3_PER_LITRE));
    depth = depthForMm3(input, filled);
  } else if (fill.kind === "percent") {
    const pct = Math.max(0, Math.min(100, fill.percent));
    filled = (total * pct) / 100;
    depth = depthForMm3(input, filled);
  } else {
    depth = Math.max(0, Math.min(max, fill.depthMm));
    filled = filledMm3(input, depth);
  }
  const out: CalcResult = {
    capacityL: total / MM3_PER_LITRE,
    filledL: filled / MM3_PER_LITRE,
    fillPercent: total ? (filled / total) * 100 : 0,
    depthMm: depth,
    maxDepthMm: max,
  };
  if (isProfileShape(input.shape)) {
    const c = profileCfg(input);
    out.areaMm2 = sectionArea(c);
    out.perimeterMm = perimeter(c);
    out.straightL = straightVolume(c) / MM3_PER_LITRE;
    out.dishL = dishVolume(c) / MM3_PER_LITRE;
  }
  return out;
}

/**
 * Solve one dimension for a target capacity (litres), keeping the others fixed.
 * Length has a closed form for profile shapes; everything else is bisected.
 */
export function solveDimension(
  input: TankInput,
  key: string,
  targetL: number,
): number | null {
  const target = targetL * MM3_PER_LITRE;
  if (!(target > 0)) return null;

  if (isProfileShape(input.shape) && key === "L") {
    const c = profileCfg(input);
    const A = sectionArea(c);
    const x = target / A - (4 / 3) * c.E;
    return x > 0 && Number.isFinite(x) ? x : null;
  }

  const volumeAt = (x: number): number => {
    const dims = { ...input.dims, [key]: x };
    const probe = { ...input, dims };
    return validate(probe).ok ? totalMm3(probe) : Number.NaN;
  };

  let lo = 0;
  let hi = 1e7;
  // The volume is not defined for tiny/invalid values; walk up to find a valid, too-small start.
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const v = volumeAt(mid);
    if (!Number.isFinite(v) || v > target) hi = mid;
    else lo = mid;
  }
  const x = (lo + hi) / 2;
  const v = volumeAt(x);
  return Number.isFinite(v) && Math.abs(v - target) / target < 1e-3 ? x : null;
}
