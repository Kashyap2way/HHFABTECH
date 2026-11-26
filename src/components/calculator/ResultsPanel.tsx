"use client";

import { fmt } from "@/lib/calculator/units";
import type { CalculatorApi } from "./useCalculator";

const Item = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[11px] border border-white/[0.08] bg-white/[0.045] p-[11px]">
    <dt className="text-[10px] tracking-[0.08em] text-white/55 uppercase">
      {label}
    </dt>
    <dd className="mt-1 text-sm font-semibold text-white tabular-nums">
      {value}
    </dd>
  </div>
);

/** Legacy `.tc-results`: dark card, large litres figure with gold unit, 3-column metric tiles. */
export function ResultsPanel({ calc }: { calc: CalculatorApi }) {
  const r = calc.result;
  const l = r?.filledL ?? 0;
  const dash = "—";
  return (
    <section
      aria-label="Results"
      className="relative overflow-hidden rounded-[17px] bg-[#111318] p-5 text-white shadow-[0_12px_30px_rgb(16_24_40/0.13)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[radial-gradient(circle,rgb(215_182_93/0.18),transparent_70%)]"
      />
      <p className="relative text-[10px] font-bold tracking-[0.13em] text-white/60 uppercase">
        Calculated filled volume
      </p>
      <p
        className="relative mt-1 flex items-baseline gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <strong className="text-[clamp(34px,5vw,48px)] leading-none font-bold tracking-[-0.04em] tabular-nums">
          {r ? fmt(l, 0) : "0"}
        </strong>
        <span className="text-[13px] font-bold text-[#d7b65d]">litres</span>
      </p>

      <dl className="relative mt-[17px] grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Item label="Capacity" value={r ? `${fmt(r.capacityL, 0)} L` : dash} />
        <Item label="KL / m³" value={r ? fmt(l / 1000, 3) : dash} />
        <Item label="Cubic feet" value={r ? fmt(l / 28.316846592, 2) : dash} />
        <Item label="US gallons" value={r ? fmt(l * 0.2641720524, 0) : dash} />
        <Item
          label="Fill level"
          value={r ? `${fmt(r.fillPercent, 1)}%` : dash}
        />
        <Item label="Fill depth" value={r ? `${fmt(r.depthMm, 0)} mm` : dash} />
      </dl>

      <p
        className="relative mt-3 text-[11px] leading-relaxed text-white/60"
        aria-live="polite"
      >
        {r
          ? `Capacity ${fmt(r.capacityL, 0)} L (${fmt(r.capacityL / 1000, 2)} KL), filled to ${fmt(r.fillPercent, 1)}% by volume.`
          : calc.ok
            ? "Check the fill value."
            : "Enter the tank dimensions to calculate capacity."}
      </p>
    </section>
  );
}
