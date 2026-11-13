"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

/** What a scene module returns once mounted on a canvas. */
export type SceneHandle = {
  /** Start or stop the render loop. */
  setActive: (active: boolean) => void;
  dispose: () => void;
};

export type SceneLoader<H extends SceneHandle = SceneHandle> = () => Promise<
  (canvas: HTMLCanvasElement) => H
>;

type LazyThreeCanvasProps<H extends SceneHandle = SceneHandle> = {
  /** Dynamic import of the scene, e.g. `() => import("./tank-scene").then((m) => m.mountTankScene)`. */
  load: SceneLoader<H>;
  /** Receives the mounted scene (or null on unmount) so the parent can drive it. */
  onHandle?: (handle: H | null) => void;
  /** Shown before the scene is ready, and permanently if 3D is skipped. */
  fallback: ReactNode;
  /** Accessible description of the animation. */
  label: string;
  /**
   * Still load the scene for visitors who prefer reduced motion. Use for interactive tools
   * where 3D is content, not decoration; the scene itself must then avoid auto-motion.
   */
  allowReducedMotion?: boolean;
  /** Start loading this far before the canvas scrolls into view. */
  rootMargin?: string;
  className?: string;
};

function canUseWebGL(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Reusable lazy three.js host. The three.js chunk is only downloaded when the
 * canvas approaches the viewport, never during initial page load. It is skipped
 * for reduced motion, Save-Data and devices without WebGL2, and the render loop
 * pauses whenever the canvas is offscreen or the tab is hidden.
 */
export function LazyThreeCanvas<H extends SceneHandle = SceneHandle>({
  load,
  onHandle,
  fallback,
  label,
  rootMargin = "300px",
  allowReducedMotion = false,
  className,
}: LazyThreeCanvasProps<H>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadRef = useRef(load);
  loadRef.current = load;
  const onHandleRef = useRef(onHandle);
  onHandleRef.current = onHandle;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true;
    if ((reduced && !allowReducedMotion) || saveData || !canUseWebGL()) return;

    let handle: H | null = null;
    let cancelled = false;
    let visible = false;

    // 1) Load when near the viewport. 2) Pause/resume with visibility.
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loader.disconnect();
        void loadRef.current().then((mount) => {
          if (cancelled) return;
          handle = mount(canvas);
          handle.setActive(visible && document.visibilityState === "visible");
          onHandleRef.current?.(handle);
          setReady(true);
        });
      },
      { rootMargin },
    );
    const pauser = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      handle?.setActive(visible && document.visibilityState === "visible");
    });
    const onVisibility = () =>
      handle?.setActive(visible && document.visibilityState === "visible");

    loader.observe(wrap);
    pauser.observe(wrap);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      loader.disconnect();
      pauser.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      onHandleRef.current?.(null);
      handle?.dispose();
    };
  }, [rootMargin, allowReducedMotion]);

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      <div
        className={`transition-opacity duration-700 ${ready ? "pointer-events-none absolute inset-0 opacity-0" : "opacity-100"}`}
      >
        {fallback}
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className={`absolute inset-0 size-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
