/**
 * Engineering-style 3D tank for the calculator promo.
 *
 * Liquid technique: the liquid is ONE closed lathe mesh (shell + dished ends).
 * Its fragment shader discards everything above the fill level, and back faces
 * that remain visible through the cut are painted as the liquid surface. This
 * gives a solid, gap-free liquid with a flat top at any level, with no clipping
 * planes and no per-frame geometry rebuilds.
 *
 * Plain three.js (no React layer) so the lazily loaded chunk stays small.
 */
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LatheGeometry,
  LineBasicMaterial,
  LineSegments,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { SceneHandle } from "./LazyThreeCanvas";

/** Real-world tank the animation represents (matches the promo readout). */
export const TANK = { diameterM: 1.2, lengthM: 3.0 } as const;

/** Litres in a horizontal cylinder filled to `fraction` of its diameter. */
export function horizontalCylinderLitres(fraction: number): number {
  const r = TANK.diameterM / 2;
  const h = Math.min(Math.max(fraction, 0), 1) * TANK.diameterM;
  const area =
    r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(2 * r * h - h * h);
  return area * TANK.lengthM * 1000;
}

export type TankSceneOptions = {
  /** Called ~10×/s with the current fill (0–1) and litres. */
  onFill?: (fraction: number, litres: number) => void;
};

// Scene units: radius 1. Straight shell length keeps the real 1.2 × 3.0 m ratio.
const R = 1;
const LEN = (TANK.lengthM / TANK.diameterM) * 2 * R;
const DISH = 0.3 * R; // dish-end depth

/** Profile for a horizontal tank with ellipsoidal dished ends, revolved by LatheGeometry. */
function tankProfile(radius: number, dish: number, steps = 18): Vector2[] {
  const pts: Vector2[] = [];
  const half = LEN / 2;
  // bottom dish: from pole (0) to rim (radius)
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new Vector2(Math.sin(a) * radius, -half - Math.cos(a) * dish));
  }
  // top dish: from rim back to pole
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new Vector2(Math.cos(a) * radius, half + Math.sin(a) * dish));
  }
  return pts;
}

/** Lathe geometry along X (lathe builds along Y, so rotate). */
function tankGeometry(radius: number, dish: number, radial = 96) {
  const geo = new LatheGeometry(tankProfile(radius, dish), radial);
  geo.rotateZ(Math.PI / 2);
  return geo;
}

function liquidMaterial() {
  const uniforms = {
    uLevel: { value: 0 },
    uTime: { value: 0 },
    uSurface: { value: new Color(0x6db4e3) },
    uDeep: { value: new Color(0x071d36) },
  };
  const mat = new MeshPhysicalMaterial({
    color: 0x15578f,
    roughness: 0.12,
    metalness: 0,
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
        "#include <common>\nvarying vec3 vWorld;\nuniform float uLevel;\nuniform float uTime;\nuniform vec3 uSurface;\nuniform vec3 uDeep;",
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float wave = sin(vWorld.x * 1.6 + uTime * 1.4) * 0.018 + sin(vWorld.z * 2.3 - uTime * 1.1) * 0.012;
        if (vWorld.y > uLevel + wave) discard;`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        // Depth tint: darker toward the bottom of the tank.
        float depth = clamp((uLevel - vWorld.y) / 2.0, 0.0, 1.0);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uDeep, depth * 0.55);
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize((viewMatrix * vec4(viewDir, 0.0)).xyz))), 3.0);
        gl_FragColor.rgb += vec3(0.35, 0.6, 0.85) * fres * 0.35;
        // Back faces seen through the cut read as the flat liquid surface.
        if (!gl_FrontFacing) {
          // Surface: faint moving caustic streaks.
          float streak = 0.5 + 0.5 * sin(vWorld.x * 4.0 + sin(vWorld.z * 3.0 + uTime) * 1.5 + uTime * 0.6);
          vec3 surf = mix(uSurface * 0.8, uSurface, streak * 0.4);
          gl_FragColor = vec4(surf, 1.0);
        }`,
      );
  };
  return { mat, uniforms };
}

/** Thin glass shell: nearly invisible face-on, bright at grazing angles (Fresnel). */
function glassMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: { uColor: { value: new Color(0xcfd8ff) } },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
        gl_FragColor = vec4(uColor, 0.025 + f * 0.6);
      }`,
  });
}

/** Fading engineering grid under the tank. */
function gridMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new Color(0xb9a6ff) } },
    vertexShader: `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor; varying vec2 vP;
      float line(float x, float w) { float d = abs(fract(x - 0.5) - 0.5) / fwidth(x); return 1.0 - min(d / w, 1.0); }
      void main() {
        float g = max(line(vP.x * 2.0, 1.0), line(vP.y * 2.0, 1.0)) * 0.35
                + max(line(vP.x * 0.5, 1.2), line(vP.y * 0.5, 1.2)) * 0.35;
        float fade = 1.0 - smoothstep(1.5, 6.0, length(vP * vec2(0.75, 1.3)));
        gl_FragColor = vec4(uColor, g * fade * 0.28);
      }`,
  });
}

/** Dimension lines with end ticks (length below the tank, diameter at one end). */
function dimensionLines(y: number) {
  const half = LEN / 2 + DISH;
  const t = 0.12;
  const zEnd = R + 0.55;
  const xEnd = half + 0.45;
  const v = [
    // length
    -half,
    y,
    zEnd,
    half,
    y,
    zEnd,
    -half,
    y - t,
    zEnd,
    -half,
    y + t,
    zEnd,
    half,
    y - t,
    zEnd,
    half,
    y + t,
    zEnd,
    // diameter
    xEnd,
    -R,
    0,
    xEnd,
    R,
    0,
    xEnd - t,
    -R,
    0,
    xEnd + t,
    -R,
    0,
    xEnd - t,
    R,
    0,
    xEnd + t,
    R,
    0,
    // extension lines
    -half,
    y + 0.15,
    zEnd,
    -half,
    -R * 0.4,
    zEnd * 0.55,
    half,
    y + 0.15,
    zEnd,
    half,
    -R * 0.4,
    zEnd * 0.55,
  ];
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(v, 3));
  return new LineSegments(
    geo,
    new LineBasicMaterial({
      color: 0xf6dd8a,
      transparent: true,
      opacity: 0.55,
    }),
  );
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function mountTankScene(
  canvas: HTMLCanvasElement,
  { onFill }: TankSceneOptions = {},
): SceneHandle {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.add(new HemisphereLight(0xffffff, 0x1a1033, 0.5));
  const key = new DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new DirectionalLight(0xf4b400, 0.8);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  const camera = new PerspectiveCamera(28, 1, 0.1, 100);
  const tank = new Group();
  scene.add(tank);

  // Liquid (render first so the additive glass sits on top)
  const liquid = liquidMaterial();
  const liquidMesh = new Mesh(tankGeometry(R * 0.965, DISH * 0.94), liquid.mat);
  liquidMesh.renderOrder = 1;
  tank.add(liquidMesh);

  // Glass shell
  const shell = new Mesh(tankGeometry(R, DISH), glassMaterial());
  shell.renderOrder = 3;
  tank.add(shell);

  // Brushed steel: weld seams, end flanges, manhole, saddles
  const steel = new MeshStandardMaterial({
    color: 0xc7ccd6,
    metalness: 1,
    roughness: 0.32,
  });
  const darkSteel = new MeshStandardMaterial({
    color: 0x3a3d48,
    metalness: 0.9,
    roughness: 0.45,
  });
  for (const x of [-LEN / 2, LEN / 2]) {
    const flange = new Mesh(
      new TorusGeometry(R + 0.008, 0.035, 12, 120),
      steel,
    );
    flange.rotation.y = Math.PI / 2;
    flange.position.x = x;
    tank.add(flange);
  }
  for (const x of [-LEN / 6, LEN / 6]) {
    const seam = new Mesh(new TorusGeometry(R + 0.004, 0.012, 8, 120), steel);
    seam.rotation.y = Math.PI / 2;
    seam.position.x = x;
    tank.add(seam);
  }
  const manhole = new Mesh(new CylinderGeometry(0.24, 0.24, 0.12, 48), steel);
  manhole.position.set(0, R + 0.02, 0);
  tank.add(manhole);
  const lid = new Mesh(new CylinderGeometry(0.27, 0.27, 0.035, 48), steel);
  lid.position.set(0, R + 0.095, 0);
  tank.add(lid);

  const floorY = -R - 0.42;
  for (const x of [-LEN * 0.3, LEN * 0.3]) {
    const saddle = new Group();
    const web = new Mesh(new BoxGeometry(0.06, 0.42, 1.55), darkSteel);
    web.position.y = -R - 0.2;
    const foot = new Mesh(new BoxGeometry(0.34, 0.035, 1.75), darkSteel);
    foot.position.y = floorY + 0.018;
    const cradle = new Mesh(
      new TorusGeometry(R + 0.03, 0.03, 8, 64, Math.PI * 0.6),
      darkSteel,
    );
    cradle.rotation.set(0, Math.PI / 2, Math.PI * 1.2);
    saddle.add(web, foot, cradle);
    saddle.position.x = x;
    tank.add(saddle);
  }

  tank.add(dimensionLines(floorY + 0.02));

  // Grid floor (static, not rotated with the tank)
  const grid = new Mesh(new PlaneGeometry(16, 10), gridMaterial());
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = floorY;
  grid.renderOrder = 0;
  scene.add(grid);

  // ---- Sizing: frame the tank for the canvas aspect ----
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = camera.aspect < 1.2 ? 15 : 12.5;
    camera.position.set(dist * 0.42, dist * 0.32, dist * 0.84);
    camera.lookAt(0.3, -0.05, 0);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---- Animation: fill eases between levels; tank sways gently ----
  const targets = [0.3, 0.62, 0.86, 0.48, 0.74, 0.22];
  const holdMs = 2800;
  let from = targets[0];
  let to = targets[1];
  let index = 1;
  let phaseStart = performance.now();
  let pausedAt = 0;
  let lastReport = 0;
  let frame = 0;
  let active = false;

  const render = (now: number) => {
    const t = Math.min((now - phaseStart) / holdMs, 1);
    const fraction = from + (to - from) * smooth(t);
    if (t >= 1) {
      from = to;
      index = (index + 1) % targets.length;
      to = targets[index];
      phaseStart = now;
    }
    // Tank centre is at world y = 0, so the level maps directly.
    liquid.uniforms.uLevel.value = -R * 0.965 + fraction * 2 * R * 0.965;
    liquid.uniforms.uTime.value = now / 1000;
    tank.rotation.y = Math.sin(now / 7000) * 0.2;

    if (onFill && now - lastReport > 100) {
      lastReport = now;
      onFill(fraction, horizontalCylinderLitres(fraction));
    }
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    render(now);
    frame = requestAnimationFrame(tick);
  };

  // First frame immediately so the canvas is never blank when it fades in.
  render(performance.now());

  return {
    setActive(next) {
      if (next === active) return;
      active = next;
      if (active) {
        if (pausedAt) phaseStart += performance.now() - pausedAt;
        frame = requestAnimationFrame(tick);
      } else {
        pausedAt = performance.now();
        cancelAnimationFrame(frame);
      }
    },
    dispose() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof Mesh || obj instanceof LineSegments) {
          obj.geometry.dispose();
          const m = obj.material as Material | Material[];
          for (const mat of Array.isArray(m) ? m : [m]) mat.dispose();
        }
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
