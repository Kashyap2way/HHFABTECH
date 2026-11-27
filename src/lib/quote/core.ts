/**
 * Quote builder rules, ported from the legacy quote-core.js. Pure functions, no DOM.
 * Sizing reuses the calculator's Spell profile maths so both tools always agree.
 */
import {
  DEFAULT_EMBOSS_MM,
  type ProfileCfg,
  SPELL_REF,
  sectionArea,
} from "@/lib/calculator/profile";

export const MAX_W = 2400;
export const MAX_H = 1830;

export const PRODUCTS = [
  ["petroleum", "Petroleum / Diesel Tanker"],
  ["chemical", "Chemical Tanker"],
  ["fuel", "Fuel Bowser"],
  ["ss", "Stainless Steel Tanker"],
  ["storage", "Storage Tank"],
  ["water", "Water Tanker"],
] as const;
export type ProductId = (typeof PRODUCTS)[number][0];

export const MATERIALS = [
  ["ms", "MS (Mild Steel)"],
  ["ss202", "SS 202"],
  ["ss304", "SS 304"],
  ["ss316", "SS 316"],
  ["al6016", "Aluminium 6016"],
] as const;
export type MaterialId = (typeof MATERIALS)[number][0];

/** [id, label, selected by default] */
export const ACCESSORIES = [
  ["catwalk", "Catwalk + Ladder", true],
  ["bumper", "Rear Bumper", true],
  ["railguard", "Railguard / Sideguard", true],
  ["valvebox", "Valve box", true],
  ["eso", "Emergency Shutoff Lever", true],
  ["hosecarrier", "Hose pipe carrier (10 ft × 4 in filling pipe)", true],
  ["nozzlebox", "Delivery nozzle box", true],
  ["mudguard", "Mudguard + steering-wheel tyre mudguard", true],
  ["fire", "Fire extinguisher + stand", false],
] as const;

/** Tonnes per kilolitre by product (customer can override). */
export const DENSITY: Record<ProductId, number> = {
  petroleum: 0.83,
  chemical: 1.0,
  fuel: 0.83,
  ss: 1.0,
  storage: 1.0,
  water: 1.0,
};

/**
 * PRICING: null = not set yet, the UI shows "₹ X". Fill the rate card in here when ready.
 * materialFactor multiplies the per-KL rate; accessory maps an accessory id to its price.
 */
export const PRICING: {
  gstPct: number;
  perKL: number | null;
  materialFactor: Record<MaterialId, number | null>;
  accessory: Partial<Record<string, number>>;
} = {
  gstPct: 18,
  perKL: null,
  materialFactor: { ms: 1, ss202: null, ss304: null, ss316: null, al6016: null },
  accessory: {},
};

export const BAFFLE = {
  sectionL: 5000,
  overrunPct: 20,
  usablePct: 95,
  evenRound: true,
} as const;

export const toKL = (value: number, unit: "KL" | "TON", density: number) =>
  unit === "TON" ? value / density : value;

export type TankSize = {
  W: number;
  H: number;
  L: number;
  emboss: number;
  dishEnds: number;
  /** Full Spell profile, ready for the 3D scene */
  dims: Record<string, number>;
};

/** Size the Spell tank at the maximum cross-section for a capacity in litres. */
export function sizeTank(capL: number): TankSize | null {
  if (!(capL > 0)) return null;
  const W = MAX_W;
  const H = MAX_H;
  const E = DEFAULT_EMBOSS_MM;
  const Rw = (W * SPELL_REF.Rw) / SPELL_REF.W;
  const Rh = (H * SPELL_REF.Rh) / SPELL_REF.H;
  const cfg: ProfileCfg = {
    shape: "spell",
    L: 0,
    W,
    H,
    Rw,
    Rh,
    bend: SPELL_REF.bend,
    E,
  };
  const area = sectionArea(cfg); // mm²
  const L = (capL * 1e6) / area - (4 / 3) * E; // capacity = A · (L + 4E/3)
  if (!(L > 0)) return null;
  return {
    W,
    H,
    L,
    emboss: E,
    dishEnds: 2,
    dims: { W, H, L, Rw, Rh, bend: SPELL_REF.bend, E },
  };
}

export function baffles(capL: number) {
  const maxS = BAFFLE.sectionL * (1 + BAFFLE.overrunPct / 100);
  const usable = (capL * BAFFLE.usablePct) / 100;
  let n = usable > 0 ? Math.max(1, Math.ceil(usable / maxS - 1e-9)) : 0;
  if (BAFFLE.evenRound && n > 1 && n % 2) n += 1;
  return {
    sections: n,
    plates: n > 1 ? n - 1 : 0,
    eachL: n ? usable / n : 0,
  };
}

/** Price with GST. Returns null until the rate card above is filled in. */
export function price(q: {
  capacityKL: number;
  material: MaterialId;
  accessories: readonly string[];
}) {
  const mf = PRICING.materialFactor[q.material];
  if (PRICING.perKL == null || mf == null) return null;
  let sub = PRICING.perKL * q.capacityKL * mf;
  for (const id of q.accessories) {
    const a = PRICING.accessory[id];
    if (a == null) return null;
    sub += a;
  }
  const gst = (sub * PRICING.gstPct) / 100;
  return { subtotal: sub, gst, total: sub + gst };
}

/** Saved in sessionStorage so a refresh or a trip to the calculator keeps the selections. */
export const STORAGE_KEY = "hh_quote_v1";

export type QuoteState = {
  v: 1;
  product: ProductId;
  unit: "KL" | "TON";
  capacity: string;
  density: number | null;
  material: MaterialId;
  accessories: string[];
};

export const defaultQuote = (): QuoteState => ({
  v: 1,
  product: "petroleum",
  unit: "KL",
  capacity: "",
  density: null,
  material: "ms",
  accessories: ACCESSORIES.filter((a) => a[2]).map((a) => a[0]),
});

export function loadQuote(): QuoteState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const s = raw ? (JSON.parse(raw) as Partial<QuoteState>) : null;
    return s && s.v === 1 ? { ...defaultQuote(), ...s } : defaultQuote();
  } catch {
    return defaultQuote();
  }
}

export function saveQuote(s: QuoteState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: selections just won't persist */
  }
}
