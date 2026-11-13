"use client";

import Image from "next/image";
import { useState } from "react";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

const brands = [
  { id: "iocl", label: "IOCL", height: 204 },
  { id: "hpcl", label: "HP", height: 185 },
  { id: "jiobp", label: "Jio-bp", height: 204 },
  { id: "essar", label: "Essar", height: 204 },
  { id: "nayara", label: "Nayara", height: 204 },
] as const;

type BrandId = (typeof brands)[number]["id"];

/** Petroleum page: preview the tanker in each oil company's approved livery. */
export function BrandingSwitcher() {
  const [active, setActive] = useState<BrandId>("iocl");
  const current = brands.find((b) => b.id === active) ?? brands[0];

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 items-center justify-center bg-white p-4 md:p-8">
        {/* key forces a fresh fade-in per brand */}
        <Image
          key={current.id}
          src={`/images/petroleum/${current.id}.webp`}
          alt={`Petroleum tanker in ${current.label} branding`}
          width={480}
          height={current.height}
          sizes="(min-width: 1024px) 640px, 90vw"
          className="h-auto w-full animate-in object-contain duration-500 fade-in zoom-in-95"
        />
      </div>
      <div className="border-t border-brand/10 bg-[#fbfaff] p-4">
        <p
          id="branding-label"
          className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase"
        >
          Available branding
        </p>
        <div
          role="radiogroup"
          aria-labelledby="branding-label"
          className="flex flex-wrap gap-2"
        >
          {brands.map((b) => {
            const selected = b.id === active;
            return (
              // biome-ignore lint/a11y/useSemanticElements: styled pill radio buttons; role + aria-checked convey state
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setActive(b.id);
                  track({
                    name: "custom",
                    eventName: "branding_select",
                    params: {
                      brand: b.label,
                      product: "Petroleum / Diesel Tanker",
                    },
                  });
                }}
                className={cn(
                  "h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected
                    ? "border-brand bg-brand text-white"
                    : "border-brand/20 bg-white text-brand hover:border-brand/50",
                )}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
