"use client";

import { useId, useMemo } from "react";
import type { SceneModel } from "@/components/three/calc-scene";
import type { Dims } from "@/lib/calculator/geometry";
import { bounds, viewPolygon } from "@/lib/calculator/outline";
import type { ShapeId } from "@/lib/calculator/shapes";
import { fmt } from "@/lib/calculator/units";

/**
 * 2D profile preview, a port of the legacy calculator's drawing:
 * metallic shell, translucent inner pane, clipped water body with a seamless sliding wave,
 * dashed extension lines with solid dimension lines, and an animated dashed "reference"
 * outline with a pulsing call to action while no valid dimensions are entered.
 */

const VW = 700;
const VH = 430;
const CX = 350;
const CY = 205;
const FIT_W = 470;
const FIT_H = 265;

const mm = (v: number, key: string) => `${key} ${fmt(v, 0)} mm`;

type Labels = { w: string; h: string; foot: string };

/** Dimension text per shape (ghost = symbols only), as in the legacy tool. */
function labelsFor(shape: ShapeId, d: Dims, ghost: boolean): Labels {
  const g = ghost;
  switch (shape) {
    case "spell":
    case "oval":
      return {
        w: g ? "W" : mm(d.W, "W"),
        h: g ? "H" : mm(d.H, "H"),
        foot: g ? "L  •  Tank length" : `${mm(d.L, "L")}  •  Tank length`,
      };
    case "circle":
      return {
        w: g ? "D" : mm(d.D, "D"),
        h: g ? "D" : mm(d.D, "D"),
        foot: g ? "L  •  Tank length" : `${mm(d.L, "L")}  •  Tank length`,
      };
    case "rectangular":
      return {
        w: g ? "W" : mm(d.W, "W"),
        h: g ? "H" : mm(d.H, "H"),
        foot: g
          ? "L  •  Tank length"
          : `${mm(d.L, "L")}  •  Tank length${(d.R ?? 0) > 0 ? `  •  R ${fmt(d.R, 0)} mm` : ""}`,
      };
    case "stadium":
      return {
        w: g ? "W" : mm(d.W, "W"),
        h: g ? "H" : mm(d.H, "H"),
        foot: g ? "L  •  Tank length" : `${mm(d.L, "L")}  •  Tank length`,
      };
    case "verticalCylinder":
      return {
        w: g ? "D" : mm(d.D, "D"),
        h: g ? "H" : mm(d.H, "H"),
        foot: "Vertical tank  •  Side view",
      };
    case "sphere":
      return {
        w: g ? "D" : mm(d.D, "D"),
        h: g ? "D" : mm(d.D, "D"),
        foot: "Sphere",
      };
    case "capsuleHorizontal":
      return {
        w: g ? "Lc + D  •  Overall length" : `${fmt(d.Lc + d.D, 0)} mm overall`,
        h: g ? "D" : mm(d.D, "D"),
        foot: g
          ? "Lc  •  Straight section"
          : `${mm(d.Lc, "Lc")}  •  Straight section`,
      };
    case "ellipsoidalHeadsHorizontal":
      return {
        w: g ? "L  •  Overall length" : `${mm(d.L, "L")}  •  Overall`,
        h: g ? "D" : mm(d.D, "D"),
        foot: g
          ? "E  •  Dish depth per end"
          : `${mm(d.E, "E")} per end  •  Shell ${fmt(d.L - 2 * d.E, 0)} mm`,
      };
    case "dishBowl": {
      const half = d.D / 2;
      return {
        w: g ? "D" : mm(d.D, "D"),
        h: g ? "E" : mm(d.E, "E  depth"),
        foot: g
          ? "Dish opening upward"
          : `Dish opening upward  •  ${d.E >= half - 1e-6 ? "Full hemisphere" : `Sphere radius ${fmt((half * half + d.E * d.E) / (2 * d.E), 0)} mm`}`,
      };
    }
    case "coneBottom": {
      const E = d.E ?? 0;
      return {
        w: g ? "D" : mm(d.D, "D"),
        h: g ? "Hc + Hs + E" : `${fmt(d.Hc + d.Hs + E, 0)} mm overall`,
        foot: g
          ? "Hc  •  Cone    Hs  •  Shell    E  •  Top dish"
          : `Cone ${fmt(d.Hc, 0)}  •  Shell ${fmt(d.Hs, 0)}${E > 0 ? `  •  Dish ${fmt(E, 0)}` : "  •  Flat top"} mm`,
      };
    }
  }
}

/** Seam lines (in drawing mm coordinates, y up) for multi-part shells. */
function seamsFor(shape: ShapeId, d: Dims, b: ReturnType<typeof bounds>) {
  const v = (y: number): [number, number, number, number] => [
    b.minX,
    y,
    b.maxX,
    y,
  ];
  const h = (x: number): [number, number, number, number] => [
    x,
    b.minY,
    x,
    b.maxY,
  ];
  switch (shape) {
    case "capsuleHorizontal":
      return [h(-d.Lc / 2), h(d.Lc / 2)];
    case "ellipsoidalHeadsHorizontal":
      return [h(-(d.L / 2 - d.E)), h(d.L / 2 - d.E)];
    case "coneBottom":
      return (d.E ?? 0) > 0 ? [v(d.Hc), v(d.Hc + d.Hs)] : [v(d.Hc)];
    default:
      return [];
  }
}

const PROFILE: readonly ShapeId[] = ["spell", "circle", "oval"];

/** Seamless wave band: the inner group slides exactly one wavelength (CSS) so the loop never shows an edge. */
function Wave({
  left,
  right,
  y,
  amp,
  lam,
  className,
}: {
  left: number;
  right: number;
  y: number;
  amp: number;
  lam: number;
  className: string;
}) {
  const x0 = left - 2 * lam;
  const n = Math.ceil((right - left) / (lam / 2)) + 10;
  let d = `M ${x0} ${y} Q ${x0 + lam / 4} ${y - amp * 2} ${x0 + lam / 2} ${y}`;
  for (let i = 1; i < n; i++) d += ` T ${x0 + (lam / 2) * (i + 1)} ${y}`;
  d += ` L ${x0 + (lam / 2) * n} ${y + 14} L ${x0} ${y + 14} Z`;
  return (
    <g
      className="p2-wave-slide"
      style={{ "--wl": `${lam}px` } as React.CSSProperties}
    >
      <path d={d} className={className} />
    </g>
  );
}

export function Preview2D({ model }: { model: SceneModel }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const poly = useMemo(
    () => viewPolygon(model.shape, model.dims),
    [model.shape, model.dims],
  );
  if (!poly) return null;

  const ghost = !model.valid;
  const b = bounds(poly);
  const sc = Math.min(FIT_W / b.width, FIT_H / b.height);
  const mx = (b.minX + b.maxX) / 2;
  const my = (b.minY + b.maxY) / 2;
  const px = (x: number) => CX + (x - mx) * sc;
  const py = (y: number) => CY - (y - my) * sc;
  const path = `${poly.map(([x, y], i) => `${i ? "L" : "M"} ${px(x).toFixed(2)} ${py(y).toFixed(2)}`).join(" ")} Z`;

  const w = b.width * sc;
  const h = b.height * sc;
  const left = CX - w / 2;
  const right = CX + w / 2;
  const top = CY - h / 2;
  const bottom = CY + h / 2;

  const depth = Math.max(0, Math.min(model.depthMm, b.height));
  const ratio = b.height > 0 ? depth / b.height : 0;
  const lab = labelsFor(model.shape, model.dims, ghost);
  const seams = seamsFor(model.shape, model.dims, b);
  const lam = Math.max(70, w / 2.5);
  const clip = `url(#${uid}c)`;

  const yD = bottom + 50;
  const xD = right + 58;
  const isProfile = PROFILE.includes(model.shape);
  const header = ghost
    ? "Reference profile — no values entered"
    : isProfile
      ? `${fmt(ratio * 100, 1)}% profile fill`
      : `${fmt(model.fillPercent ?? ratio * 100, 1)}% full by volume`;
  const cta = isProfile
    ? model.shape === "circle"
      ? "Enter length and diameter to begin"
      : "Enter length, width and height to begin"
    : "Enter the dimensions to begin";
  const textCls = ghost ? "p2-dim-text p2-ghost" : "p2-dim-text";

  const ly = bottom - h * Math.min(1, ratio);
  const gy = bottom - h * 0.58;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      role="img"
      aria-label={
        ghost
          ? "Reference outline of the tank. Enter dimensions to see the live cross-section."
          : `Tank profile: ${lab.w}, ${lab.h}. ${header}.`
      }
      className="h-auto w-full max-w-[620px] overflow-visible"
    >
      <defs>
        <linearGradient id={`${uid}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef1f4" />
          <stop offset="38%" stopColor="#cbd1d7" />
          <stop offset="55%" stopColor="#f7f8f9" />
          <stop offset="100%" stopColor="#aeb6bf" />
        </linearGradient>
        <linearGradient id={`${uid}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5caee0" />
          <stop offset="100%" stopColor="#17649b" />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <path d={path} />
        </clipPath>
      </defs>

      <g>
        <path
          d={path}
          fill={`url(#${uid}m)`}
          className={ghost ? "p2-outline p2-ref" : "p2-outline"}
        />
        {ghost ? (
          <g clipPath={clip}>
            <rect
              x={left - 20}
              y={gy}
              width={w + 40}
              height={h * 0.58 + 20}
              fill={`url(#${uid}w)`}
              className="p2-liquid p2-ghost-fill"
            />
            <Wave
              left={left}
              right={right}
              y={gy}
              amp={7}
              lam={lam}
              className="p2-wave p2-ghost-wave"
            />
          </g>
        ) : ratio > 0 ? (
          <g clipPath={clip}>
            <rect
              x={left - 20}
              y={ly}
              width={w + 40}
              height={bottom - ly + 20}
              fill={`url(#${uid}w)`}
              className="p2-liquid"
            />
            {ratio > 0.01 && ratio < 0.995 ? (
              <Wave
                left={left}
                right={right}
                y={ly}
                amp={5}
                lam={lam}
                className="p2-wave"
              />
            ) : null}
          </g>
        ) : null}
        <path
          d={path}
          className={ghost ? "p2-inner p2-inner-ref" : "p2-inner"}
          transform={`translate(${CX} ${CY}) scale(0.96) translate(${-CX} ${-CY})`}
        />
        {seams.length ? (
          <g clipPath={clip}>
            {seams.map(([x1, y1, x2, y2]) => (
              <line
                key={`${x1}-${y1}-${x2}-${y2}`}
                x1={px(x1)}
                y1={py(y1)}
                x2={px(x2)}
                y2={py(y2)}
                className="p2-seam"
              />
            ))}
          </g>
        ) : null}
      </g>

      <g>
        <line
          x1={left}
          y1={bottom + 7}
          x2={left}
          y2={yD - 10}
          className="p2-dim-line"
        />
        <line
          x1={right}
          y1={bottom + 7}
          x2={right}
          y2={yD - 10}
          className="p2-dim-line"
        />
        <line x1={left} y1={yD} x2={right} y2={yD} className="p2-dim-arrow" />
        <text x={CX} y={yD + 18} textAnchor="middle" className={textCls}>
          {lab.w}
        </text>
        <line
          x1={right + 7}
          y1={top}
          x2={xD - 10}
          y2={top}
          className="p2-dim-line"
        />
        <line
          x1={right + 7}
          y1={bottom}
          x2={xD - 10}
          y2={bottom}
          className="p2-dim-line"
        />
        <line x1={xD} y1={top} x2={xD} y2={bottom} className="p2-dim-arrow" />
        <text
          x={xD + 18}
          y={CY + 4}
          textAnchor="middle"
          className={textCls}
          transform={`rotate(90 ${xD + 18} ${CY + 4})`}
        >
          {lab.h}
        </text>
        <text x={CX} y={yD + 40} textAnchor="middle" className={textCls}>
          {lab.foot}
        </text>
        <text x={CX} y={26} textAnchor="middle" className={textCls}>
          {header}
        </text>
        {ghost ? (
          <g className="p2-cta">
            <rect x={CX - 165} y={CY - 20} width={330} height={40} rx={20} />
            <text x={CX} y={CY + 5} textAnchor="middle">
              {cta}
            </text>
          </g>
        ) : null}
      </g>
    </svg>
  );
}
