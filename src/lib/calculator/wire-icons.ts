/**
 * Isometric "wire-mesh" shape icons, ported from the legacy calculator.
 * Each icon is an oblique extrusion: dark front outline (w-f), faded back copy (w-b),
 * gold mid-slices and guide lines (w-m) and silhouette edges (w-e). Styled in globals.css.
 *
 * Returns SVG *inner markup* from static, trusted geometry (no user input reaches it).
 */
import { spellPts } from "./outline";
import type { ShapeId } from "./shapes";

const r1 = (n: number) => Math.round(n * 10) / 10;
/** Oblique extrusion vector (depth direction) */
const V: [number, number] = [34, -16];
/** Front-face centre for extruded icons */
const C = { fx: 73, fy: 58 };

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;
/** Half ellipse; `front` = lower half */
const half = (cx: number, cy: number, rx: number, ry: number, front: boolean) =>
  `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 0 ${front ? 0 : 1} ${r1(cx + rx)} ${r1(cy)}`;
const ln = (x1: number, y1: number, x2: number, y2: number) =>
  `M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`;
const el = (cls: string, d: string) =>
  `<path class="${cls}" pathLength="1" d="${d}"/>`;
const shift = (inner: string, dx: number, dy: number) =>
  `<g transform="translate(${r1(dx)} ${r1(dy)})">${inner}</g>`;

/** Points on an ellipse where the tangent is parallel to V (silhouette edges of the extrusion). */
const tang = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): Array<[number, number]> => {
  const t = Math.atan2(-(ry * V[0]), rx * V[1]);
  return [
    [cx + rx * Math.cos(t), cy + ry * Math.sin(t)],
    [cx - rx * Math.cos(t), cy - ry * Math.sin(t)],
  ];
};

/** Generic oblique extrusion of a front outline: back copy, two mid slices, silhouette edges. */
function extrude(
  frontD: string,
  edges: Array<[number, number]>,
  meshEdges: Array<[number, number]>,
  fillD?: string,
) {
  let s = `<g class="w-bk">${shift(el("w-b", frontD), V[0], V[1])}</g>`;
  s += `<g>${shift(el("w-m", frontD), (V[0] * 2) / 3, (V[1] * 2) / 3)}${shift(el("w-m", frontD), V[0] / 3, V[1] / 3)}</g>`;
  for (const [x, y] of edges) s += el("w-e", ln(x, y, x + V[0], y + V[1]));
  for (const [x, y] of meshEdges) s += el("w-m", ln(x, y, x + V[0], y + V[1]));
  s += `<path class="w-fill" d="${fillD ?? frontD}"/>${el("w-f", frontD)}`;
  return s;
}

function spellIcon(): string {
  // Spell outline (HH FABTECH reference profile), converted to an SVG path (y down).
  const pts = spellPts(2400, 1830, 1930, 1475, 70);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => -p[1]);
  const bb = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
  const dd = `${pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x * 100) / 100} ${r1(-y * 100) / 100}`).join("")}Z`;

  const k = Math.min(70 / bb.width, 52 / bb.height);
  const cx0 = bb.x + bb.width / 2;
  const cy0 = bb.y + bb.height / 2;
  const tx = C.fx - k * cx0;
  const ty = C.fy - k * cy0;
  const ix = ((bb.width * k) / 2) * 0.88;
  const iy = ((bb.height * k) / 2) * 0.88;
  const T = `translate(${r1(tx)} ${r1(ty)}) scale(${Math.round(k * 1000) / 1000})`;
  const ghost = (c: string) =>
    `<g transform="${T}"><path class="${c}" pathLength="1" vector-effect="non-scaling-stroke" d="${dd}"/></g>`;

  let s = `<g class="w-bk">${shift(ghost("w-b"), V[0], V[1])}</g>`;
  s += `<g>${shift(ghost("w-m"), (V[0] * 2) / 3, (V[1] * 2) / 3)}${shift(ghost("w-m"), V[0] / 3, V[1] / 3)}</g>`;
  const edgesE: Array<[number, number]> = [
    [C.fx - ix, C.fy - iy],
    [C.fx + ix, C.fy + iy],
  ];
  const edgesM: Array<[number, number]> = [
    [C.fx + ix, C.fy - iy],
    [C.fx - ix, C.fy + iy],
  ];
  for (const p of edgesE)
    s += el("w-e", ln(p[0], p[1], p[0] + V[0], p[1] + V[1]));
  for (const p of edgesM)
    s += el("w-m", ln(p[0], p[1], p[0] + V[0], p[1] + V[1]));
  s += `<g transform="${T}"><path class="w-fill" d="${dd}"/><path class="w-f" vector-effect="non-scaling-stroke" d="${dd}"/></g>`;
  return s;
}

const ICONS: Record<ShapeId, () => string> = {
  spell: spellIcon,
  circle() {
    const r = 23;
    const d = ell(C.fx, C.fy, r, r);
    return (
      extrude(d, tang(C.fx, C.fy, r, r), [], d) +
      el("w-m", ln(C.fx - r, C.fy, C.fx + r, C.fy)) +
      el("w-m", ln(C.fx, C.fy - r, C.fx, C.fy + r))
    );
  },
  oval() {
    const rx = 31;
    const ry = 20;
    const d = ell(C.fx, C.fy, rx, ry);
    return (
      extrude(d, tang(C.fx, C.fy, rx, ry), [], d) +
      el("w-m", ln(C.fx - rx, C.fy, C.fx + rx, C.fy)) +
      el("w-m", ln(C.fx, C.fy - ry, C.fx, C.fy + ry))
    );
  },
  stadium() {
    const w = 31;
    const h = 17;
    const a = w - h;
    const { fx: cx, fy: cy } = C;
    const d = `M${cx - a} ${cy - h}H${cx + a}A${h} ${h} 0 0 1 ${cx + a} ${cy + h}H${cx - a}A${h} ${h} 0 0 1 ${cx - a} ${cy - h}Z`;
    const tl = tang(cx - a, cy, h, h)[0];
    const br = tang(cx + a, cy, h, h)[1];
    return (
      extrude(
        d,
        [tl, br],
        [
          [cx - a, cy - h],
          [cx + a, cy - h],
          [cx + a, cy + h],
        ],
        d,
      ) + el("w-m", ln(cx - w, cy, cx + w, cy))
    );
  },
  rectangular() {
    const fx = 44;
    const fy = 44;
    const w = 62;
    const h = 34;
    const dx = 32;
    const dy = -20;
    const rect = `M${fx} ${fy}h${w}v${h}h${-w}Z`;
    const sh = (c: string, k: number) =>
      `<g transform="translate(${dx * k} ${dy * k})">${el(c, rect)}</g>`;
    let s = `<g class="w-bk">${sh("w-b", 1)}</g>${sh("w-m", 2 / 3)}${sh("w-m", 1 / 3)}`;
    [
      [fx, fy],
      [fx + w, fy],
      [fx + w, fy + h],
      [fx, fy + h],
    ].forEach((p, i) => {
      s += el(i === 3 ? "w-m" : "w-e", ln(p[0], p[1], p[0] + dx, p[1] + dy));
    });
    for (const u of [1 / 3, 2 / 3]) {
      s +=
        el("w-m", ln(fx + w * u, fy, fx + w * u, fy + h)) +
        el("w-m", ln(fx, fy + h * u, fx + w, fy + h * u));
    }
    return `${s}<path class="w-fill" d="${rect}"/>${el("w-f", rect)}`;
  },
  verticalCylinder() {
    const cx = 90;
    const rx = 27;
    const ry = 9;
    const yt = 22;
    const yb = 76;
    let s = el("w-b", half(cx, yb, rx, ry, false));
    for (const y of [38, 50, 62])
      s +=
        el("w-b", half(cx, y, rx, ry, false)) +
        el("w-m", half(cx, y, rx, ry, true));
    for (const u of [0.28, 0.5, 0.72]) {
      const t = Math.PI * u;
      const x = cx + rx * Math.cos(t);
      s += el("w-m", ln(x, yt + ry * Math.sin(t), x, yb + ry * Math.sin(t)));
    }
    s +=
      el("w-e", ln(cx - rx, yt, cx - rx, yb)) +
      el("w-e", ln(cx + rx, yt, cx + rx, yb)) +
      el("w-e", half(cx, yb, rx, ry, true));
    return `${s}<path class="w-fill" d="${ell(cx, yt, rx, ry)}"/>${el("w-f", ell(cx, yt, rx, ry))}`;
  },
  sphere() {
    const cx = 90;
    const cy = 50;
    const r = 31;
    let s = el("w-b", half(cx, cy, r, 10, false));
    for (const dy of [-17, 17]) {
      const rr = Math.sqrt(r * r - dy * dy);
      s +=
        el("w-b", half(cx, cy + dy, rr, (rr * 10) / r, false)) +
        el("w-m", half(cx, cy + dy, rr, (rr * 10) / r, true));
    }
    for (const rx of [11, 22]) s += el("w-m", ell(cx, cy, rx, r));
    return `${s}${el("w-m", half(cx, cy, r, 10, true))}<path class="w-fill" d="${ell(cx, cy, r, r)}"/>${el("w-f", ell(cx, cy, r, r))}`;
  },
  capsuleHorizontal() {
    const x1 = 56;
    const x2 = 124;
    const cy = 50;
    const r = 23;
    const d = `M${x1} ${cy - r}H${x2}A${r} ${r} 0 0 1 ${x2} ${cy + r}H${x1}A${r} ${r} 0 0 1 ${x1} ${cy - r}Z`;
    let s = "";
    for (const x of [x1, x1 + 17, x1 + 34, x1 + 51, x2])
      s += el("w-m", ell(x, cy, 6.5, r));
    for (const o of [11, 19]) {
      const rr = Math.sqrt(r * r - o * o);
      s +=
        el("w-m", ell(x1 - o, cy, (3 * rr) / r, rr)) +
        el("w-m", ell(x2 + o, cy, (3 * rr) / r, rr));
    }
    for (const u of [-0.66, 0, 0.66])
      s += el("w-m", ln(x1, cy + r * u, x2, cy + r * u));
    return `${s}<path class="w-fill" d="${d}"/>${el("w-f", d)}`;
  },
  ellipsoidalHeadsHorizontal() {
    const x1 = 50;
    const x2 = 130;
    const cy = 50;
    const r = 23;
    const hd = 12;
    const d = `M${x1} ${cy - r}H${x2}A${hd} ${r} 0 0 1 ${x2} ${cy + r}H${x1}A${hd} ${r} 0 0 1 ${x1} ${cy - r}Z`;
    let s = "";
    for (const x of [x1, x1 + 20, x1 + 40, x1 + 60, x2])
      s += el("w-m", ell(x, cy, 6.5, r));
    for (const o of [5, 9.5]) {
      const rr = r * Math.sqrt(1 - (o / hd) ** 2);
      s +=
        el("w-m", ell(x1 - o, cy, (3 * rr) / r, rr)) +
        el("w-m", ell(x2 + o, cy, (3 * rr) / r, rr));
    }
    for (const u of [-0.66, 0, 0.66])
      s += el("w-m", ln(x1, cy + r * u, x2, cy + r * u));
    return `${s}<path class="w-fill" d="${d}"/>${el("w-f", d)}`;
  },
  dishBowl() {
    const cx = 90;
    const rx = 38;
    const ry = 9;
    const yt = 34;
    const bowl = `M${cx - rx} ${yt}A${rx} 46 0 0 0 ${cx + rx} ${yt}`;
    let s = el("w-b", half(cx, yt, rx, ry, false));
    for (const y of [48, 62]) {
      const k = Math.sqrt(1 - ((y - yt) / 46) ** 2);
      const rr = rx * k;
      s +=
        el("w-b", half(cx, y, rr, ry * k, false)) +
        el("w-m", half(cx, y, rr, ry * k, true));
    }
    for (const [u, k] of [
      [-0.55, 0.72],
      [0, 1],
      [0.55, 0.72],
    ] as const) {
      const x = cx + rx * u;
      s += el(
        "w-m",
        `M${r1(x)} ${r1(yt + ry * Math.sqrt(1 - u * u))}Q${r1(cx + rx * u * 0.5)} ${r1(yt + 38 * k + 8)} ${cx} ${yt + 46 - 1}`,
      );
    }
    return `${s}<path class="w-fill" d="${bowl}Z"/>${el("w-f", bowl)}${el("w-e", ell(cx, yt, rx, ry))}`;
  },
  coneBottom() {
    const cx = 90;
    const rx = 27;
    const ry = 8;
    const ys = 30;
    const yb = 58;
    const ya = 90;
    const dome = `M${cx - rx} ${ys}A${rx} 13 0 0 1 ${cx + rx} ${ys}`;
    let s =
      el("w-b", half(cx, ys, rx, ry, false)) +
      el("w-b", half(cx, yb, rx, ry, false));
    s +=
      el("w-b", half(cx, 44, rx, ry, false)) +
      el("w-m", half(cx, 44, rx, ry, true));
    for (const y of [70, 80]) {
      const k = (ya - y) / (ya - yb);
      s +=
        el("w-b", half(cx, y, rx * k, ry * k, false)) +
        el("w-m", half(cx, y, rx * k, ry * k, true));
    }
    for (const u of [0.28, 0.5, 0.72]) {
      const t = Math.PI * u;
      const x = cx + rx * Math.cos(t);
      s +=
        el("w-m", ln(x, ys + ry * Math.sin(t), x, yb + ry * Math.sin(t))) +
        el("w-m", ln(x, yb + ry * Math.sin(t), cx, ya));
    }
    s +=
      el("w-m", half(cx, ys, rx, ry, true)) +
      el("w-e", ln(cx - rx, ys, cx - rx, yb)) +
      el("w-e", ln(cx + rx, ys, cx + rx, yb));
    s +=
      el("w-e", ln(cx - rx, yb, cx, ya)) +
      el("w-e", ln(cx + rx, yb, cx, ya)) +
      el("w-e", half(cx, yb, rx, ry, true));
    return `${s}<path class="w-fill" d="${dome}Z"/>${el("w-f", dome)}`;
  },
};

/** Cached SVG inner markup for a shape's wire-mesh icon (viewBox 0 0 180 100). */
const cache = new Map<ShapeId, string>();
export function wireIconMarkup(shape: ShapeId): string {
  let m = cache.get(shape);
  if (!m) {
    m = ICONS[shape]();
    cache.set(shape, m);
  }
  return m;
}

/** A globe-like icon for the "More tank shapes" launcher. */
export function globeIconMarkup(): string {
  const cx = 90;
  const cy = 50;
  const r = 36;
  let s = "";
  for (const rx of [14, 26]) s += el("w-m", ell(cx, cy, rx, r));
  for (const dy of [-20, 0, 20]) {
    const rr = Math.sqrt(r * r - dy * dy);
    s += el("w-m", ell(cx, cy + dy, rr, rr * 0.28));
  }
  return `${s}<path class="w-fill" d="${ell(cx, cy, r, r)}"/>${el("w-f", ell(cx, cy, r, r))}`;
}
