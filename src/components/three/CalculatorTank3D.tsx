"use client";

import { type ReactNode, useCallback, useRef } from "react";
import { LazyThreeCanvas, type SceneLoader } from "./LazyThreeCanvas";

const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Total capacity of the demo tank (1.2 m × 3.0 m horizontal cylinder). */
const TOTAL_LITRES = Math.PI * 0.6 * 0.6 * 3.0 * 1000;

/**
 * Lazy 3D tank for the calculator promo, with a live fill readout.
 * - The readout always reserves its space (no layout shift); it only fades in.
 * - Values update through refs, so the animation never re-renders React.
 */
export function CalculatorTank3D({ fallback }: { fallback: ReactNode }) {
  const readoutRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const litresRef = useRef<HTMLSpanElement>(null);

  const load = useCallback<SceneLoader>(
    () =>
      import("./tank-scene").then(
        ({ mountTankScene }) =>
          (canvas: HTMLCanvasElement) =>
            mountTankScene(canvas, {
              onFill(fraction, litres) {
                const pct = Math.round(fraction * 100);
                if (percentRef.current)
                  percentRef.current.textContent = `${pct}%`;
                if (barRef.current) barRef.current.style.width = `${pct}%`;
                if (litresRef.current)
                  litresRef.current.textContent = fmt.format(litres);
                readoutRef.current?.setAttribute("data-live", "");
              },
            }),
      ),
    [],
  );

  return (
    <figure className="m-0">
      <LazyThreeCanvas
        load={load}
        fallback={fallback}
        label="Animated 3D cross-section of a horizontal tank with the liquid level rising and falling"
        className="aspect-[16/10] w-full"
      />
      <figcaption
        ref={readoutRef}
        aria-hidden="true"
        className="mx-auto mt-4 grid max-w-md grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 opacity-0 backdrop-blur-md transition-opacity duration-700 data-live:opacity-100"
      >
        <span className="text-[11px] tracking-[0.14em] text-white/55 uppercase">
          Fill level
        </span>
        <span className="flex items-center gap-3">
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              ref={barRef}
              className="absolute inset-y-0 left-0 w-0 rounded-full bg-gradient-to-r from-sky-500 to-sky-300"
            />
          </span>
          <span
            ref={percentRef}
            className="w-10 text-right text-sm font-semibold tabular-nums"
          >
            0%
          </span>
        </span>
        <span className="text-[11px] tracking-[0.14em] text-white/55 uppercase">
          Volume
        </span>
        <span className="text-sm text-white/85 tabular-nums">
          <span ref={litresRef} className="font-semibold text-white">
            0
          </span>{" "}
          of {fmt.format(TOTAL_LITRES)} L · Ø 1,200 × 3,000 mm
        </span>
      </figcaption>
    </figure>
  );
}
