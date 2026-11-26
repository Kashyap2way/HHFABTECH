"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CalcSceneHandle,
  SceneModel,
} from "@/components/three/calc-scene";
import {
  LazyThreeCanvas,
  type SceneLoader,
} from "@/components/three/LazyThreeCanvas";
import { fmt } from "@/lib/calculator/units";
import { cn } from "@/lib/utils";
import { Preview2D } from "./Preview2D";

/**
 * The 3D tanker-truck viewer. This module is only ever loaded through next/dynamic from
 * InstantQuoteButton, so its chunk (and the three.js chunk it triggers) is requested the first
 * time a visitor opens "Get instant quote", never on the calculator's initial load.
 */
export default function InstantQuote3D({ model }: { model: SceneModel }) {
  const [cutaway, setCutaway] = useState(true);
  const cutawayRef = useRef(cutaway);
  cutawayRef.current = cutaway;
  const labelHost = useRef<HTMLDivElement>(null);
  const handle = useRef<CalcSceneHandle | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;

  const load = useCallback<SceneLoader<CalcSceneHandle>>(
    () =>
      import("@/components/three/calc-scene").then(
        ({ mountCalcScene }) =>
          (canvas: HTMLCanvasElement) => {
            const host = labelHost.current;
            if (!host) throw new Error("label host missing");
            return mountCalcScene(canvas, host);
          },
      ),
    [],
  );

  const onHandle = useCallback((h: CalcSceneHandle | null) => {
    handle.current = h;
    if (h) {
      h.setCutaway(cutawayRef.current);
      h.update(modelRef.current);
    }
  }, []);

  useEffect(() => {
    handle.current?.setCutaway(cutaway);
  }, [cutaway]);

  useEffect(() => {
    const id = window.setTimeout(() => handle.current?.update(model), 120);
    return () => window.clearTimeout(id);
  }, [model]);

  return (
    <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
      <LazyThreeCanvas<CalcSceneHandle>
        load={load}
        onHandle={onHandle}
        rootMargin="0px"
        allowReducedMotion
        label="Interactive 3D model of the tank on a tanker truck. Drag to rotate."
        className="size-full"
        fallback={
          <div className="absolute inset-0 grid place-items-center">
            <p className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#475467] shadow-sm">
              Loading 3D model…
            </p>
            <Preview2D model={model} />
          </div>
        }
      />
      <div
        ref={labelHost}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />
      {model.valid && model.filledL !== undefined ? (
        <p className="pointer-events-none absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#17649b] shadow-sm backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-[#2f8fd0]"
          />
          Filled {fmt(model.fillPercent ?? 0, 1)}% · {fmt(model.filledL, 0)} L
        </p>
      ) : null}
      <button
        type="button"
        aria-pressed={cutaway}
        onClick={() => setCutaway((c) => !c)}
        className="absolute bottom-2 left-2 inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-[#e0e3e7] bg-white/90 px-3 text-xs font-semibold text-[#344054] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:ring-3 focus-visible:ring-[#b8860b]/30 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full",
            cutaway ? "bg-sky-500" : "bg-[#98a2b3]",
          )}
        />
        Cutaway {cutaway ? "on" : "off"}
      </button>
    </div>
  );
}
