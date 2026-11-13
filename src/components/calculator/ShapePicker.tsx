"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { SHAPE_BY_ID, SHAPES, type ShapeId } from "@/lib/calculator/shapes";
import { cn } from "@/lib/utils";
import { WireIcon } from "./WireIcon";

const MAIN: readonly ShapeId[] = ["spell", "circle", "oval"];
const MORE = SHAPES.filter((s) => !MAIN.includes(s.id));

/** Large card for the three HH FABTECH cross-section profiles. */
function MainCard({
  id,
  selected,
  onSelect,
}: {
  id: ShapeId;
  selected: boolean;
  onSelect: () => void;
}) {
  const s = SHAPE_BY_ID[id];
  return (
    // biome-ignore lint/a11y/useSemanticElements: card-style radio; role + aria-checked convey the state
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={
        { "--w-f": selected ? "#43236f" : "#2a1b46" } as React.CSSProperties
      }
      className={cn(
        "w-card group relative flex min-h-[170px] md:min-h-[210px] cursor-pointer flex-col items-center rounded-[18px] border bg-gradient-to-b from-white to-[#fafbfc] p-5 text-center transition-all duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-6",
        selected
          ? "border-[#b8860b] shadow-[0_0_0_3px_rgb(184_134_11/0.1),0_16px_40px_rgb(16_24_40/0.1)]"
          : "border-[#e4e7ec] hover:-translate-y-0.5 hover:border-[#b8860b]/55 hover:shadow-[0_14px_35px_rgb(16_24_40/0.09)]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-3.5 right-3.5 grid size-6 place-items-center rounded-full bg-[#111827] text-white transition-all duration-200",
          selected ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </span>
      <span className="mb-3 grid h-[76px] w-full shrink-0 place-items-center md:h-[92px]">
        <WireIcon
          shape={id}
          className="h-[72px] w-[130px] md:h-[84px] md:w-[150px]"
        />
      </span>
      <h3 className="text-base font-bold text-[#150f26]">{s.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[#667085]">
        {s.description}
      </p>
    </button>
  );
}

export function ShapePicker({
  value,
  onChange,
}: {
  value: ShapeId;
  onChange: (shape: ShapeId) => void;
}) {
  const moreSelected = MORE.some((s) => s.id === value);
  const [open, setOpen] = useState(moreSelected);

  return (
    <div role="radiogroup" aria-label="Tank shape" className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        {MAIN.map((id) => (
          <MainCard
            key={id}
            id={id}
            selected={value === id}
            onSelect={() => onChange(id)}
          />
        ))}
      </div>

      {/* "More tank shapes" launcher */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="more-shapes"
        onClick={() => setOpen((o) => !o)}
        className="group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-[18px] border border-[#6f42c1]/40 bg-[linear-gradient(120deg,#150f26,#2b1850_55%,#43236f)] p-3 pr-4 text-left text-white shadow-[0_18px_36px_-20px_rgb(43_24_80/0.9)] transition-shadow hover:shadow-[0_22px_44px_-18px_rgb(43_24_80/1)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:p-3.5"
      >
        <span
          aria-hidden="true"
          style={
            { "--w-f": "#f6e7b4", "--w-m": "#d7b65d" } as React.CSSProperties
          }
          className="grid size-[62px] shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
        >
          <WireIcon shape="globe" className="h-[46px] w-[82px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold sm:text-lg">
            More tank shapes
          </span>
          <span className="block truncate text-sm text-white/70">
            {moreSelected
              ? `Selected: ${SHAPE_BY_ID[value].name}`
              : "Vertical, capsule, cone, dish, sphere and more"}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/50 bg-gold/15 text-sm font-bold text-[#f6dd8a]"
        >
          {MORE.length}
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 transition-colors group-hover:bg-white/20"
        >
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      <div
        id="more-shapes"
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-3 pb-1 sm:grid-cols-3 lg:grid-cols-4">
            {MORE.map((s) => {
              const selected = value === s.id;
              return (
                // biome-ignore lint/a11y/useSemanticElements: card-style radio; role + aria-checked convey the state
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(s.id)}
                  style={
                    {
                      "--w-f": selected ? "#43236f" : "#2a1b46",
                    } as React.CSSProperties
                  }
                  className={cn(
                    "w-card relative flex cursor-pointer flex-col items-center rounded-2xl border bg-gradient-to-b from-white to-[#fafbfc] px-3 pt-4 pb-4 text-center transition-all duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected
                      ? "border-[#b8860b] shadow-[0_0_0_3px_rgb(184_134_11/0.1),0_12px_30px_rgb(16_24_40/0.1)]"
                      : "border-[#e4e7ec] hover:-translate-y-0.5 hover:border-[#b8860b]/55",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full bg-[#111827] text-white transition-all",
                      selected ? "scale-100 opacity-100" : "scale-75 opacity-0",
                    )}
                  >
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                  <span className="mb-1 grid h-[62px] w-full place-items-center">
                    <WireIcon shape={s.id} className="h-[58px] w-[104px]" />
                  </span>
                  <span className="text-sm font-bold text-[#150f26]">
                    {s.name}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-snug text-[#667085]">
                    {s.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
