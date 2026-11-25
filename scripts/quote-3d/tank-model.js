// Pure three.js scene-graph builder for the quote-builder tanker. No DOM, no renderer.
import * as THREE from 'three';

const MM = 0.001;
const REF = { W: 2400, H: 1830, Rw: 1930, Rh: 1475 }; // same Spell reference as quote-core.js

/** Outline of the HH "Spell" cross-section: four circular-arc blends round a Rw x Rh rectangle. mm, centred. */
export function spellProfile(W, H, Rw, Rh, seg = 40) {
  const h1 = (H - Rh) / 2, h2 = (W - Rw) / 2;
  const rad = (c, h) => (c * c + 4 * h * h) / (8 * h);
  const r1 = rad(Rw, h1), r2 = rad(Rh, h2);
  const cyTop = Rh / 2 + h1 - r1, cxRight = Rw / 2 + h2 - r2;
  const sq = (r, v) => Math.sqrt(Math.max(r * r - v * v, 0));
  const p = [];
  for (let i = 0; i <= seg; i++) { const y = -Rh / 2 + (Rh * i) / seg; p.push([cxRight + sq(r2, y), y]); }
  for (let i = 1; i <= seg; i++) { const x = Rw / 2 - (Rw * i) / seg; p.push([x, cyTop + sq(r1, x)]); }
  for (let i = 1; i <= seg; i++) { const y = Rh / 2 - (Rh * i) / seg; p.push([-(cxRight + sq(r2, y)), y]); }
  for (let i = 1; i < seg; i++) { const x = -Rw / 2 + (Rw * i) / seg; p.push([x, -(cyTop + sq(r1, x))]); }
  return p;
}

/** Body + two dished ends as one smooth mesh. Length runs along +X (metres), width along Z, height along Y. */
export function tankGeometry(profile, Lmm, embMm, headRings = 14) {
  const rings = [];
  for (let k = headRings; k >= 0; k--) { const a = (k / headRings) * Math.PI / 2; rings.push([-(Lmm / 2 + embMm * Math.sin(a)) * MM, Math.max(Math.cos(a), 1e-4)]); }
  for (let k = 0; k <= headRings; k++) { const a = (k / headRings) * Math.PI / 2; rings.push([(Lmm / 2 + embMm * Math.sin(a)) * MM, Math.max(Math.cos(a), 1e-4)]); }
  const n = profile.length, pos = new Float32Array(rings.length * n * 3), idx = [];
  rings.forEach(([z, s], i) => profile.forEach(([x, y], j) => { const o = (i * n + j) * 3; pos[o] = x * s * MM; pos[o + 1] = y * s * MM; pos[o + 2] = z; }));
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < n; j++) {
    const a = i * n + j, b = i * n + ((j + 1) % n), c = (i + 1) * n + j, d = (i + 1) * n + ((j + 1) % n);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  g.rotateY(Math.PI / 2); // length axis Z -> X
  return g;
}

const MATERIAL = { // [colour, metalness, roughness]
  ms: [0x8f98a5, 0.55, 0.5], ss202: [0xcfd5dc, 0.9, 0.3], ss304: [0xd6dbe2, 0.92, 0.26], ss316: [0xdde2e8, 0.92, 0.22], al6016: [0xe2e5ea, 0.8, 0.34],
};
const mats = {
  dark: () => new THREE.MeshStandardMaterial({ color: 0x2e2a36, metalness: 0.4, roughness: 0.6 }),
  tyre: () => new THREE.MeshStandardMaterial({ color: 0x15131a, metalness: 0, roughness: 0.9 }),
  hub: () => new THREE.MeshStandardMaterial({ color: 0xb7b9c2, metalness: 0.9, roughness: 0.3 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0xaeb4bd, metalness: 0.85, roughness: 0.35 }),
  yellow: () => new THREE.MeshStandardMaterial({ color: 0xf4b400, metalness: 0.2, roughness: 0.5 }),
  red: () => new THREE.MeshStandardMaterial({ color: 0xc62828, metalness: 0.2, roughness: 0.5 }),
};

const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return o; };
const cyl = (r, len, m, x, y, z, axis = 'x', seg = 20) => {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), m); o.position.set(x, y, z);
  if (axis === 'x') o.rotation.z = Math.PI / 2; else if (axis === 'z') o.rotation.x = Math.PI / 2; return o;
};

/** Everything that depends on the quote. Returns { group, extent } or null when there is no valid size. */
export function buildTank(state) {
  const sz = state && state.size; if (!sz) return null;
  const { W, H, L, emboss } = sz, Lt = L * MM, emb = emboss * MM, len = Lt + 2 * emb;
  const acc = new Set(state.accessories || []), Lch = len + 0.5, yBase = 1.25, yc = yBase + (H * MM) / 2, yTop = yBase + H * MM;
  const group = new THREE.Group(), M = mats, dark = M.dark(), steel = M.steel();

  // Tank body
  const [col, met, rou] = MATERIAL[state.material] || MATERIAL.ms;
  const body = new THREE.Mesh(tankGeometry(spellProfile(W, H, (W * REF.Rw) / REF.W, (H * REF.Rh) / REF.H), L, emboss),
    new THREE.MeshStandardMaterial({ color: col, metalness: met, roughness: rou }));
  body.position.y = yc; group.add(body);
  const sections = Math.max(1, state.sections || 1);
  for (let i = 0; i < sections; i++) { // one manhole per compartment
    const x = -Lt / 2 + (Lt * (i + 0.5)) / sections;
    group.add(cyl(0.27, 0.1, steel, x, yTop + 0.03, 0, 'y', 28), cyl(0.2, 0.05, dark, x, yTop + 0.1, 0, 'y', 24));
  }

  // Chassis
  [-0.85, 0.85].forEach((z) => group.add(box(Lch, 0.22, 0.1, dark, 0, 1.1, z)));
  group.add(box(Lch, 0.05, 2.0, dark, 0, 1.19, 0));
  for (let x = -Lch / 2 + 0.4; x < Lch / 2; x += 1.2) group.add(box(0.1, 0.18, 1.9, dark, x, 1.06, 0));
  group.add(cyl(0.12, 0.08, steel, Lch / 2 - 0.5, 1.2, 0, 'y'));
  [-0.8, 0.8].forEach((z) => group.add(box(0.12, 0.75, 0.12, dark, Lch / 2 - 2.2, 0.78, z)));
  const axles = Lch < 6 ? 2 : 3;
  for (let a = 0; a < axles; a++) {
    const x = -Lch / 2 + 1.1 + a * 1.35;
    group.add(cyl(0.06, 2.5, dark, x, 0.52, 0, 'z'));
    [-1.22, -0.9, 0.9, 1.22].forEach((z) => { group.add(cyl(0.52, 0.28, M.tyre(), x, 0.52, z, 'z', 28), cyl(0.28, 0.3, M.hub(), x, 0.52, z, 'z', 20)); });
  }

  // Accessories: each one is only added when ticked, so toggling is live.
  const rear = -Lch / 2, front = Lch / 2;
  if (acc.has('catwalk')) {
    const w = Math.max(Lt * 0.85, 1); group.add(box(w, 0.03, 0.6, steel, 0, yTop + 0.16, 0));
    [-0.3, 0.3].forEach((z) => { group.add(box(w, 0.03, 0.03, M.yellow(), 0, yTop + 0.62, z)); for (let x = -w / 2; x <= w / 2 + 0.01; x += 1.4) group.add(box(0.04, 0.46, 0.04, M.yellow(), x, yTop + 0.39, z)); });
    const hgt = yTop - 0.5; [0.2, 0.55].forEach((z) => group.add(box(0.04, hgt, 0.04, steel, -len / 2 - 0.12, 0.5 + hgt / 2, z)));
    for (let y = 0.7; y < yTop; y += 0.3) group.add(box(0.04, 0.03, 0.4, steel, -len / 2 - 0.12, y, 0.375));
  }
  if (acc.has('bumper')) { group.add(box(0.14, 0.2, 2.3, dark, rear - 0.06, 0.75, 0)); [-0.7, 0.7].forEach((z) => group.add(box(0.4, 0.08, 0.08, dark, rear + 0.14, 0.78, z))); }
  if (acc.has('railguard')) {
    const gl = Math.min(Lch - 3.2, Lt * 0.7), gx = front - 1.6 - gl / 2;
    [-1.15, 1.15].forEach((z) => { [0.62, 0.9].forEach((y) => group.add(cyl(0.025, gl, steel, gx, y, z, 'x', 12)));
      for (let x = -gl / 2; x <= gl / 2 + 0.01; x += 1) group.add(cyl(0.025, 0.4, steel, gx + x, 0.76, z, 'y', 10)); });
  }
  if (acc.has('valvebox')) group.add(box(0.5, 0.45, 0.7, dark, rear + 0.5, 0.82, 0));
  if (acc.has('eso')) { group.add(cyl(0.015, 0.3, M.red(), rear + 0.5, 1.28, 0.42, 'y', 8)); const k = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), M.red()); k.position.set(rear + 0.5, 1.45, 0.42); group.add(k); }
  if (acc.has('hosecarrier')) { group.add(cyl(0.09, 3.05, dark, front - 4.2, 0.85, -0.95, 'x', 16)); [-1.55, 1.55].forEach((d) => group.add(cyl(0.1, 0.06, steel, front - 4.2 + d, 0.85, -0.95, 'x', 16))); }
  if (acc.has('nozzlebox')) group.add(box(0.55, 0.38, 0.36, dark, front - 1.4, 0.95, 1.0));
  if (acc.has('mudguard')) for (let a = 0; a < axles; a++) { const x = -Lch / 2 + 1.1 + a * 1.35;
    [-1.06, 1.06].forEach((z) => { const geo = new THREE.CylinderGeometry(0.62, 0.62, 0.66, 20, 1, true, 0, Math.PI); geo.rotateX(Math.PI / 2); geo.rotateZ(Math.PI / 2); /* half-shell, arch facing up */ const g = new THREE.Mesh(geo, M.dark()); g.material.side = THREE.DoubleSide; g.position.set(x, 0.52, z); group.add(g); }); }
  if (acc.has('fire')) { group.add(box(0.3, 0.06, 0.3, dark, front - 0.9, 0.62, -1.0), cyl(0.09, 0.4, M.red(), front - 0.9, 0.85, -1.0, 'y', 16)); }

  return { group, extent: { len: Lch, width: Math.max(W * MM, 2.5), top: yTop } };
}
