/**
 * Steel weight estimate for a vertical cylindrical tank (port of the legacy tool).
 * Plate thickness steps up toward the bottom as the tank gets taller. Pure, mm / kg units.
 */

export type Course = { h: number; t: number };

/**
 * Plate courses: the top `baseH` of shell uses the base thickness; below it every `baseH` band
 * is 1 mm thicker, the thick part being the extra height rounded to the nearest `step`.
 */
export function plateCourses(
  H: number,
  t0: number,
  baseH: number,
  step: number,
): { list: Course[]; extra: number } {
  const extra = H - baseH;
  const k = step > 0 ? Math.round(extra / step) : 0;
  if (!(extra > 0) || k <= 0) return { list: [{ h: H, t: t0 }], extra: 0 };
  const thick = Math.min(k * step, H);
  const list: Course[] = [{ h: H - thick, t: t0 }];
  let rem = thick;
  let t = t0 + 1;
  while (rem > 1e-9) {
    const h = Math.min(rem, baseH);
    list.push({ h, t });
    rem -= h;
    t += 1;
  }
  return { list: list.filter((c) => c.h > 1e-9), extra: thick };
}

export type VerticalWeightInput = {
  /** internal diameter and height, mm */
  D: number;
  H: number;
  shellT: number;
  bottomT: number;
  roofT: number;
  /** steel density kg/m³ */
  rho: number;
  stepped: boolean;
  baseH: number;
  step: number;
  /** liquid volume (L) and density (kg/L) for the operating weight */
  liquidL: number;
  liquidRho: number;
};

export type WeightRow = { part: string; size: string; t: number; kg: number };

export function verticalWeight(i: VerticalWeightInput) {
  const kg = (areaMm2: number, t: number) => areaMm2 * t * i.rho * 1e-9;
  const pc = i.stepped
    ? plateCourses(i.H, i.shellT, Math.max(1, i.baseH), Math.max(1, i.step))
    : { list: [{ h: i.H, t: i.shellT }], extra: 0 };
  const tBottom =
    i.bottomT +
    (i.stepped ? Math.floor(pc.extra / Math.max(1, i.baseH) + 1e-9) : 0);
  const rows: WeightRow[] = [];
  let shell = 0;
  pc.list.forEach((c, n) => {
    const w = kg(Math.PI * (i.D + c.t) * c.h, c.t);
    shell += w;
    rows.push({
      part: n === 0 ? "Top shell" : `Shell, lower band ${n}`,
      size: `${Math.round(c.h).toLocaleString("en-IN")} mm`,
      t: c.t,
      kg: w,
    });
  });
  const tLow = pc.list[pc.list.length - 1].t;
  const bottomD = i.D + 2 * tLow;
  const roofD = i.D + 2 * i.shellT;
  const bottom = kg((Math.PI / 4) * bottomD ** 2, tBottom);
  const roof = kg((Math.PI / 4) * roofD ** 2, i.roofT);
  rows.push(
    {
      part: "Bottom plate",
      size: `Ø ${Math.round(bottomD).toLocaleString("en-IN")} mm`,
      t: tBottom,
      kg: bottom,
    },
    {
      part: "Roof plate",
      size: `Ø ${Math.round(roofD).toLocaleString("en-IN")} mm`,
      t: i.roofT,
      kg: roof,
    },
  );
  const steel = shell + bottom + roof;
  return {
    rows,
    shell,
    ends: bottom + roof,
    steel,
    operating: steel + i.liquidL * i.liquidRho,
  };
}
