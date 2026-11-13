/** Calculator form state: defaults and parsing. Pure, so the UI hook stays small. */
import type { Dims } from "./geometry";
import { SPELL_REF } from "./profile";
import { SHAPE_BY_ID, SHAPES, type ShapeId } from "./shapes";
import { evalExpr, fromMm, type LengthUnit, toMm } from "./units";

export type FieldState = { value: string; unit: LengthUnit };

export const EXPR_ERROR = "Enter a number or a simple sum such as 2400*1.1.";

/** Number as a clean string for an input (no thousands separators, no trailing zeros). */
export function toInputString(n: number): string {
  return String(Number(n.toFixed(3)));
}

export const field = (mm: number, unit: LengthUnit = "mm"): FieldState => ({
  value: toInputString(fromMm(mm, unit)),
  unit,
});

export function parseField(f: FieldState): { mm: number; error?: string } {
  const n = evalExpr(f.value);
  if (Number.isNaN(n)) return { mm: Number.NaN, error: EXPR_ERROR };
  return { mm: toMm(n, f.unit) };
}

/** Rw / Rh scale with the overall W / H until the user types their own. */
export const autoSpell = (W: number, H: number) => ({
  Rw: (W * SPELL_REF.Rw) / SPELL_REF.W,
  Rh: (H * SPELL_REF.Rh) / SPELL_REF.H,
});

/** Example dimensions (mm) for a shape; used for the empty/ghost preview and as form defaults. */
export function defaultDims(shape: ShapeId): Dims {
  const meta = SHAPE_BY_ID[shape];
  const dims: Dims = {};
  for (const f of meta.fields) dims[f.key] = f.defaultMm;
  if (meta.option?.defaultOn)
    dims[meta.option.key] = meta.option.field.defaultMm;
  if (shape === "spell")
    Object.assign(dims, autoSpell(dims.W, dims.H), { bend: SPELL_REF.bend });
  return dims;
}

export type AllFields = Record<ShapeId, Record<string, FieldState>>;

export function initialFields(): AllFields {
  return Object.fromEntries(
    SHAPES.map((s) => {
      const f: Record<string, FieldState> = {};
      // Main dimensions start empty (reference outline + call to action), as in the legacy tool.
      for (const fld of s.fields) f[fld.key] = { value: "", unit: "mm" };
      if (s.option) f[s.option.key] = field(s.option.field.defaultMm);
      return [s.id, f];
    }),
  ) as AllFields;
}

export function initialOptions(): Record<ShapeId, boolean> {
  return Object.fromEntries(
    SHAPES.map((s) => [s.id, s.option?.defaultOn ?? false]),
  ) as Record<ShapeId, boolean>;
}

export type FillState = {
  mode: "depth" | "volume";
  depth: string;
  depthUnit: "percent" | LengthUnit;
  volume: string;
  volumeUnit: "L" | "KL" | "m3" | "ft3" | "galUS";
};

export const initialFill = (): FillState => ({
  mode: "depth",
  depth: "95",
  depthUnit: "percent",
  volume: "",
  volumeUnit: "L",
});
