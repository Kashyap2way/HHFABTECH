/**
 * Detail props for the calculator's 3D scene: shared PBR materials, a cab-over tanker-truck rig
 * for horizontal tanks, and industrial stands for vertical / spherical tanks.
 *
 * Real-world proportions (metres) are multiplied by `v` (scene units per metre, times a
 * truck-scale factor) so the vehicle stays believable around any tank size.
 */
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Plane,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  type Vector3,
} from "three";

export type Mats = {
  steel: MeshPhysicalMaterial;
  steelTrim: MeshPhysicalMaterial;
  cab: MeshPhysicalMaterial;
  brand: MeshPhysicalMaterial;
  gold: MeshPhysicalMaterial;
  chrome: MeshPhysicalMaterial;
  tyre: MeshStandardMaterial;
  rim: MeshPhysicalMaterial;
  glass: MeshPhysicalMaterial;
  frame: MeshStandardMaterial;
  plastic: MeshStandardMaterial;
  concrete: MeshStandardMaterial;
  lens: MeshPhysicalMaterial;
  tail: MeshPhysicalMaterial;
  amber: MeshPhysicalMaterial;
  decal: MeshBasicMaterial;
  hidden: MeshBasicMaterial;
  /** every material above, for disposal and "shared" checks */
  all: Material[];
  disposeTextures: () => void;
};

function decalTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const g = c.getContext("2d");
  if (g) {
    g.clearRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#43236f";
    g.font = "800 150px Poppins, system-ui, 'Segoe UI', Arial, sans-serif";
    g.fillText("HH FABTECH", 512, 150);
    g.fillStyle = "#b8860b";
    g.fillRect(212, 252, 600, 6);
    g.fillStyle = "#2a1b46";
    g.font = "600 46px Poppins, system-ui, 'Segoe UI', Arial, sans-serif";
    g.fillText("TANKER MANUFACTURERS", 512, 312);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function createMaterials(clip: Plane): Mats {
  const clipping = [clip];
  const steel = new MeshPhysicalMaterial({
    color: 0xd5d9de,
    metalness: 1,
    roughness: 0.26,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    side: 2, // DoubleSide: the cutaway shows the inner face
    clippingPlanes: clipping,
  });
  const steelTrim = new MeshPhysicalMaterial({
    color: 0xc9ced4,
    metalness: 1,
    roughness: 0.36,
  });
  const cab = new MeshPhysicalMaterial({
    color: 0xf3f4f6,
    metalness: 0.15,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const brand = new MeshPhysicalMaterial({
    color: 0x43236f,
    metalness: 0.4,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const gold = new MeshPhysicalMaterial({
    color: 0xd9a21b,
    metalness: 0.9,
    roughness: 0.25,
  });
  const chrome = new MeshPhysicalMaterial({
    color: 0xf1f3f5,
    metalness: 1,
    roughness: 0.08,
  });
  const tyre = new MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.88 });
  const rim = new MeshPhysicalMaterial({
    color: 0xd7dbe0,
    metalness: 1,
    roughness: 0.22,
  });
  const glass = new MeshPhysicalMaterial({
    color: 0x1a2430,
    metalness: 0,
    roughness: 0.03,
    clearcoat: 1,
    reflectivity: 1,
    transparent: true,
    opacity: 0.92,
  });
  const frame = new MeshStandardMaterial({
    color: 0x24262b,
    metalness: 0.45,
    roughness: 0.55,
  });
  const plastic = new MeshStandardMaterial({
    color: 0x34373d,
    metalness: 0.1,
    roughness: 0.6,
  });
  const concrete = new MeshStandardMaterial({
    color: 0xc9ccd1,
    metalness: 0,
    roughness: 0.95,
  });
  const lens = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    clearcoat: 1,
    emissive: 0xfff4d6,
    emissiveIntensity: 0.35,
  });
  const tail = new MeshPhysicalMaterial({
    color: 0x8c0f14,
    roughness: 0.15,
    clearcoat: 1,
    emissive: 0x5a0000,
    emissiveIntensity: 0.4,
  });
  const amber = new MeshPhysicalMaterial({
    color: 0xe08a00,
    roughness: 0.15,
    clearcoat: 1,
    emissive: 0x6b3a00,
    emissiveIntensity: 0.3,
  });
  const map = decalTexture();
  const decal = new MeshBasicMaterial({
    map,
    transparent: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    depthWrite: false,
  });
  const hidden = new MeshBasicMaterial({ visible: false });
  const all: Material[] = [
    steel,
    steelTrim,
    cab,
    brand,
    gold,
    chrome,
    tyre,
    rim,
    glass,
    frame,
    plastic,
    concrete,
    lens,
    tail,
    amber,
    decal,
    hidden,
  ];
  return {
    steel,
    steelTrim,
    cab,
    brand,
    gold,
    chrome,
    tyre,
    rim,
    glass,
    frame,
    plastic,
    concrete,
    lens,
    tail,
    amber,
    decal,
    hidden,
    all,
    disposeTextures: () => map.dispose(),
  };
}

/* ------------------------------------------------------------------------ */
/* Small builders                                                            */
/* ------------------------------------------------------------------------ */

function add<T extends Mesh>(g: Group, m: T, shadow = true): T {
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  g.add(m);
  return m;
}

const box = (
  g: Group,
  mat: Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
) => {
  const m = add(g, new Mesh(new BoxGeometry(w, h, d), mat));
  m.position.set(x, y, z);
  return m;
};

const cyl = (
  g: Group,
  mat: Material,
  rt: number,
  rb: number,
  h: number,
  axis: "x" | "y" | "z",
  x: number,
  y: number,
  z: number,
  seg = 24,
) => {
  const m = add(g, new Mesh(new CylinderGeometry(rt, rb, h, seg), mat));
  if (axis === "x") m.rotation.z = Math.PI / 2;
  if (axis === "z") m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  return m;
};

/** Rounded rectangle shape centred on the origin. */
function roundRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Thin rounded slab (lamps, lenses, plates) facing +X. */
function slab(
  g: Group,
  mat: Material,
  w: number,
  h: number,
  depth: number,
  r: number,
  x: number,
  y: number,
  z: number,
) {
  const geo = new ExtrudeGeometry(roundRect(w, h, r), {
    depth,
    bevelEnabled: false,
    curveSegments: 6,
  });
  geo.rotateY(Math.PI / 2);
  const m = add(g, new Mesh(geo, mat), false);
  m.position.set(x, y, z);
  return m;
}

/* ------------------------------------------------------------------------ */
/* Wheels                                                                    */
/* ------------------------------------------------------------------------ */

/** Lathe-turned tyre with rounded shoulders and a rim with dish, hub and studs. Axis = Z. */
function wheel(
  g: Group,
  m: Mats,
  v: number,
  x: number,
  y: number,
  z: number,
  outward: 1 | -1,
  dual = false,
) {
  const w = new Group();
  const R = 0.5 * v;
  const r0 = 0.29 * v;
  const half = 0.15 * v;
  const sh = 0.07 * v;
  const tyreProfile: Vector2[] = [];
  // inner bead -> sidewall -> rounded shoulder -> tread -> shoulder -> sidewall
  tyreProfile.push(new Vector2(r0, -half * 0.9));
  tyreProfile.push(new Vector2(R - sh, -half));
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2);
    tyreProfile.push(
      new Vector2(R - sh + Math.cos(a) * sh, -half + sh + Math.sin(a) * sh),
    );
  }
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    tyreProfile.push(
      new Vector2(R - sh + Math.cos(a) * sh, half - sh + Math.sin(a) * sh),
    );
  }
  tyreProfile.push(new Vector2(r0, half * 0.9));
  const tyreGeo = new LatheGeometry(tyreProfile, 56);
  tyreGeo.rotateX(Math.PI / 2);
  add(w, new Mesh(tyreGeo, m.tyre));
  // tread grooves
  for (const dz of [-0.06, 0, 0.06]) {
    const groove = new Mesh(
      new TorusGeometry(R - 0.004 * v, 0.008 * v, 6, 56),
      m.frame,
    );
    groove.position.z = dz * v;
    w.add(groove);
  }
  // rim: dished disc + outer lip + hub + studs
  const rimProfile = [
    new Vector2(0.0001, 0.02 * v),
    new Vector2(0.11 * v, 0.02 * v),
    new Vector2(0.15 * v, 0.05 * v),
    new Vector2(0.25 * v, 0.06 * v),
    new Vector2(r0 + 0.005 * v, 0.1 * v),
    new Vector2(r0 + 0.02 * v, 0.125 * v),
  ];
  const rimGeo = new LatheGeometry(rimProfile, 48);
  rimGeo.rotateX(outward > 0 ? Math.PI / 2 : -Math.PI / 2);
  add(w, new Mesh(rimGeo, m.rim));
  const hub = cyl(
    w,
    m.chrome,
    0.075 * v,
    0.09 * v,
    0.07 * v,
    "z",
    0,
    0,
    outward * 0.07 * v,
    24,
  );
  hub.castShadow = false;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const stud = cyl(
      w,
      m.chrome,
      0.012 * v,
      0.012 * v,
      0.04 * v,
      "z",
      Math.cos(a) * 0.125 * v,
      Math.sin(a) * 0.125 * v,
      outward * 0.06 * v,
      8,
    );
    stud.castShadow = false;
  }
  // vent holes as dark discs
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const hole = cyl(
      w,
      m.frame,
      0.03 * v,
      0.03 * v,
      0.005 * v,
      "z",
      Math.cos(a) * 0.2 * v,
      Math.sin(a) * 0.2 * v,
      outward * 0.062 * v,
      12,
    );
    hole.castShadow = false;
  }
  w.position.set(x, y, z);
  g.add(w);
  if (dual) {
    // inner twin tyre
    const inner = new Mesh(tyreGeo, m.tyre);
    inner.castShadow = true;
    inner.position.set(x, y, z - outward * 0.31 * v);
    g.add(inner);
  }
}

function ladder(
  g: Group,
  m: Mats,
  v: number,
  x: number,
  z: number,
  y0: number,
  y1: number,
) {
  const h = y1 - y0;
  for (const dz of [-0.2, 0.2])
    cyl(
      g,
      m.steelTrim,
      0.022 * v,
      0.022 * v,
      h,
      "y",
      x,
      y0 + h / 2,
      z + dz * v,
      10,
    );
  for (let y = y0 + 0.28 * v; y < y1 - 0.05 * v; y += 0.3 * v)
    cyl(g, m.steelTrim, 0.016 * v, 0.016 * v, 0.4 * v, "z", x, y, z, 8);
}

/* ------------------------------------------------------------------------ */
/* Tanker truck                                                              */
/* ------------------------------------------------------------------------ */

export type TruckRig = {
  group: Group;
  groundY: number;
  minX: number;
  maxX: number;
  topY: number;
};

/** Cab-over tanker rig. `ext` = tank half-extents incl. dish ends (scene units), tank centred at origin, length on X. */
export function buildTruck(m: Mats, ext: Vector3, s: number): TruckRig {
  const u = s * 1000; // scene units per metre
  const v = u * Math.min(1.1, Math.max(0.6, (2 * ext.z) / u / 2.4));
  const g = new Group();

  const X0 = ext.x;
  const tankBottom = -ext.y;
  const G = tankBottom - 1.18 * v; // ground
  const railTop = G + 1.0 * v;
  const axleY = G + 0.5 * v;

  // ---- axle layout ----
  const cabX0 = X0 + 0.28 * v; // back of cab
  const cabLen = 2.05 * v;
  const frontX = cabX0 + 1.0 * v;
  const length = 2 * X0;
  const tandem = length > 4.2 * v;
  const rearC = Math.max(
    -X0 + 0.95 * v,
    Math.min(frontX - 3.6 * v, -X0 + length * 0.3),
  );
  const rearAxles = tandem ? [rearC - 0.68 * v, rearC + 0.68 * v] : [rearC];
  const railX0 = -X0 - 0.35 * v;
  const railX1 = cabX0 + cabLen - 0.15 * v;

  // ---- chassis: C-channel rails, cross members, subframe and cradles ----
  for (const z of [-0.43, 0.43]) {
    box(
      g,
      m.frame,
      railX1 - railX0,
      0.28 * v,
      0.08 * v,
      (railX0 + railX1) / 2,
      railTop - 0.14 * v,
      z * v,
    );
    box(
      g,
      m.frame,
      railX1 - railX0,
      0.03 * v,
      0.16 * v,
      (railX0 + railX1) / 2,
      railTop - 0.015 * v,
      (z - Math.sign(z) * 0.04) * v,
    );
  }
  for (let x = railX0 + 0.25 * v; x < railX1; x += 1.05 * v)
    box(g, m.frame, 0.1 * v, 0.2 * v, 0.86 * v, x, railTop - 0.15 * v, 0);
  // subframe sill under the tank
  for (const z of [-0.42, 0.42])
    box(
      g,
      m.steelTrim,
      length * 0.96,
      0.1 * v,
      0.12 * v,
      0,
      railTop + 0.05 * v,
      z * v,
    );
  const cradleW = Math.min(2 * ext.z * 0.82, 2.0 * v);
  const nCr = Math.max(2, Math.round(length / (1.6 * v)));
  for (let i = 0; i < nCr; i++) {
    const x = (i / (nCr - 1) - 0.5) * length * 0.86;
    box(
      g,
      m.steelTrim,
      0.16 * v,
      tankBottom - railTop - 0.1 * v + 0.06 * v,
      cradleW,
      x,
      (railTop + 0.1 * v + tankBottom) / 2 + 0.03 * v,
      0,
    );
  }

  // ---- wheels, axles, suspension ----
  wheel(g, m, v, frontX, axleY, 1.02 * v, 1);
  wheel(g, m, v, frontX, axleY, -1.02 * v, -1);
  cyl(g, m.frame, 0.06 * v, 0.06 * v, 1.9 * v, "z", frontX, axleY, 0, 12);
  for (const x of rearAxles) {
    wheel(g, m, v, x, axleY, 1.1 * v, 1, true);
    wheel(g, m, v, x, axleY, -1.1 * v, -1, true);
    cyl(g, m.frame, 0.09 * v, 0.09 * v, 1.75 * v, "z", x, axleY, 0, 16);
    cyl(g, m.frame, 0.18 * v, 0.18 * v, 0.3 * v, "z", x, axleY, 0, 16); // differential
    for (const z of [-0.43, 0.43])
      box(g, m.frame, 1.1 * v, 0.08 * v, 0.1 * v, x, axleY + 0.2 * v, z * v); // leaf springs
  }
  // rear mudguards (black arcs over the duals)
  const guardLen = (tandem ? 2.6 : 1.25) * v;
  for (const z of [-1, 1]) {
    const arch = new Mesh(
      new CylinderGeometry(
        0.6 * v,
        0.6 * v,
        0.62 * v,
        28,
        1,
        true,
        -Math.PI / 2,
        Math.PI,
      ),
      m.plastic,
    );
    // -90° about X puts the half-shell above the axle
    arch.rotation.x = -Math.PI / 2;
    arch.scale.set(guardLen / (1.2 * v), 1, 1);
    arch.position.set(rearC, axleY, z * 0.96 * v);
    add(g, arch);
    // mud flap
    box(
      g,
      m.plastic,
      0.02 * v,
      0.55 * v,
      0.62 * v,
      rearC - guardLen / 2 - 0.05 * v,
      G + 0.45 * v,
      z * 0.96 * v,
    );
  }
  // side underrun guards between the axles
  const gx0 = rearAxles[rearAxles.length - 1] + 0.7 * v;
  const gx1 = frontX - 0.7 * v;
  if (gx1 - gx0 > 0.4 * v) {
    for (const z of [-1.12, 1.12])
      for (const y of [0.48, 0.8])
        box(
          g,
          m.steelTrim,
          gx1 - gx0,
          0.09 * v,
          0.03 * v,
          (gx0 + gx1) / 2,
          G + y * v,
          z * v,
        );
  }
  // fuel tank (aluminium) + battery box, air tanks
  const ftX = Math.min(gx1 - 0.55 * v, frontX - 1.3 * v);
  cyl(
    g,
    m.steelTrim,
    0.27 * v,
    0.27 * v,
    1.0 * v,
    "x",
    ftX,
    G + 0.85 * v,
    -0.82 * v,
    32,
  );
  for (const dx of [-0.3, 0.3]) {
    const strap = new Mesh(
      new TorusGeometry(0.275 * v, 0.012 * v, 6, 32),
      m.frame,
    );
    strap.rotation.y = Math.PI / 2;
    strap.position.set(ftX + dx * v, G + 0.85 * v, -0.82 * v);
    g.add(strap);
  }
  box(g, m.plastic, 0.7 * v, 0.42 * v, 0.5 * v, ftX, G + 0.82 * v, 0.82 * v);
  cyl(
    g,
    m.steelTrim,
    0.11 * v,
    0.11 * v,
    0.9 * v,
    "x",
    ftX - 1.0 * v,
    G + 0.78 * v,
    0.7 * v,
    16,
  );

  // ---- cab (cab-over), extruded side profile with bevelled edges ----
  const cabW = 2.32 * v;
  const cabBottom = G + 0.98 * v;
  const p = new Shape();
  const P = (x: number, y: number) => [x * v, y * v] as const;
  p.moveTo(...P(0, 0));
  p.lineTo(...P(2.0, 0));
  p.lineTo(...P(2.05, 0.65));
  p.quadraticCurveTo(...P(2.1, 0.8), ...P(2.07, 1.0));
  p.lineTo(...P(1.93, 2.0)); // raked windscreen
  p.quadraticCurveTo(...P(1.88, 2.16), ...P(1.7, 2.18));
  p.lineTo(...P(0.12, 2.2));
  p.quadraticCurveTo(...P(0, 2.2), ...P(0, 2.08));
  p.lineTo(...P(0, 0));
  const bevel = 0.06 * v;
  const cabGeo = new ExtrudeGeometry(p, {
    depth: cabW - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 12,
  });
  cabGeo.translate(0, 0, -(cabW - 2 * bevel) / 2);
  const cabMesh = add(g, new Mesh(cabGeo, m.cab));
  cabMesh.position.set(cabX0, cabBottom, 0);
  const cx = (x: number) => cabX0 + x * v;
  const cy = (y: number) => cabBottom + y * v;
  const sideZ = cabW / 2 + 0.004 * v;

  // windscreen (follows the rake)
  const rake = Math.atan2(2.07 - 1.93, 2.0 - 1.0);
  const ws = add(
    g,
    new Mesh(new PlaneGeometry(cabW * 0.9, 0.86 * v), m.glass),
    false,
  );
  ws.rotation.set(0, Math.PI / 2, 0);
  ws.rotateX(-rake);
  ws.position.set(cx(2.0) + bevel + 0.006 * v, cy(1.55), 0);
  // sun visor
  box(
    g,
    m.plastic,
    0.22 * v,
    0.06 * v,
    cabW * 0.92,
    cx(1.95) + bevel,
    cy(2.06),
    0,
  ).rotation.z = -0.25;
  // side windows + door outline + handles + brand stripe + decal
  const win = new Shape();
  win.moveTo(1.15 * v, 1.25 * v);
  win.lineTo(1.98 * v, 1.25 * v);
  win.lineTo(1.86 * v, 1.98 * v);
  win.lineTo(1.15 * v, 1.98 * v);
  win.lineTo(1.15 * v, 1.25 * v);
  for (const side of [1, -1]) {
    const wg = new ShapeGeometry(win);
    const wm = add(g, new Mesh(wg, m.glass), false);
    wm.position.set(cabX0, cabBottom, side * sideZ);
    // Flat geometry: a negative Z scale flips it to face -Z without moving it.
    if (side < 0) wm.scale.z = -1;
    // door seams
    for (const x of [1.08, 2.02])
      box(
        g,
        m.plastic,
        0.012 * v,
        1.62 * v,
        0.006 * v,
        cx(x),
        cy(1.17),
        side * sideZ,
      );
    box(
      g,
      m.plastic,
      0.94 * v,
      0.012 * v,
      0.006 * v,
      cx(1.55),
      cy(0.36),
      side * sideZ,
    );
    box(
      g,
      m.chrome,
      0.2 * v,
      0.035 * v,
      0.03 * v,
      cx(1.25),
      cy(1.08),
      side * (sideZ + 0.012 * v),
    );
    // brand stripe and gold pinstripe along the cab side
    box(
      g,
      m.brand,
      2.0 * v,
      0.2 * v,
      0.008 * v,
      cx(1.02),
      cy(0.62),
      side * sideZ,
    );
    box(
      g,
      m.gold,
      2.0 * v,
      0.03 * v,
      0.008 * v,
      cx(1.02),
      cy(0.48),
      side * sideZ,
    );
    // door decal
    const d = add(
      g,
      new Mesh(new PlaneGeometry(0.85 * v, 0.32 * v), m.decal),
      false,
    );
    d.position.set(cx(1.55), cy(0.95), side * (sideZ + 0.006 * v));
    if (side < 0) d.rotation.y = Math.PI;
    // steps under the door
    for (const y of [-0.28, 0.08])
      box(
        g,
        m.frame,
        0.5 * v,
        0.04 * v,
        0.24 * v,
        cx(1.5),
        cy(y),
        side * (cabW / 2 - 0.02 * v),
      );
    // mirror arm + housing
    cyl(
      g,
      m.plastic,
      0.015 * v,
      0.015 * v,
      0.34 * v,
      "z",
      cx(2.0),
      cy(1.7),
      side * (cabW / 2 + 0.17 * v),
      8,
    );
    box(
      g,
      m.plastic,
      0.08 * v,
      0.42 * v,
      0.2 * v,
      cx(2.0),
      cy(1.6),
      side * (cabW / 2 + 0.36 * v),
    );
    slab(
      g,
      m.chrome,
      0.18 * v,
      0.36 * v,
      0.004 * v,
      0.03 * v,
      cx(1.96),
      cy(1.6),
      side * (cabW / 2 + 0.36 * v),
    );
    // front fender: open half-shell over the tyre tread (rotation -90° about X = upper half)
    const arch = new Mesh(
      new CylinderGeometry(
        0.58 * v,
        0.58 * v,
        0.38 * v,
        28,
        1,
        true,
        -Math.PI / 2,
        Math.PI,
      ),
      m.plastic,
    );
    arch.rotation.x = -Math.PI / 2;
    arch.position.set(frontX, axleY, side * 1.02 * v);
    add(g, arch, false);
  }
  // grille + chrome slats
  slab(
    g,
    m.plastic,
    cabW * 0.62,
    0.42 * v,
    0.03 * v,
    0.04 * v,
    cx(2.04) + bevel,
    cy(0.62),
    0,
  );
  for (let i = -2; i <= 2; i++)
    box(
      g,
      m.chrome,
      0.01 * v,
      0.022 * v,
      cabW * 0.58,
      cx(2.075) + bevel,
      cy(0.62 + i * 0.075),
      0,
    );
  // brand badge on the grille
  box(g, m.gold, 0.012 * v, 0.06 * v, 0.36 * v, cx(2.09) + bevel, cy(0.92), 0);
  // headlamps, indicators
  for (const side of [1, -1]) {
    slab(
      g,
      m.chrome,
      0.46 * v,
      0.22 * v,
      0.02 * v,
      0.05 * v,
      cx(2.03) + bevel,
      cy(0.42),
      side * 0.88 * v,
    );
    slab(
      g,
      m.lens,
      0.4 * v,
      0.17 * v,
      0.024 * v,
      0.04 * v,
      cx(2.04) + bevel,
      cy(0.42),
      side * 0.88 * v,
    );
    slab(
      g,
      m.amber,
      0.12 * v,
      0.1 * v,
      0.024 * v,
      0.02 * v,
      cx(2.04) + bevel,
      cy(0.42),
      side * 0.55 * v,
    );
    // roof marker lamps
    slab(
      g,
      m.amber,
      0.08 * v,
      0.04 * v,
      0.02 * v,
      0.01 * v,
      cx(1.82) + bevel,
      cy(2.2),
      side * 0.7 * v,
    );
  }
  // bumper with fog lamps
  slab(
    g,
    m.frame,
    cabW * 1.01,
    0.34 * v,
    0.2 * v,
    0.06 * v,
    cx(1.92) + bevel,
    G + 0.72 * v,
    0,
  );
  for (const side of [1, -1]) {
    const fog = cyl(
      g,
      m.lens,
      0.06 * v,
      0.06 * v,
      0.03 * v,
      "x",
      cx(2.13) + bevel,
      G + 0.72 * v,
      side * 0.8 * v,
      20,
    );
    fog.castShadow = false;
  }
  // exhaust stack behind the cab
  cyl(
    g,
    m.chrome,
    0.07 * v,
    0.07 * v,
    2.05 * v,
    "y",
    cabX0 - 0.16 * v,
    cabBottom + 1.0 * v,
    0.95 * v,
    20,
  );
  cyl(
    g,
    m.frame,
    0.1 * v,
    0.1 * v,
    0.6 * v,
    "y",
    cabX0 - 0.16 * v,
    cabBottom + 0.35 * v,
    0.95 * v,
    20,
  );
  // air intake snorkel
  cyl(
    g,
    m.plastic,
    0.1 * v,
    0.1 * v,
    1.2 * v,
    "y",
    cabX0 - 0.16 * v,
    cabBottom + 0.9 * v,
    -0.95 * v,
    20,
  );

  // ---- tank fittings on top ----
  const top = ext.y;
  const mh = Math.max(1, Math.min(4, Math.round(length / (1.9 * v))));
  for (let i = 0; i < mh; i++) {
    const x = ((i + 0.5) / mh - 0.5) * length * 0.82;
    cyl(
      g,
      m.steelTrim,
      0.3 * v,
      0.32 * v,
      0.12 * v,
      "y",
      x,
      top + 0.04 * v,
      0,
      40,
    );
    const lid = add(
      g,
      new Mesh(
        new SphereGeometry(0.28 * v, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        m.steelTrim,
      ),
    );
    lid.scale.y = 0.22;
    lid.position.set(x, top + 0.1 * v, 0);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      cyl(
        g,
        m.chrome,
        0.018 * v,
        0.018 * v,
        0.06 * v,
        "y",
        x + Math.cos(a) * 0.31 * v,
        top + 0.11 * v,
        Math.sin(a) * 0.31 * v,
        8,
      );
    }
    cyl(
      g,
      m.steelTrim,
      0.05 * v,
      0.05 * v,
      0.14 * v,
      "y",
      x + 0.42 * v,
      top + 0.07 * v,
      0.18 * v,
      12,
    ); // vent
  }
  // folding handrails along the top
  const rz = Math.min(ext.z * 0.55, 0.62 * v);
  const posts = Math.max(3, Math.round(length / (1.25 * v)) + 1);
  const railLen = length * 0.88;
  for (let i = 0; i < posts; i++) {
    const x = (i / (posts - 1) - 0.5) * railLen;
    for (const z of [-rz, rz])
      cyl(
        g,
        m.steelTrim,
        0.017 * v,
        0.017 * v,
        0.62 * v,
        "y",
        x,
        top + 0.31 * v,
        z,
        8,
      );
  }
  for (const z of [-rz, rz]) {
    cyl(
      g,
      m.steelTrim,
      0.019 * v,
      0.019 * v,
      railLen,
      "x",
      0,
      top + 0.62 * v,
      z,
      10,
    );
    cyl(
      g,
      m.steelTrim,
      0.014 * v,
      0.014 * v,
      railLen,
      "x",
      0,
      top + 0.33 * v,
      z,
      8,
    );
  }
  // walkway grating
  box(
    g,
    m.steelTrim,
    railLen,
    0.025 * v,
    0.42 * v,
    0,
    top + 0.02 * v,
    -rz * 0.55,
  );

  // ---- rear: ladder, valve cabinet, discharge, bumper, lamps, plate ----
  ladder(g, m, v, -X0 - 0.12 * v, 0.62 * v, railTop - 0.2 * v, top + 0.62 * v);
  box(
    g,
    m.steelTrim,
    0.5 * v,
    0.55 * v,
    1.0 * v,
    -X0 + 0.3 * v,
    railTop - 0.45 * v,
    -0.62 * v,
  ); // valve cabinet
  for (const z of [-0.5, -0.2]) {
    cyl(
      g,
      m.steelTrim,
      0.055 * v,
      0.055 * v,
      0.4 * v,
      "x",
      -X0 - 0.15 * v,
      railTop - 0.32 * v,
      z * v,
      16,
    );
    cyl(
      g,
      m.gold,
      0.08 * v,
      0.08 * v,
      0.04 * v,
      "x",
      -X0 - 0.36 * v,
      railTop - 0.32 * v,
      z * v,
      16,
    );
  }
  box(
    g,
    m.frame,
    0.14 * v,
    0.16 * v,
    2.3 * v,
    railX0 - 0.1 * v,
    G + 0.55 * v,
    0,
  );
  for (let i = -5; i <= 5; i++)
    box(
      g,
      i % 2 ? m.tail : m.cab,
      0.005 * v,
      0.1 * v,
      0.2 * v,
      railX0 - 0.172 * v,
      G + 0.55 * v,
      i * 0.2 * v,
    );
  for (const side of [1, -1]) {
    slab(
      g,
      m.tail,
      0.3 * v,
      0.14 * v,
      0.03 * v,
      0.03 * v,
      railX0 - 0.2 * v,
      railTop - 0.1 * v,
      side * 0.9 * v,
    ).rotation.y = -Math.PI / 2;
    slab(
      g,
      m.amber,
      0.1 * v,
      0.14 * v,
      0.03 * v,
      0.03 * v,
      railX0 - 0.2 * v,
      railTop - 0.1 * v,
      side * 0.66 * v,
    ).rotation.y = -Math.PI / 2;
  }
  slab(
    g,
    m.gold,
    0.5 * v,
    0.12 * v,
    0.01 * v,
    0.01 * v,
    railX0 - 0.18 * v,
    railTop - 0.3 * v,
    0,
  ).rotation.y = -Math.PI / 2;

  return {
    group: g,
    groundY: G,
    minX: railX0 - 0.3 * v,
    maxX: cx(2.15) + bevel,
    topY: Math.max(top + 0.62 * v, cabBottom + 2.2 * v),
  };
}

/* ------------------------------------------------------------------------ */
/* Stands for non-truck tanks                                                */
/* ------------------------------------------------------------------------ */

export function buildStand(
  shape: string,
  m: Mats,
  ext: Vector3,
  s: number,
  coneHeightScene = 0,
): { group: Group; groundY: number; topY?: number } {
  const u = s * 1000;
  const g = new Group();
  const bottom = -ext.y;
  const r = ext.x;

  if (shape === "sphere") {
    const lat = (-25 * Math.PI) / 180;
    const rho = r * Math.cos(lat);
    const yTop = r * Math.sin(lat);
    const ground = bottom - r * 0.4;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const h = yTop - ground;
      cyl(
        g,
        m.steelTrim,
        0.04 * r,
        0.04 * r,
        h,
        "y",
        Math.cos(a) * rho,
        ground + h / 2,
        Math.sin(a) * rho,
        16,
      );
      box(
        g,
        m.concrete,
        0.18 * r,
        0.06 * r,
        0.18 * r,
        Math.cos(a) * rho,
        ground + 0.03 * r,
        Math.sin(a) * rho,
      );
      // cross bracing
      const b = (((i + 1) % n) / n) * Math.PI * 2;
      const mx = (Math.cos(a) + Math.cos(b)) / 2;
      const mz = (Math.sin(a) + Math.sin(b)) / 2;
      const brace = cyl(
        g,
        m.steelTrim,
        0.012 * r,
        0.012 * r,
        rho * 1.05,
        "x",
        mx * rho,
        ground + (yTop - ground) * 0.45,
        mz * rho,
        8,
      );
      brace.rotation.set(0, -(a + b) / 2 + Math.PI / 2, Math.PI / 2);
    }
    const ring = new Mesh(
      new TorusGeometry(rho * 1.005, 0.015 * r, 8, 64),
      m.steelTrim,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = yTop;
    g.add(ring);
    cyl(
      g,
      m.steelTrim,
      0.1 * r,
      0.11 * r,
      0.06 * r,
      "y",
      0,
      r + 0.02 * r,
      0,
      28,
    );
    cyl(
      g,
      m.steelTrim,
      0.04 * r,
      0.04 * r,
      0.25 * r,
      "y",
      0,
      bottom - 0.1 * r,
      0,
      16,
    );
    return { group: g, groundY: ground };
  }

  if (shape === "coneBottom") {
    const ground = bottom - 0.5 * u;
    const top = bottom + coneHeightScene;
    const h = top - ground + 0.15 * u;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.cos(a) * r * 0.98;
      const z = Math.sin(a) * r * 0.98;
      box(g, m.steelTrim, 0.08 * u, h, 0.08 * u, x, ground + h / 2, z);
      box(g, m.concrete, 0.3 * u, 0.06 * u, 0.3 * u, x, ground + 0.03 * u, z);
    }
    const ring = new Mesh(
      new TorusGeometry(r * 0.98, 0.02 * u, 8, 64),
      m.steelTrim,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ground + h * 0.4;
    g.add(ring);
    cyl(
      g,
      m.steelTrim,
      0.05 * u,
      0.05 * u,
      0.3 * u,
      "y",
      0,
      bottom - 0.15 * u,
      0,
      16,
    );
    cyl(
      g,
      m.gold,
      0.08 * u,
      0.08 * u,
      0.04 * u,
      "y",
      0,
      bottom - 0.3 * u,
      0,
      16,
    );
    ladder(g, m, u, r + 0.08 * u, 0, ground, ext.y + 0.1 * u);
    return { group: g, groundY: ground };
  }

  if (shape === "dishBowl") {
    const ground = bottom - 0.45 * u;
    cyl(
      g,
      m.concrete,
      r * 0.5,
      r * 0.56,
      bottom - ground + 0.02 * u,
      "y",
      0,
      (bottom + ground) / 2,
      0,
      48,
    );
    const ring = new Mesh(
      new TorusGeometry(r * 1.0, 0.018 * u, 8, 64),
      m.steelTrim,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ext.y;
    g.add(ring);
    return { group: g, groundY: ground };
  }

  // verticalCylinder: concrete plinth, cage ladder, roof railing, manway, nozzles
  const ground = bottom - 0.25 * u;
  cyl(
    g,
    m.concrete,
    r * 1.08,
    r * 1.12,
    bottom - ground,
    "y",
    0,
    (bottom + ground) / 2,
    0,
    64,
  );
  const tallM = (2 * ext.y) / u;
  const diaM = (2 * r) / u;
  // Access ladder, cage and roof railing only where a real tank would have them.
  const hasLadder = tallM >= 2.4;
  const hasRail = tallM >= 3 && diaM >= 1.8;
  const lx = r + 0.1 * u;
  if (hasLadder) ladder(g, m, u, lx, 0, ground, ext.y + 0.1 * u);
  // safety cage hoops
  for (let y = ground + 2.2 * u; hasRail && y < ext.y; y += 0.7 * u) {
    const hoop = new Mesh(
      new TorusGeometry(0.38 * u, 0.012 * u, 6, 24, Math.PI),
      m.steelTrim,
    );
    hoop.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
    hoop.position.set(lx + 0.02 * u, y, 0);
    g.add(hoop);
  }
  const topY = ext.y;
  if (hasRail) {
    const rail = new Mesh(
      new TorusGeometry(r * 0.96, 0.016 * u, 8, 64),
      m.steelTrim,
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.y = topY + 0.95 * u;
    g.add(rail);
  }
  for (let i = 0; hasRail && i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    cyl(
      g,
      m.steelTrim,
      0.014 * u,
      0.014 * u,
      0.95 * u,
      "y",
      Math.cos(a) * r * 0.96,
      topY + 0.48 * u,
      Math.sin(a) * r * 0.96,
      8,
    );
  }
  const mw = Math.min(0.27 * u, r * 0.3);
  cyl(
    g,
    m.steelTrim,
    mw * 0.93,
    mw,
    0.12 * u,
    "y",
    -r * 0.35,
    topY + 0.06 * u,
    0,
    32,
  );
  cyl(
    g,
    m.steelTrim,
    0.06 * u,
    0.06 * u,
    0.4 * u,
    "y",
    r * 0.2,
    topY + 0.2 * u,
    r * 0.3,
    16,
  );
  for (const [y, z] of [
    [bottom + 0.3 * u, -0.25 * r],
    [bottom + 0.3 * u, 0.25 * r],
  ] as const) {
    // nozzle size follows the tank so small tanks don't get oversized pipework
    const nz = Math.min(0.07 * u, r * 0.08);
    cyl(g, m.steelTrim, nz, nz, 0.3 * u, "x", -r - 0.13 * u, y, z, 16);
    cyl(g, m.gold, nz * 1.6, nz * 1.6, 0.04 * u, "x", -r - 0.28 * u, y, z, 20);
  }
  return {
    group: g,
    groundY: ground,
    topY: topY + (hasRail ? 0.95 * u : 0.4 * u),
  };
}
