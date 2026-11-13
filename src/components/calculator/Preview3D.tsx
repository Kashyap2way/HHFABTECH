"use client";

import { BoxIcon, SquareIcon } from "lucide-react";
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

type View = "3d" | "2d";

/**
 * Preview with a 3D / 2D toggle. The 2D drawing is always available instantly and is also the
 * 3D fallback; three.js is only downloaded when the 3D view is on screen.
 */
export function Preview({
  model,
  shapeName,
}: {
  model: SceneModel;
  shapeName: string;
}) {
  const [view, setView] = useState<View>("3d");
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

  // Rebuild the 3D model shortly after the inputs settle (avoids a rebuild per keystroke).
  useEffect(() => {
    const id = window.setTimeout(() => handle.current?.update(model), 120);
    return () => window.clearTimeout(id);
  }, [model]);

  const toggle = (v: View, label: string, icon: React.ReactNode) => (
    // biome-ignore lint/a11y/useSemanticElements: segmented control; role + aria-checked convey the state
    <button
      type="button"
      role="radio"
      aria-checked={view === v}
      onClick={() => setView(v)}
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-[#b8860b]/30 focus-visible:outline-none",
        view === v
          ? "bg-[#111318] text-white"
          : "text-[#667085] hover:text-[#111318]",
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#150f26]">
            {view === "3d" ? "3D model preview" : "2D profile preview"}
          </p>
          <p className="mt-1 text-[11px] text-[#667085]">
            Live geometry based on your dimensions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-[#e6e8ec] bg-white/75 px-2.5 py-[7px] text-[10px] font-bold text-[#475467] shadow-[0_0_0_3px_rgb(184_134_11/0.1)] sm:inline-block">
            {shapeName}
          </span>
          <div
            role="radiogroup"
            aria-label="Preview type"
            className="inline-flex rounded-full border border-[#e0e3e7] bg-white p-[3px]"
          >
            {toggle(
              "3d",
              "3D",
              <BoxIcon aria-hidden="true" className="size-3.5" />,
            )}
            {toggle(
              "2d",
              "2D",
              <SquareIcon aria-hidden="true" className="size-3.5" />,
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-4 aspect-[4/3] w-full sm:aspect-[16/11]">
        <div
          className={cn(
            "absolute inset-0 place-items-center",
            view === "2d" ? "grid" : "hidden",
          )}
        >
          <Preview2D model={model} />
        </div>
        <div
          className={cn("absolute inset-0", view === "3d" ? "block" : "hidden")}
        >
          <LazyThreeCanvas<CalcSceneHandle>
            load={load}
            onHandle={onHandle}
            allowReducedMotion
            label="Interactive 3D model of the tank with its dimensions. Drag to rotate."
            className="size-full"
            fallback={
              <div className="absolute inset-0 grid place-items-center">
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
              Filled {fmt(model.fillPercent ?? 0, 1)}% · {fmt(model.filledL, 0)}{" "}
              L
            </p>
          ) : null}
          {!model.valid ? (
            <p className="p2-cta pointer-events-none absolute top-1/2 left-1/2 w-max max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7b65d]/75 bg-[#150f26]/[0.88] px-5 py-2.5 text-center text-[13px] font-semibold text-[#f6e7b4] shadow-[0_8px_14px_rgb(43_24_80/0.28)]">
              Enter the dimensions to begin
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
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[#667085]">
        {model.valid
          ? "Proportional engineering illustration. Not a fabrication drawing."
          : "Empty reference outline. Enter dimensions to see the live model."}
        {view === "3d" ? " Drag to rotate." : ""}
      </p>
    </div>
  );
}
