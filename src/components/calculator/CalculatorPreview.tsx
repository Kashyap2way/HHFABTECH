"use client";

import type { SceneModel } from "@/components/three/calc-scene";
import { Preview2D } from "./Preview2D";

/**
 * Calculator preview: the lightweight 2D drawing only. No three.js is imported here, so the
 * calculator page ships no 3D code. The 3D truck lives behind the "Get instant quote" button
 * (see InstantQuoteButton) and is downloaded only when that button is pressed.
 */
export function Preview({
  model,
  shapeName,
}: {
  model: SceneModel;
  shapeName: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#150f26]">2D profile preview</p>
          <p className="mt-1 text-[11px] text-[#667085]">
            Live geometry based on your dimensions
          </p>
        </div>
        <span className="hidden rounded-full border border-[#e6e8ec] bg-white/75 px-2.5 py-[7px] text-[10px] font-bold text-[#475467] shadow-[0_0_0_3px_rgb(184_134_11/0.1)] sm:inline-block">
          {shapeName}
        </span>
      </div>

      <div className="relative mt-4 grid aspect-[4/3] w-full place-items-center sm:aspect-[16/11]">
        <Preview2D model={model} />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[#667085]">
        {model.valid
          ? "Proportional engineering illustration. Not a fabrication drawing."
          : "Empty reference outline. Enter dimensions to see the live profile."}
      </p>
    </div>
  );
}
