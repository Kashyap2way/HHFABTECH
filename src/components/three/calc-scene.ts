/**
 * 3D tank for the calculator: builds any of the 11 shapes from the same outlines as the 2D view,
 * shows the liquid level, and draws dimension lines with HTML labels pinned to them.
 *
 * Liquid technique: the liquid is a slightly shrunken copy of the tank. Its fragment shader discards
 * everything above the fill level, and back faces still visible through the cut are painted as
 * the flat liquid surface (so there are no gaps and no clipping planes).
 *
 * Plain three.js, loaded lazily by <LazyThreeCanvas/>.
 */
import {
  ACESFilmicToneMapping,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LatheGeometry,
  LineBasicMaterial,
  LineSegments,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  ShadowMaterial,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Dims } from "@/lib/calculator/geometry";
import {
  crossSectionPts,
  isHorizontalLathe,
  latheProfile,
} from "@/lib/calculator/outline";
import type { ShapeId } from "@/lib/calculator/shapes";
import { buildStand, buildTruck, createMaterials } from "./calc-props";
import type { SceneHandle } from "./LazyThreeCanvas";

export type SceneModel = {
  shape: ShapeId;
  /** All dimensions in mm */
  dims: Dims;
  /** Fill depth and maximum depth in mm */
  depthMm: number;
  maxDepthMm: number;
  /** Filled volume (litres) and percent of capacity, when valid */
  filledL?: number;
  fillPercent?: number;
  /** false = show a faint reference tank instead of the liquid */
  valid: boolean;
};

export type CalcSceneHandle = SceneHandle & {
  update: (model: SceneModel | null) => void;
  /** Cut away the near half of the shell so the liquid is visible */
  setCutaway: (on: boolean) => void;
};

const mmFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const EXTRUDED: readonly ShapeId[] = [
  "spell",
  "circle",
  "oval",
  "rectangular",
  "stadium",
];
const SIZE = 4; // largest model dimension in scene units

type DimLine = { a: Vector3; b: Vector3; text: string };
type Label = { el: HTMLElement; anchor: Vector3; w: number; h: number };

/** Liquid: world-space discard above the level, back faces painted as the surface. */
function liquidMaterial() {
  const uniforms = {
    uLevel: { value: -1000 },
    uSurface: { value: new Color(0x4fb0ea) },
    uDeep: { value: new Color(0x071d36) },
    uBottom: { value: 0 },
    uHeight: { value: 1 },
  };
  const mat = new MeshPhysicalMaterial({
    color: 0x15578f,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    side: DoubleSide,
  });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorld;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vWorld;\nuniform float uLevel;\nuniform float uBottom;\nuniform float uHeight;\nuniform vec3 uSurface;\nuniform vec3 uDeep;",
      )
      .replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\nif (vWorld.y > uLevel) discard;",
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float depth = clamp((uLevel - vWorld.y) / max(uHeight, 0.001), 0.0, 1.0);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uDeep, depth * 0.55);
        if (!gl_FrontFacing) {
          vec3 c = mix(uSurface, uDeep * 2.2, clamp(depth * 0.9, 0.0, 0.85));
          float edge = 1.0 - smoothstep(0.0, 0.025, (uLevel - vWorld.y) / max(uHeight, 0.001));
          gl_FragColor = vec4(mix(c, vec3(0.88, 0.96, 1.0), edge * 0.75), 1.0);
        }`,
      );
  };
  return { mat, uniforms };
}

function scaledShape(pts: ReadonlyArray<[number, number]>, s: number): Shape {
  const shape = new Shape();
  pts.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x * s, y * s);
    else shape.lineTo(x * s, y * s);
  });
  shape.closePath();
  return shape;
}

/** Geometry for the tank shell, centred on the origin and scaled to the scene. */
function buildGeometry(m: SceneModel, s: number): BufferGeometry | null {
  const { shape, dims: d } = m;
  if (EXTRUDED.includes(shape)) {
    const pts = crossSectionPts(shape, d);
    if (!pts) return null;
    const len = (d.L ?? 0) * s;
    const geo = new ExtrudeGeometry(scaledShape(pts, s), {
      depth: len,
      bevelEnabled: false,
      curveSegments: 1,
      steps: 1,
    });
    geo.translate(0, 0, -len / 2);
    geo.rotateY(Math.PI / 2); // length along X
    return geo;
  }
  const half = latheProfile(shape, d);
  if (!half) return null;
  const geo = new LatheGeometry(
    half.map(([r, a]) => new Vector2(r * s, a * s)),
    96,
  );
  if (isHorizontalLathe(shape)) geo.rotateZ(-Math.PI / 2);
  geo.computeBoundingBox();
  const c = new Vector3();
  geo.boundingBox?.getCenter(c);
  geo.translate(-c.x, -c.y, -c.z);
  return geo;
}

/** Half-ellipsoid dish end for the profile shapes (emboss). */
function dishGeometry(rx: number, ry: number, rz: number) {
  const geo = new SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  geo.rotateZ(-Math.PI / 2); // pole along +X
  geo.scale(rx, ry, rz);
  return geo;
}

/** Largest overall dimension (mm); the model is scaled so this equals SIZE scene units. */
function maxExtentMm(m: SceneModel): number {
  const d = m.dims;
  const dish = 2 * (d.E ?? 0);
  switch (m.shape) {
    case "spell":
    case "oval":
    case "rectangular":
    case "stadium":
      return Math.max(d.L + dish, d.W, d.H);
    case "circle":
      return Math.max(d.L + dish, d.D);
    case "verticalCylinder":
      return Math.max(d.D, d.H);
    case "sphere":
      return d.D;
    case "coneBottom":
      return Math.max(d.D, d.Hc + d.Hs + (d.E ?? 0));
    case "dishBowl":
      return Math.max(d.D, d.E);
    case "capsuleHorizontal":
      return Math.max(d.D, d.Lc + d.D);
    case "ellipsoidalHeadsHorizontal":
      return Math.max(d.D, d.L);
  }
}

export function mountCalcScene(
  canvas: HTMLCanvasElement,
  labelHost: HTMLElement,
): CalcSceneHandle {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  // Image-based lighting gives the steel and paint believable reflections.
  const pmrem = new PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();
  scene.environmentIntensity = 0.9;
  scene.add(new HemisphereLight(0xffffff, 0xd9dce2, 0.55));
  const key = new DirectionalLight(0xfff8ee, 2.4);
  key.position.set(5, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 5;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.015;
  scene.add(key);
  scene.add(key.target);
  const rim = new DirectionalLight(0xdfe7ff, 0.9);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  // Cutaway: remove the near half of the shell/liquid so the fill level is visible.
  const clip = new Plane(new Vector3(0, 0, -1), 0);
  const mats = createMaterials(clip);
  let cutaway = true;
  const applyCutaway = () => {
    const planes = cutaway ? [clip] : [];
    mats.steel.clippingPlanes = planes;
    liquid.mat.clippingPlanes = planes;
    mats.steel.needsUpdate = true;
    liquid.mat.needsUpdate = true;
  };

  const camera = new PerspectiveCamera(32, 1, 0.1, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  // The page scrolls under the wheel; framing is automatic, so zoom stays off.
  controls.enableZoom = false;
  controls.enableDamping = true;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  controls.autoRotate = !reduceMotion;
  controls.autoRotateSpeed = 0.9;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI * 0.62;
  let resumeTimer: number | undefined;
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
    window.clearTimeout(resumeTimer);
  });
  controls.addEventListener("end", () => {
    if (reduceMotion) return;
    resumeTimer = window.setTimeout(() => {
      controls.autoRotate = true;
    }, 4000);
  });

  const root = new Group();
  scene.add(root);

  // Studio floor: soft neutral disc that fades out, plus a blurred contact shadow under the model.
  const floor = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: new Color(0xe6e8ec) } },
      vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 uColor; varying vec2 vP;
        void main(){
          float fade = 1.0 - smoothstep(0.12, 0.5, length(vP));
          gl_FragColor = vec4(uColor, fade * 0.85);
        }`,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -2;
  scene.add(floor);
  const contactTex = (() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(16,18,24,0.55)");
      grad.addColorStop(0.55, "rgba(16,18,24,0.25)");
      grad.addColorStop(1, "rgba(16,18,24,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
    return new CanvasTexture(c);
  })();
  const contact = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.renderOrder = -1;
  scene.add(contact);
  const shadowFloor = new Mesh(
    new PlaneGeometry(1, 1),
    new ShadowMaterial({ opacity: 0.18 }),
  );
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  const liquid = liquidMaterial();
  applyCutaway();
  const lineMat = new LineBasicMaterial({
    color: 0xf6dd8a,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });

  let current: {
    objects: Group;
    labels: Label[];
    radius: number;
    /** Tall models need more breathing room than wide ones */
    fit: number;
    center: Vector3;
  } | null = null;
  const tmp = new Vector3();

  function clearCurrent() {
    if (!current) return;
    root.remove(current.objects);
    current.objects.traverse((o) => {
      if (o instanceof Mesh || o instanceof LineSegments) {
        o.geometry.dispose();
        const mat = o.material as Material | Material[];
        // shared materials are disposed at unmount
        for (const mm of Array.isArray(mat) ? mat : [mat]) {
          if (mm !== liquid.mat && mm !== lineMat && !mats.all.includes(mm))
            mm.dispose();
        }
      }
    });
    for (const l of current.labels) l.el.remove();
    current = null;
  }

  /**
   * Dimension lines. Horizontal tanks sit on a truck, so their lines go where the vehicle
   * doesn't: length above the handrails, width across the rear top, height beside the rear end.
   */
  function dimensionLines(
    m: SceneModel,
    s: number,
    ext: Vector3,
    clearTop: number,
  ): DimLine[] {
    const d = m.dims;
    const pad = Math.max(0.28, SIZE * 0.07);
    const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
    const mm = (n: number) => `${mmFmt.format(n)} mm`;
    const lines: DimLine[] = [];
    const hx = ext.x;
    const hy = ext.y;
    const hz = ext.z;
    const rearX = -hx - pad * 0.7;
    const topY = Math.max(clearTop, hy) + pad * 0.6;

    if (EXTRUDED.includes(m.shape) || isHorizontalLathe(m.shape)) {
      const lenKey = m.shape === "capsuleHorizontal" ? "Lc" : "L";
      const len = d[lenKey] ?? 0;
      const lx = (len * s) / 2;
      lines.push({
        a: V(-lx, topY, hz * 0.6),
        b: V(lx, topY, hz * 0.6),
        text: `${lenKey} ${mm(len)}`,
      });
      const vertical =
        m.shape === "spell" ||
        m.shape === "oval" ||
        m.shape === "rectangular" ||
        m.shape === "stadium"
          ? `H ${mm(d.H)}`
          : `D ${mm(d.D)}`;
      lines.push({
        a: V(rearX, -hy, hz + pad * 0.5),
        b: V(rearX, hy, hz + pad * 0.5),
        text: vertical,
      });
      if (m.shape !== "circle" && !isHorizontalLathe(m.shape)) {
        lines.push({
          a: V(rearX, topY, -hz),
          b: V(rearX, topY, hz),
          text: `W ${mm(d.W)}`,
        });
      }
      return lines;
    }
    const front = hz + pad * 0.35;
    switch (m.shape) {
      case "verticalCylinder":
        lines.push({
          a: V(-hx, hy + pad * 0.5, front),
          b: V(hx, hy + pad * 0.5, front),
          text: `D ${mm(d.D)}`,
        });
        lines.push({
          a: V(-hx - pad, -hy, 0),
          b: V(-hx - pad, hy, 0),
          text: `H ${mm(d.H)}`,
        });
        break;
      case "sphere":
        lines.push({
          a: V(-hx, hy + pad * 0.6, 0),
          b: V(hx, hy + pad * 0.6, 0),
          text: `D ${mm(d.D)}`,
        });
        break;
      case "coneBottom": {
        const hc = d.Hc * s;
        const hs = d.Hs * s;
        const bottom = -hy;
        lines.push({
          a: V(-hx, hy + pad * 0.5, front),
          b: V(hx, hy + pad * 0.5, front),
          text: `D ${mm(d.D)}`,
        });
        lines.push({
          a: V(-hx - pad, bottom, 0),
          b: V(-hx - pad, bottom + hc, 0),
          text: `Hc ${mm(d.Hc)}`,
        });
        lines.push({
          a: V(-hx - pad, bottom + hc, 0),
          b: V(-hx - pad, bottom + hc + hs, 0),
          text: `Hs ${mm(d.Hs)}`,
        });
        break;
      }
      case "dishBowl":
        lines.push({
          a: V(-hx, hy + pad * 0.5, 0),
          b: V(hx, hy + pad * 0.5, 0),
          text: `D ${mm(d.D)}`,
        });
        lines.push({
          a: V(hx + pad, -hy, 0),
          b: V(hx + pad, hy, 0),
          text: `E ${mm(d.E)}`,
        });
        break;
      default:
    }
    return lines;
  }

  /** Weld bands / course seams: thin rings slightly proud of the shell. */
  function shellBands(m: SceneModel, s: number, ext: Vector3): Mesh[] {
    const u = s * 1000;
    const out: Mesh[] = [];
    const t = 0.012 * u;
    if (EXTRUDED.includes(m.shape)) {
      const pts = crossSectionPts(m.shape, m.dims);
      if (!pts) return out;
      const outer = scaledShape(pts, s * 1.012);
      const inner = scaledShape(pts, s * 0.995);
      outer.holes.push(inner);
      const len = (m.dims.L ?? 0) * s;
      const n = Math.max(1, Math.round(len / (1.5 * u)));
      const geo = new ExtrudeGeometry(outer, {
        depth: 0.045 * u,
        bevelEnabled: false,
        curveSegments: 1,
      });
      geo.translate(0, 0, -0.0225 * u);
      geo.rotateY(Math.PI / 2);
      for (let i = 0; i <= n; i++) {
        const band = new Mesh(i === 0 ? geo : geo.clone(), mats.steel);
        band.position.x = -len / 2 + (i / n) * len;
        band.castShadow = true;
        out.push(band);
      }
      return out;
    }
    const ring = (r: number, axis: "x" | "y", pos: number) => {
      const band = new Mesh(new TorusGeometry(r * 1.004, t, 8, 96), mats.steel);
      if (axis === "x") {
        band.rotation.y = Math.PI / 2;
        band.position.x = pos;
      } else {
        band.rotation.x = Math.PI / 2;
        band.position.y = pos;
      }
      out.push(band);
    };
    const d = m.dims;
    if (m.shape === "capsuleHorizontal")
      for (const x of [-d.Lc / 2, d.Lc / 2]) ring(ext.y, "x", x * s);
    if (m.shape === "ellipsoidalHeadsHorizontal")
      for (const x of [-(d.L / 2 - d.E), d.L / 2 - d.E])
        ring(ext.y, "x", x * s);
    if (m.shape === "verticalCylinder") {
      const H = d.H * s;
      const n = Math.max(1, Math.round(H / (1.5 * u)));
      for (let i = 0; i <= n; i++) ring(ext.x, "y", -ext.y + (i / n) * H);
    }
    if (m.shape === "coneBottom") {
      const y0 = -ext.y + d.Hc * s;
      ring(ext.x, "y", y0);
      ring(ext.x, "y", y0 + d.Hs * s);
    }
    return out;
  }

  function build(m: SceneModel) {
    clearCurrent();
    const s = SIZE / maxExtentMm(m);
    const shellGeo = buildGeometry(m, s);
    if (!shellGeo) return;
    shellGeo.computeBoundingBox();
    const box = shellGeo.boundingBox;
    if (!box) return;

    const objects = new Group();
    const E = m.dims.E ?? 0;
    const hasDish =
      (m.shape === "spell" || m.shape === "circle" || m.shape === "oval") &&
      E > 0;
    // Extruded bodies drop their flat end caps when dish ends cover them.
    const extruded = EXTRUDED.includes(m.shape);
    const shell = new Mesh(
      shellGeo,
      extruded && hasDish ? [mats.hidden, mats.steel] : mats.steel,
    );
    shell.castShadow = true;
    objects.add(shell);

    const size = new Vector3();
    box.getSize(size);
    const ext = size.clone().multiplyScalar(0.5);

    // Dish ends for the profile shapes
    const dishes: Mesh[] = [];
    if (hasDish) {
      for (const side of [-1, 1]) {
        const g = dishGeometry(E * s, ext.y, ext.z);
        const mesh = new Mesh(g, mats.steel);
        mesh.castShadow = true;
        mesh.position.x = side * ((m.dims.L * s) / 2);
        if (side < 0) mesh.rotation.y = Math.PI;
        dishes.push(mesh);
        objects.add(mesh);
      }
    }

    // Liquid: shrunken copy of the shell (+ dishes), so it sits inside the glass
    const inset = 0.965;
    const liq = new Group();
    liq.add(
      new Mesh(
        shellGeo.clone(),
        extruded && hasDish ? [mats.hidden, liquid.mat] : liquid.mat,
      ),
    );
    for (const dMesh of dishes) {
      const lm = new Mesh(dMesh.geometry.clone(), liquid.mat);
      lm.position.copy(dMesh.position);
      lm.rotation.copy(dMesh.rotation);
      liq.add(lm);
    }
    liq.scale.setScalar(inset);
    liq.children.forEach((c) => {
      c.renderOrder = 1;
    });
    objects.add(liq);

    // Extents including the dish ends, for the camera and the dimension lines
    const total = new Vector3(
      ext.x + (dishes.length ? E * s : 0),
      ext.y,
      ext.z,
    );

    // Level (world Y). The liquid mesh is centred and scaled by `inset`.
    const frac =
      m.maxDepthMm > 0 ? Math.max(0, Math.min(1, m.depthMm / m.maxDepthMm)) : 0;
    const bottomY = -ext.y * inset;
    const heightY = 2 * ext.y * inset;
    liquid.uniforms.uLevel.value = m.valid
      ? bottomY + frac * heightY + (frac >= 1 ? 1 : 0)
      : -1000;
    liquid.uniforms.uHeight.value = heightY;

    // Carrier: tanker truck for horizontal tanks, industrial stand otherwise
    for (const band of shellBands(m, s, ext)) objects.add(band);

    let groundY = -ext.y - 0.02;
    let minX = -total.x;
    let maxX = total.x;
    let topY = total.y + 0.5 * s * 1000;
    let clearTop = total.y;
    const horizontal = extruded || isHorizontalLathe(m.shape);
    if (horizontal) {
      const truck = buildTruck(mats, total, s);
      objects.add(truck.group);
      groundY = truck.groundY;
      minX = truck.minX;
      maxX = truck.maxX;
      topY = truck.topY;
      clearTop = truck.topY;
    } else {
      const coneH = m.shape === "coneBottom" ? (m.dims.Hc ?? 0) * s : 0;
      const stand = buildStand(m.shape, mats, total, s, coneH);
      objects.add(stand.group);
      groundY = stand.groundY;
      if (stand.topY !== undefined) topY = stand.topY;
    }
    objects.traverse((o) => {
      if (o instanceof Mesh && o.castShadow) o.receiveShadow = true;
    });

    // Dimension lines
    // Reference (ghost) state shows symbols only, like the 2D drawing.
    const dl = dimensionLines(m, s, total, clearTop).map((l) =>
      m.valid ? l : { ...l, text: l.text.split(" ")[0] },
    );
    const verts: number[] = [];
    const tick = 0.1;
    const labels: Label[] = [];
    for (const { a, b, text } of dl) {
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const dir = b.clone().sub(a).normalize();
      // perpendicular tick marks
      const perp =
        Math.abs(dir.y) > 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
      for (const p of [a, b]) {
        verts.push(
          p.x - perp.x * tick,
          p.y - perp.y * tick,
          p.z - perp.z * tick,
          p.x + perp.x * tick,
          p.y + perp.y * tick,
          p.z + perp.z * tick,
        );
      }
      const el = document.createElement("span");
      el.textContent = text;
      el.className =
        "pointer-events-none absolute top-0 left-0 whitespace-nowrap rounded-md border border-[#d7b65d]/50 bg-[#150f26]/85 px-1.5 py-0.5 text-[10px] font-semibold text-[#f6e7b4] shadow-sm will-change-transform sm:px-2 sm:text-[11px]";
      labelHost.appendChild(el);
      labels.push({
        el,
        anchor: a.clone().add(b).multiplyScalar(0.5),
        w: 0,
        h: 0,
      });
    }
    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute("position", new Float32BufferAttribute(verts, 3));
    objects.add(new LineSegments(lineGeo, lineMat));

    const center = new Vector3((minX + maxX) / 2, (groundY + topY) / 2, 0);
    const reachX = (maxX - minX) / 2;
    const reachY = (topY - groundY) / 2;

    // Ground + shadow
    floor.position.set(center.x, groundY - 0.005, 0);
    floor.scale.setScalar(Math.max(reachX, reachY, total.z, 3) * 3.2);
    shadowFloor.position.set(center.x, groundY, 0);
    shadowFloor.scale.setScalar(Math.max(reachX, reachY, total.z, 3) * 4);
    contact.position.set(center.x, groundY + 0.002, 0);
    contact.scale.set((maxX - minX) * 1.25, total.z * 3.2, 1);

    const radius = Math.hypot(reachX, reachY, total.z) + 0.5;
    const sh = key.shadow.camera;
    sh.left = -radius;
    sh.right = radius;
    sh.top = radius;
    sh.bottom = -radius;
    sh.near = 0.5;
    sh.far = radius * 8;
    sh.updateProjectionMatrix();
    key.position
      .copy(center)
      .add(new Vector3(0.5, 0.95, 0.65).multiplyScalar(radius * 3));
    key.target.position.copy(center);
    key.target.updateMatrixWorld();

    root.add(objects);
    const fit = reachY > reachX ? 0.92 : 0.66;
    current = { objects, labels, radius, fit, center };
    frameCamera(radius, fit, center);
  }

  function frameCamera(radius: number, fit: number, center: Vector3) {
    // Fit the bounding sphere inside the NARROWER of the vertical and horizontal view angles.
    const vHalf = (camera.fov * Math.PI) / 360;
    const hHalf = Math.atan(Math.tan(vHalf) * Math.max(0.3, camera.aspect));
    const dist = (radius / Math.sin(Math.min(vHalf, hHalf))) * fit;
    const rel = camera.position.clone().sub(controls.target);
    const dir =
      rel.lengthSq() > 0.0001
        ? rel.normalize()
        : new Vector3(0.75, 0.38, 0.9).normalize();
    camera.position.copy(center).add(dir.multiplyScalar(dist));
    controls.target.copy(center);
    controls.minDistance = dist * 0.5;
    controls.maxDistance = dist * 2;
    controls.update();
  }

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (current) frameCamera(current.radius, current.fit, current.center);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  /** Project labels, then nudge any that overlap so they never stack on small screens. */
  const placed: Array<{ x: number; y: number; l: Label }> = [];
  function positionLabels() {
    if (!current) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    placed.length = 0;
    for (const l of current.labels) {
      if (!l.w) {
        l.w = l.el.offsetWidth;
        l.h = l.el.offsetHeight;
      }
      tmp.copy(l.anchor).project(camera);
      l.el.style.opacity = tmp.z < 1 ? "1" : "0";
      placed.push({
        x: (tmp.x * 0.5 + 0.5) * w,
        y: (-tmp.y * 0.5 + 0.5) * h,
        l,
      });
    }
    const gap = 4;
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          const A = placed[i];
          const B = placed[j];
          const ox = (A.l.w + B.l.w) / 2 + gap - Math.abs(A.x - B.x);
          const oy = (A.l.h + B.l.h) / 2 + gap - Math.abs(A.y - B.y);
          if (ox > 0 && oy > 0) {
            // separate along the cheaper axis, half each
            if (oy <= ox) {
              const dir = A.y <= B.y ? -1 : 1;
              A.y += (dir * oy) / 2;
              B.y -= (dir * oy) / 2;
            } else {
              const dir = A.x <= B.x ? -1 : 1;
              A.x += (dir * ox) / 2;
              B.x -= (dir * ox) / 2;
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    for (const p of placed) {
      const x = Math.min(w - p.l.w / 2 - 4, Math.max(p.l.w / 2 + 4, p.x));
      const y = Math.min(h - p.l.h / 2 - 4, Math.max(p.l.h / 2 + 4, p.y));
      p.l.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  }

  let frame = 0;
  let active = false;
  const orientClip = () => {
    // cut away whichever half faces the camera
    clip.normal.set(0, 0, camera.position.z >= 0 ? -1 : 1);
  };
  const tick = () => {
    controls.update();
    orientClip();
    renderer.render(scene, camera);
    positionLabels();
    frame = requestAnimationFrame(tick);
  };

  return {
    update(model) {
      if (!model) {
        clearCurrent();
        return;
      }
      build(model);
      orientClip();
      renderer.render(scene, camera);
      positionLabels();
    },
    setCutaway(on) {
      cutaway = on;
      applyCutaway();
      renderer.render(scene, camera);
    },
    setActive(next) {
      if (next === active) return;
      active = next;
      if (active) frame = requestAnimationFrame(tick);
      else cancelAnimationFrame(frame);
    },
    dispose() {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer);
      ro.disconnect();
      controls.dispose();
      clearCurrent();
      floor.geometry.dispose();
      (floor.material as Material).dispose();
      liquid.mat.dispose();
      for (const mt of mats.all) mt.dispose();
      mats.disposeTextures();
      envRT.dispose();
      contact.geometry.dispose();
      (contact.material as Material).dispose();
      contactTex.dispose();
      shadowFloor.geometry.dispose();
      (shadowFloor.material as Material).dispose();
      lineMat.dispose();
      renderer.dispose();
    },
  };
}
