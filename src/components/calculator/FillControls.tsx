"use client";

import { LENGTH_UNITS, VOLUME_UNITS } from "@/lib/calculator/units";
import { cn } from "@/lib/utils";
import { DimensionField } from "./DimensionField";
import type { CalculatorApi } from "./useCalculator";

const DEPTH_UNITS = [
  { value: "percent" as const, label: "%" },
  ...LENGTH_UNITS,
];

/** Legacy `.tc-fill-card`: kicker, title and a dark pill switch for depth vs known volume. */
export function FillControls({ calc }: { calc: CalculatorApi }) {
  const { fill, updateFill, fillError } = calc;
  const seg = (mode: "depth" | "volume", label: string) => (
    // biome-ignore lint/a11y/useSemanticElements: segmented control; role + aria-checked convey the state
    <button
      type="button"
      role="radio"
      aria-checked={fill.mode === mode}
      onClick={() => updateFill({ mode })}
      className={cn(
        "h-8 cursor-pointer rounded-full px-3 text-xs font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-[#b8860b]/30 focus-visible:outline-none",
        fill.mode === mode
          ? "bg-[#111318] text-white"
          : "text-[#667085] hover:text-[#111318]",
      )}
    >
      {label}
    </button>
  );

  return (
    <fieldset className="rounded-2xl border border-[#e7e9ed] bg-[#fafbfc] p-4 sm:p-[17px]">
      <legend className="sr-only">Fill calculation</legend>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.13em] text-gold-dark uppercase">
            03 / Fill calculation
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-[#344054]">
            Calculate filled volume
          </h3>
        </div>
        <div
          role="radiogroup"
          aria-label="Fill input"
          className="inline-flex rounded-full border border-[#e0e3e7] bg-white p-[3px]"
        >
          {seg("depth", "Fill depth")}
          {seg("volume", "Known volume")}
        </div>
      </div>

      {fill.mode === "depth" ? (
        <DimensionField
          label="Fill depth"
          symbol="95% default"
          hint={
            fill.depthUnit === "percent"
              ? "Percent of the tank's capacity by volume (95% is typical)."
              : "Liquid height measured up from the lowest point."
          }
          error={fillError}
          value={fill.depth}
          unit={fill.depthUnit}
          units={DEPTH_UNITS}
          onValueChange={(depth) => updateFill({ depth })}
          onUnitChange={(depthUnit) => updateFill({ depthUnit })}
        />
      ) : (
        <DimensionField
          label="Target fill volume"
          symbol="Vf"
          hint="Reports the entered volume, capped at the capacity, and finds the depth."
          error={fillError}
          value={fill.volume}
          unit={fill.volumeUnit}
          units={VOLUME_UNITS}
          placeholder="e.g. 2500"
          onValueChange={(volume) => updateFill({ volume })}
          onUnitChange={(volumeUnit) => updateFill({ volumeUnit })}
        />
      )}
    </fieldset>
  );
}
