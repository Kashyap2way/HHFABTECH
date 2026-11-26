/** Units, number formatting and a safe arithmetic expression parser (no eval). */

export type LengthUnit = "mm" | "m" | "in" | "ft";
export const LENGTH_UNITS: readonly { value: LengthUnit; label: string }[] = [
  { value: "mm", label: "mm" },
  { value: "m", label: "m" },
  { value: "in", label: "inch" },
  { value: "ft", label: "ft" },
];
export const MM_PER_UNIT: Record<LengthUnit, number> = {
  mm: 1,
  m: 1000,
  in: 25.4,
  ft: 304.8,
};

export type VolumeUnit = "L" | "KL" | "m3" | "ft3" | "galUS";
export const VOLUME_UNITS: readonly { value: VolumeUnit; label: string }[] = [
  { value: "L", label: "Litres" },
  { value: "KL", label: "KL" },
  { value: "m3", label: "m³" },
  { value: "ft3", label: "ft³" },
  { value: "galUS", label: "US gal" },
];
export const LITRES_PER_UNIT: Record<VolumeUnit, number> = {
  L: 1,
  KL: 1000,
  m3: 1000,
  ft3: 28.316846592,
  galUS: 3.785411784,
};

export const MM3_PER_LITRE = 1e6;
export const toMm = (value: number, unit: LengthUnit) =>
  value * MM_PER_UNIT[unit];
export const fromMm = (mm: number, unit: LengthUnit) => mm / MM_PER_UNIT[unit];

const nf = (digits: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const cache = new Map<number, Intl.NumberFormat>();

/** Indian digit grouping; "—" for non-finite values. */
export function fmt(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  let f = cache.get(digits);
  if (!f) {
    f = nf(digits);
    cache.set(digits, f);
  }
  return f.format(value);
}

/**
 * Evaluate "2400", "1.2*3", "(2400+100)/2", "2,400 x 1.1".
 * Returns 0 for an empty string and NaN for anything invalid.
 */
export function evalExpr(raw: string): number {
  const str = String(raw ?? "")
    .replace(/,/g, "")
    .replace(/[xX×]/g, "*")
    .replace(/\s+/g, "");
  if (!str) return 0;
  if (!/^[0-9.+*/()-]+$/.test(str)) return Number.NaN;
  const tokens = str.match(/(?:\d*\.\d+|\d+\.?\d*|[()+*/-])/g) ?? [];
  if (tokens.join("") !== str) return Number.NaN;

  let i = 0;
  const expr = (): number => {
    let v = term();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const b = term();
      v = op === "+" ? v + b : v - b;
    }
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const b = factor();
      v = op === "*" ? v * b : v / b;
    }
    return v;
  };
  const factor = (): number => {
    const t = tokens[i];
    if (t === "+") {
      i++;
      return factor();
    }
    if (t === "-") {
      i++;
      return -factor();
    }
    if (t === "(") {
      i++;
      const v = expr();
      if (tokens[i++] !== ")") throw new Error("paren");
      return v;
    }
    const n = Number(tokens[i++]);
    if (!Number.isFinite(n)) throw new Error("number");
    return n;
  };
  try {
    const v = expr();
    return i === tokens.length && Number.isFinite(v) ? v : Number.NaN;
  } catch {
    return Number.NaN;
  }
}
