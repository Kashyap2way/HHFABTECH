"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  type BaffleResult,
  baffles,
  sheet,
} from "@/lib/calculator/fabrication";
import { solveDimension } from "@/lib/calculator/model";
import {
  crossSectionPts,
  polygonArea,
  polygonPerimeter,
} from "@/lib/calculator/outline";
import type { ShapeId } from "@/lib/calculator/shapes";
import {
  evalExpr,
  fmt,
  fromMm,
  LENGTH_UNITS,
  type LengthUnit,
  LITRES_PER_UNIT,
  VOLUME_UNITS,
  type VolumeUnit,
} from "@/lib/calculator/units";
import { cn } from "@/lib/utils";
import { DimensionField } from "./DimensionField";
import type { CalculatorApi } from "./useCalculator";

export const Metric = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-brand/10 bg-white px-3 py-2.5",
      className,
    )}
  >
    <dt className="text-[11px] tracking-wider text-muted-foreground uppercase">
      {label}
    </dt>
    <dd className="mt-0.5 text-sm font-semibold text-brand tabular-nums sm:text-base">
      {value}
    </dd>
  </div>
);

export const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
);

export const Check = ({
  id,
  checked,
  onChange,
  title,
  note,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  note?: string;
}) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand/10 bg-white p-3"
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
    />
    <span>
      <span className="block text-sm font-semibold text-brand">{title}</span>
      {note ? (
        <span className="block text-xs text-muted-foreground">{note}</span>
      ) : null}
    </span>
  </label>
);

/** Plain number input with an optional suffix. */
export function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <FormField label={label} hint={hint}>
      {(c) => (
        <div className="relative">
          <Input
            {...c}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "h-11 rounded-lg bg-white px-3 text-base tabular-nums md:text-[15px]",
              suffix && "pr-12",
            )}
          />
          {suffix ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
      )}
    </FormField>
  );
}

/* -------------------------------------------------------------------------- */
/* Solve a dimension from a known volume                                       */
/* -------------------------------------------------------------------------- */

export function SolvePanel({ calc }: { calc: CalculatorApi }) {
  const [target, setTarget] = useState("");
  const [targetUnit, setTargetUnit] = useState<VolumeUnit>("L");
  const [key, setKey] = useState<string>(calc.meta.fields[0].key);
  const [outUnit, setOutUnit] = useState<LengthUnit>("mm");
  const [solved, setSolved] = useState<
    { key: string; mm: number } | "none" | null
  >(null);

  // Keep the selected key valid when the shape changes.
  const keys = [
    ...calc.meta.fields,
    ...(calc.meta.option && calc.optionOn ? [calc.meta.option.field] : []),
  ];
  const activeKey = keys.some((k) => k.key === key) ? key : keys[0].key;

  const run = () => {
    const n = evalExpr(target);
    if (!calc.ok || !(n > 0)) {
      setSolved("none");
      return;
    }
    const mm = solveDimension(
      calc.input,
      activeKey,
      n * LITRES_PER_UNIT[targetUnit],
    );
    setSolved(mm === null ? "none" : { key: activeKey, mm });
  };

  const label = keys.find(
    (k) => solved && solved !== "none" && k.key === solved.key,
  )?.label;

  return (
    <div className="grid gap-4">
      <Note>
        Enter the capacity you need and pick the dimension to solve. The other
        dimensions stay as entered.
      </Note>
      <DimensionField
        label="Target tank volume"
        value={target}
        unit={targetUnit}
        units={VOLUME_UNITS}
        placeholder="e.g. 20"
        onValueChange={(v) => {
          setTarget(v);
          setSolved(null);
        }}
        onUnitChange={setTargetUnit}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Solve for">
          {(c) => (
            <NativeSelect
              {...c}
              value={activeKey}
              onChange={(e) => {
                setKey(e.target.value);
                setSolved(null);
              }}
              className="w-full [&_select]:h-11 [&_select]:bg-white [&_select]:px-3 [&_select]:text-base md:[&_select]:text-[15px]"
            >
              {keys.map((k) => (
                <NativeSelectOption key={k.key} value={k.key}>
                  {k.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </FormField>
        <FormField label="Result unit">
          {(c) => (
            <NativeSelect
              {...c}
              value={outUnit}
              onChange={(e) => setOutUnit(e.target.value as LengthUnit)}
              className="w-full [&_select]:h-11 [&_select]:bg-white [&_select]:px-3 [&_select]:text-base md:[&_select]:text-[15px]"
            >
              {LENGTH_UNITS.map((u) => (
                <NativeSelectOption key={u.value} value={u.value}>
                  {u.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </FormField>
      </div>
      <Button
        type="button"
        size="lg"
        onClick={run}
        className="h-11 rounded-full px-6 font-semibold sm:w-fit"
      >
        Calculate dimension
      </Button>
      <div aria-live="polite">
        {solved === "none" ? (
          <p className="text-sm text-destructive">
            Not feasible with the current dimensions. Enter valid dimensions and
            a target volume.
          </p>
        ) : solved ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gold/50 bg-gold/10 p-3">
            <p className="text-sm text-brand">
              {label}:{" "}
              <strong className="tabular-nums">
                {fmt(fromMm(solved.mm, outUnit), 1)} {outUnit}
              </strong>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full"
              onClick={() => calc.applyDimension(solved.key, solved.mm)}
            >
              Use this value
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Baffles                                                                     */
/* -------------------------------------------------------------------------- */

export type BaffleState = ReturnType<typeof useBaffles>;

/** Lifted so the weight estimate can read the plate count. */
export function useBaffles(capacityL: number) {
  const [override, setOverride] = useState<boolean | null>(null);
  const [section, setSection] = useState("5000");
  const [sectionUnit, setSectionUnit] = useState<"L" | "KL">("L");
  const [overrun, setOverrun] = useState("20");
  const [usable, setUsable] = useState("95");
  const [manual, setManual] = useState("");
  const [even, setEven] = useState(true);
  const [r4000, setR4000] = useState(false);

  const sectionL = (evalExpr(section) || 0) * (sectionUnit === "KL" ? 1000 : 1);
  const base = {
    capacityL,
    sectionL,
    overrunPct: evalExpr(overrun) || 0,
    usablePct: usable.trim() === "" ? 95 : evalExpr(usable) || 95,
    evenRound: even,
    round4000: r4000,
    manualCount:
      manual.trim() === ""
        ? null
        : Math.max(0, Math.floor(evalExpr(manual) || 0)),
  };
  const auto = baffles({ ...base, enabled: true });
  const enabled = override ?? auto.recommended;
  const result: BaffleResult = baffles({ ...base, enabled });

  return {
    enabled,
    setEnabled: setOverride,
    recommended: auto.recommended,
    result,
    section,
    setSection,
    sectionUnit,
    setSectionUnit,
    overrun,
    setOverrun,
    usable,
    setUsable,
    manual,
    setManual,
    even,
    setEven,
    r4000,
    setR4000,
  };
}

export function BafflePanel({ b }: { b: BaffleState }) {
  const r = b.result;
  return (
    <div className="grid gap-4">
      <Note>
        Sections are sized on a usable volume, and a baffle is added only when a
        section would exceed its allowed maximum.
      </Note>
      <Check
        id="baffle-on"
        checked={b.enabled}
        onChange={b.setEnabled}
        title="Include baffle plates"
        note={
          b.recommended
            ? "More than one section is needed, so baffles are on by default."
            : "One section is enough at this capacity, so baffles default to off."
        }
      />
      <fieldset
        disabled={!b.enabled}
        className={cn("grid gap-4 sm:grid-cols-2", !b.enabled && "opacity-50")}
      >
        <legend className="sr-only">Baffle settings</legend>
        <DimensionField
          label="Section capacity"
          symbol="S"
          value={b.section}
          unit={b.sectionUnit}
          units={[
            { value: "L", label: "Litres" },
            { value: "KL", label: "KL" },
          ]}
          onValueChange={b.setSection}
          onUnitChange={b.setSectionUnit}
        />
        <NumberField
          label="Allowed overrun (k)"
          value={b.overrun}
          onChange={b.setOverrun}
          suffix="%"
          hint={`Max section: ${fmt(r.maxSectionL, 0)} L`}
        />
        <NumberField
          label="Usable volume (f)"
          value={b.usable}
          onChange={b.setUsable}
          suffix="%"
          hint="Share of capacity used to size sections."
        />
        <NumberField
          label="Manual baffle count"
          value={b.manual}
          onChange={b.setManual}
          placeholder="Auto"
          hint="Optional."
        />
        <Check
          id="baffle-even"
          checked={b.even}
          onChange={b.setEven}
          title="Round to an even number of sections"
        />
        <Check
          id="baffle-4000"
          checked={b.r4000}
          onChange={b.setR4000}
          title="Round usable volume to 4,000 L"
          note="Off by default."
        />
      </fieldset>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Usable volume" value={`${fmt(r.usableL, 0)} L`} />
        <Metric label="Sections" value={fmt(r.sections, 0)} />
        <Metric
          label="Each section"
          value={r.sections ? `${fmt(r.eachL, 0)} L` : "—"}
        />
        <Metric label="Baffle plates" value={fmt(r.plates, 0)} />
      </dl>
      <Note>
        Actual compartment design, openings and statutory requirements must be
        confirmed by an engineer.
      </Note>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sheet length and corner marks                                               */
/* -------------------------------------------------------------------------- */

/** Cross-section area (mm²) and perimeter (mm) for any shape that has a profile. */
export function profileAreaPerimeter(
  calc: CalculatorApi,
): { A: number; P: number } | null {
  if (!calc.ok || !calc.meta.hasProfile) return null;
  const r = calc.result;
  if (r?.areaMm2 && r.perimeterMm) return { A: r.areaMm2, P: r.perimeterMm };
  const pts = crossSectionPts(calc.shape, calc.input.dims);
  return pts ? { A: polygonArea(pts), P: polygonPerimeter(pts) } : null;
}

export function SheetPanel({ calc }: { calc: CalculatorApi }) {
  const [t, setT] = useState("3");
  const [tUnit, setTUnit] = useState<LengthUnit>("mm");
  const [al, setAl] = useState("0");
  const [alUnit, setAlUnit] = useState<LengthUnit>("mm");
  const ap = profileAreaPerimeter(calc);
  const mmOf = (v: string, u: LengthUnit) =>
    (evalExpr(v) || 0) * { mm: 1, m: 1000, in: 25.4, ft: 304.8 }[u];

  const out = ap
    ? sheet({
        perimeterMm: ap.P,
        thicknessMm: mmOf(t, tUnit),
        allowanceMm: mmOf(al, alUnit),
        isSpell: calc.shape === "spell",
        rhMm: calc.input.dims.Rh ?? 0,
      })
    : null;

  return (
    <div className="grid gap-4">
      <Note>
        Estimate the developed sheet length for roll bending. Spell profiles
        also get corner-marking positions.
      </Note>
      <div className="grid gap-4 sm:grid-cols-2">
        <DimensionField
          label="Sheet thickness"
          symbol="t"
          value={t}
          unit={tUnit}
          units={LENGTH_UNITS}
          onValueChange={setT}
          onUnitChange={setTUnit}
        />
        <DimensionField
          label="Extra allowance"
          value={al}
          unit={alUnit}
          units={LENGTH_UNITS}
          onValueChange={setAl}
          onUnitChange={setAlUnit}
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          label="Profile perimeter"
          value={ap ? `${fmt(ap.P, 1)} mm` : "—"}
        />
        <Metric
          label="Sheet length"
          value={out ? `${fmt(out.sheetMm, 1)} mm` : "—"}
        />
        <Metric
          label="Corner radius"
          value={
            calc.shape === "spell"
              ? `${fmt(calc.input.dims.bend ?? 70, 0)} mm`
              : "Not applicable"
          }
        />
        <Metric
          label="Marking reference"
          value={calc.shape === "spell" ? "25% / 75%" : "No corner marks"}
        />
      </dl>
      <div
        className="rounded-xl border border-gold/50 bg-gold/10 p-3 text-sm leading-relaxed text-brand"
        aria-live="polite"
      >
        {!out
          ? "Enter valid dimensions to calculate sheet length and corner marks."
          : !out.marks
            ? "This profile has no four-corner marking lines. Use the perimeter and sheet-length estimate above."
            : `From one sheet edge (developed length ${fmt(out.sheetMm, 1)} mm): corner zone 1 is ${fmt(out.marks.zones[0][0], 1)} to ${fmt(out.marks.zones[0][1], 1)} mm, corner zone 2 is ${fmt(out.marks.zones[1][0], 1)} to ${fmt(out.marks.zones[1][1], 1)} mm. Base marks sit at 25% (${fmt(out.marks.quarter, 1)} mm) and 75% (${fmt(out.marks.threeQuarter, 1)} mm), offset by half of Rh.`}
      </div>
      <Note>
        Sheet length = profile perimeter + π × thickness + extra allowance.
        Confirm the neutral-axis factor, seam allowance and roll-bending method
        with your fabricator.
      </Note>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Calculation details                                                         */
/* -------------------------------------------------------------------------- */

/** Symbolic formulas (LaTeX) per shape, typeset lazily with KaTeX. */
const FORMULAS: Record<ShapeId, ReadonlyArray<[string, string]>> = {
  spell: [
    [
      "Corner heights",
      String.raw`h_1=\frac{H-R_h}{2},\qquad h_2=\frac{W-R_w}{2}`,
    ],
    [
      "Arc radius and segment",
      String.raw`r=\frac{c^2+4h^2}{8h},\qquad S(c,h)=r^2\cos^{-1}\!\left(\frac{r-h}{r}\right)-\frac{c}{2}(r-h)`,
    ],
    [
      "Cross-section area",
      String.raw`A=R_wR_h+2S(R_w,h_1)+2S(R_h,h_2)-(4-\pi)\,r_b^2`,
    ],
    ["Volume with dish ends", String.raw`V=A\left(L+\frac{4E}{3}\right)`],
  ],
  circle: [
    ["Cross-section area", String.raw`A=\frac{\pi D^2}{4}`],
    ["Volume with dish ends", String.raw`V=A\left(L+\frac{4E}{3}\right)`],
  ],
  oval: [
    ["Cross-section area", String.raw`A=\frac{\pi W H}{4}`],
    ["Volume with dish ends", String.raw`V=A\left(L+\frac{4E}{3}\right)`],
  ],
  verticalCylinder: [
    ["Volume", String.raw`V=\pi\left(\frac{D}{2}\right)^2 H`],
    ["Liquid at depth h", String.raw`V_f=\pi\left(\frac{D}{2}\right)^2 h`],
  ],
  rectangular: [
    ["Volume", String.raw`V=L\left(WH-(4-\pi)R^2\right)`],
    [
      "Liquid at depth h",
      String.raw`V_f=L\left(Wh-\text{corner losses}\right)`,
    ],
  ],
  sphere: [
    ["Volume", String.raw`V=\frac{4}{3}\pi r^3`],
    ["Liquid cap at depth h", String.raw`V_f=\frac{\pi h^2(3r-h)}{3}`],
  ],
  stadium: [
    ["Cross-section area", String.raw`A=(W-H)H+\frac{\pi H^2}{4}`],
    ["Volume", String.raw`V=A\,L`],
  ],
  capsuleHorizontal: [
    ["Volume", String.raw`V=\pi r^2 L_c+\frac{4}{3}\pi r^3`],
    [
      "Liquid at depth h",
      String.raw`V_f=A_{seg}(h)\,L_c+\frac{\pi h^2(3r-h)}{3}`,
    ],
  ],
  ellipsoidalHeadsHorizontal: [
    ["Volume", String.raw`V=\pi r^2(L-2E)+\frac{4}{3}\pi r^2E`],
    [
      "Heads",
      String.raw`\text{each head: half-ellipsoid with semi-axes } r,\ r,\ E`,
    ],
  ],
  dishBowl: [
    ["Volume", String.raw`V=\frac{\pi E\,(3r^2+E^2)}{6}`],
    [
      "Liquid at depth h",
      String.raw`R=\frac{r^2+E^2}{2E},\qquad V_f=\frac{\pi h^2(3R-h)}{3}`,
    ],
  ],
  coneBottom: [
    [
      "Volume",
      String.raw`V=\pi r^2\left(\frac{H_c}{3}+H_s+\frac{2E}{3}\right)`,
    ],
    ["Liquid in the cone", String.raw`V_f=\frac{\pi r^2 h^3}{3H_c^2}`],
  ],
};

/** Number for LaTeX: grouped digits with protected commas. */
const T = (n: number, dp: number) => fmt(n, dp).replace(/,/g, "{,}");

const TexFormulas = dynamic(() => import("./TexFormulas"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-muted-foreground">Loading formulas…</p>
  ),
});

export function DetailsPanel({ calc }: { calc: CalculatorApi }) {
  const r = calc.result;
  const items = useMemo(() => {
    const sym = FORMULAS[calc.shape].map(([label, tex]) => ({ label, tex }));
    if (!r) return sym;
    const d = calc.input.dims;
    const num: Array<{ label: string; tex: string; numeric: true }> = [];
    if (
      r.areaMm2 &&
      (calc.shape === "spell" ||
        calc.shape === "circle" ||
        calc.shape === "oval")
    ) {
      const A = r.areaMm2 / 1e6;
      const L = (d.L ?? 0) / 1000;
      const E = (d.E ?? 0) / 1000;
      num.push({
        label: "With your values",
        tex: String.raw`V=${T(A, 4)}\times\left(${T(L, 3)}+\frac{4\times${T(E, 3)}}{3}\right)=${T(r.capacityL / 1000, 3)}\ \text{m}^3=${T(r.capacityL, 0)}\ \text{L}`,
        numeric: true,
      });
    } else {
      num.push({
        label: "With your values",
        tex: String.raw`V=${T(r.capacityL / 1000, 3)}\ \text{m}^3=${T(r.capacityL, 0)}\ \text{L}`,
        numeric: true,
      });
    }
    num.push({
      label: "Filled volume",
      tex: String.raw`V_f=${T(r.filledL, 0)}\ \text{L}\ \ (${T(r.fillPercent, 1)}\%\ \text{of}\ V),\qquad h=${T(r.depthMm, 0)}\ \text{mm}`,
      numeric: true,
    });
    return [...sym, ...num];
  }, [calc.shape, calc.input.dims, r]);
  const rows = useMemo(
    () =>
      r
        ? [
            ["Total capacity", `${fmt(r.capacityL, 1)} L`],
            ["Liquid volume", `${fmt(r.filledL, 1)} L`],
            [
              "Fill depth",
              `${fmt(r.depthMm, 1)} mm of ${fmt(r.maxDepthMm, 0)} mm`,
            ],
            ...(r.areaMm2
              ? [
                  [
                    "Cross-sectional area",
                    `${fmt(r.areaMm2, 0)} mm² (${fmt(r.areaMm2 / 1e6, 4)} m²)`,
                  ],
                ]
              : []),
            ...(r.perimeterMm
              ? [["Profile perimeter", `${fmt(r.perimeterMm, 0)} mm`]]
              : []),
            ...(r.straightL !== undefined
              ? [["Straight shell volume", `${fmt(r.straightL, 0)} L`]]
              : []),
            ...(r.dishL !== undefined
              ? [["Dish-end volume (both)", `${fmt(r.dishL, 0)} L`]]
              : []),
          ]
        : [],
    [r],
  );
  return (
    <div className="grid gap-4">
      <Note>
        The formulas used for this shape, then the values from your inputs.
      </Note>
      <TexFormulas items={items} />
      {rows.length ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <Metric key={k} label={k} value={v} />
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter valid dimensions to see the numbers.
        </p>
      )}
      <p className="rounded-xl border border-gold/50 bg-gold/10 p-3 text-xs leading-relaxed text-brand">
        Use this tool for preliminary estimates. Confirm internal dimensions,
        dish-head design and construction details before fabrication, loading,
        road use or regulatory submission.
      </p>
    </div>
  );
}
