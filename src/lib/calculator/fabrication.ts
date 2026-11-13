/** Fabrication helpers: baffle sections and developed sheet length / corner marks. */

export type BaffleInput = {
  capacityL: number;
  /** Section capacity S (litres) */
  sectionL: number;
  /** Allowed overrun k as a percentage (20 = +20%) */
  overrunPct: number;
  /** Usable volume f as a percentage of capacity */
  usablePct: number;
  evenRound: boolean;
  round4000: boolean;
  /** Manual number of baffle plates; null = automatic */
  manualCount: number | null;
  enabled: boolean;
};

export type BaffleResult = {
  usableL: number;
  maxSectionL: number;
  /** Sections needed without rounding to even */
  rawSections: number;
  sections: number;
  plates: number;
  eachL: number;
  /** More than one section is needed, so baffles are recommended */
  recommended: boolean;
};

export function baffles(i: BaffleInput): BaffleResult {
  const S = Math.max(0.001, i.sectionL || 5000);
  const maxSectionL = S * (1 + Math.max(0, i.overrunPct) / 100);
  const f = Math.min(100, Math.max(1, i.usablePct || 95)) / 100;
  let usableL = i.capacityL * f;
  if (i.round4000 && usableL > 0)
    usableL = Math.max(4000, Math.round(usableL / 4000) * 4000);

  const rawSections =
    usableL > 0 ? Math.max(1, Math.ceil(usableL / maxSectionL - 1e-9)) : 0;
  let n = rawSections;
  if (i.evenRound && n > 1 && n % 2) n += 1;
  const recommended = n > 1;

  let plates = Math.max(0, n - 1);
  let sections = n;
  if (!i.enabled) {
    plates = 0;
    sections = i.capacityL > 0 ? 1 : 0;
  } else if (i.manualCount !== null) {
    plates = Math.max(0, Math.floor(i.manualCount));
    sections = plates + 1;
  }
  return {
    usableL,
    maxSectionL,
    rawSections,
    sections,
    plates,
    eachL: sections > 0 ? usableL / sections : 0,
    recommended,
  };
}

export type SheetInput = {
  perimeterMm: number;
  thicknessMm: number;
  allowanceMm: number;
  /** Spell only */
  isSpell: boolean;
  rhMm: number;
};

export type SheetResult = {
  sheetMm: number;
  /** Base marks at 25% and 75%, then ±Rh/2 corner zones (Spell only) */
  marks: null | {
    quarter: number;
    threeQuarter: number;
    zones: [[number, number], [number, number]];
  };
};

export function sheet(i: SheetInput): SheetResult | null {
  const ok =
    Number.isFinite(i.perimeterMm) &&
    i.perimeterMm > 0 &&
    i.thicknessMm >= 0 &&
    i.allowanceMm >= 0;
  if (!ok) return null;
  const sheetMm = i.perimeterMm + Math.PI * i.thicknessMm + i.allowanceMm;
  if (!i.isSpell) return { sheetMm, marks: null };
  const clamp = (x: number) => Math.max(0, Math.min(sheetMm, x));
  const q = sheetMm * 0.25;
  const t = sheetMm * 0.75;
  return {
    sheetMm,
    marks: {
      quarter: q,
      threeQuarter: t,
      zones: [
        [clamp(q - i.rhMm / 2), clamp(q + i.rhMm / 2)],
        [clamp(t - i.rhMm / 2), clamp(t + i.rhMm / 2)],
      ],
    },
  };
}
