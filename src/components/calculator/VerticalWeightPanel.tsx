"use client";

import { useState } from "react";
import { FormField } from "@/components/ui/form-field";
import { evalExpr, fmt } from "@/lib/calculator/units";
import { verticalWeight } from "@/lib/calculator/vertical-weight";
import { cn } from "@/lib/utils";
import { Check, Metric, Note, NumberField } from "./AdvancedPanels";
import { controlClass } from "./DimensionField";
import type { CalculatorApi } from "./useCalculator";

const MATERIALS = [
  { value: "7850", label: "Mild steel · 7,850 kg/m³" },
  { value: "7930", label: "Stainless 304 · 7,930 kg/m³" },
  { value: "8000", label: "Stainless 316 · 8,000 kg/m³" },
] as const;

/** Read a number, falling back to the default when empty or invalid. */
const num = (v: string, dflt: number) => {
  if (v.trim() === "") return dflt;
  const n = evalExpr(v);
  return Number.isFinite(n) ? n : dflt;
};

/** Steel weight estimate for vertical cylindrical tanks (not password protected, as in the legacy tool). */
export function VerticalWeightPanel({ calc }: { calc: CalculatorApi }) {
  const [shellT, setShellT] = useState("3");
  const [bottomT, setBottomT] = useState("5");
  const [roofT, setRoofT] = useState("2");
  const [rho, setRho] = useState<string>("7850");
  const [stepped, setStepped] = useState(true);
  const [baseH, setBaseH] = useState("3000");
  const [step, setStep] = useState("1500");
  const [liquidRho, setLiquidRho] = useState("1");

  const r = calc.result;
  const out =
    calc.ok && r
      ? verticalWeight({
          D: calc.input.dims.D,
          H: calc.input.dims.H,
          shellT: Math.max(0, num(shellT, 3)),
          bottomT: Math.max(0, num(bottomT, 5)),
          roofT: Math.max(0, num(roofT, 2)),
          rho: Number(rho),
          stepped,
          baseH: Math.max(1, num(baseH, 3000)),
          step: Math.max(1, num(step, 1500)),
          liquidL: r.filledL,
          liquidRho: Math.max(0, num(liquidRho, 1)),
        })
      : null;
  const kg = (n?: number) => (n === undefined ? "—" : `${fmt(n, 0)} kg`);

  return (
    <div className="grid gap-4">
      <Note>
        Plate thickness steps up toward the bottom as the tank gets taller.
        Every value below is editable.
      </Note>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Shell plate thickness (top courses)"
          value={shellT}
          onChange={setShellT}
          suffix="mm"
        />
        <NumberField
          label="Bottom plate thickness"
          value={bottomT}
          onChange={setBottomT}
          suffix="mm"
        />
        <NumberField
          label="Roof plate thickness"
          value={roofT}
          onChange={setRoofT}
          suffix="mm"
        />
        <FormField label="Material">
          {(c) => (
            <select
              {...c}
              value={rho}
              onChange={(e) => setRho(e.target.value)}
              className={cn(controlClass, "cursor-pointer px-3")}
            >
              {MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>
      <Check
        id="vw-stepped"
        checked={stepped}
        onChange={setStepped}
        title="Step plate thickness with tank height"
        note="Beyond the base height, the lower shell gets 1 mm thicker per step, rounded to the nearest step. The bottom plate gains 1 mm for every base height of extra shell."
      />
      <fieldset
        disabled={!stepped}
        className={cn(
          "grid gap-4 transition-[opacity,filter] sm:grid-cols-2",
          !stepped && "opacity-40 blur-[1.5px]",
        )}
      >
        <legend className="sr-only">Plate stepping</legend>
        <NumberField
          label="Base height (no step up to)"
          value={baseH}
          onChange={setBaseH}
          suffix="mm"
        />
        <NumberField
          label="Step height (rounding)"
          value={step}
          onChange={setStep}
          suffix="mm"
        />
      </fieldset>
      <NumberField
        label="Liquid density (for operating weight)"
        value={liquidRho}
        onChange={setLiquidRho}
        suffix="kg/L"
      />

      {out ? (
        <div className="overflow-x-auto rounded-xl border border-brand/10 bg-white">
          <table className="w-full min-w-[420px] text-left text-sm">
            <caption className="sr-only">Plate breakdown</caption>
            <thead className="bg-[#fafbfc] text-[11px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Part
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Size
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Thickness
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand/5 tabular-nums">
              {out.rows.map((row) => (
                <tr key={row.part}>
                  <th
                    scope="row"
                    className="px-3 py-2 font-medium text-[#344054]"
                  >
                    {row.part}
                  </th>
                  <td className="px-3 py-2 text-[#475467]">{row.size}</td>
                  <td className="px-3 py-2 text-[#475467]">{row.t} mm</td>
                  <td className="px-3 py-2 text-right font-semibold text-brand">
                    {kg(row.kg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Note>Enter valid dimensions above to see the plate breakdown.</Note>
      )}
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Shell plates" value={kg(out?.shell)} />
        <Metric label="Bottom + roof" value={kg(out?.ends)} />
        <Metric label="Steel total" value={kg(out?.steel)} />
        <Metric label="Operating weight" value={kg(out?.operating)} />
      </dl>
      <Note>
        Estimate from plate area × thickness × density. Welds, nozzles,
        stiffeners and scrap allowance are not included.
      </Note>
    </div>
  );
}
