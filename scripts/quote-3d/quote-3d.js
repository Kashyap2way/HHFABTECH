// Quote-builder 3D viewer. The ONLY page that loads three.js. Listens for 'hhquote:update' from quote.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildTank } from './tank-model.js';

const canvas = document.getElementById('q3d');
if (canvas) {
  const stage = canvas.parentElement, empty = document.getElementById('q3dEmpty'), dims = document.getElementById('q3dDims');
  const fmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  let renderer, scene, camera, controls, current, state = window.__hhQuoteState || null, touched = false, framedFor = 0, queued = false;

  const fail = (msg) => { canvas.hidden = true; empty.hidden = false; empty.textContent = msg; };
  const render = () => { queued = false; if (renderer) renderer.render(scene, camera); };
  const draw = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };

  function init() {
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return fail('3D preview is not supported on this device. Your quote still works.'); }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping;
    scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(-6, 10, 8); scene.add(sun);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshBasicMaterial({ color: 0xece9f3 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.005; scene.add(floor);
    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 300);
    controls = new OrbitControls(camera, canvas); controls.maxPolarAngle = Math.PI / 2.02; controls.screenSpacePanning = true; controls.addEventListener('change', draw);
    controls.addEventListener('start', () => { touched = true; });
    new ResizeObserver(resize).observe(stage); resize(); apply();
  }
  function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h || !renderer) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); draw(); }
  function frame(ext) {
    const r = Math.max(ext.len, 6) * 0.95; controls.target.set(0, 1.5, 0);
    camera.position.set(-r * 0.62, 1.6 + r * 0.34, r * 0.78); controls.minDistance = 3; controls.maxDistance = Math.max(ext.len * 3, 30); controls.update(); framedFor = ext.len;
  }
  function apply() {
    if (!renderer) return;
    if (current) { scene.remove(current); current.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); current = null; }
    const built = buildTank(state);
    empty.hidden = !!built; canvas.style.visibility = built ? 'visible' : 'hidden';
    if (!built) { dims.textContent = ''; return draw(); }
    current = built.group; scene.add(current);
    if (!touched || Math.abs(framedFor - built.extent.len) > 0.5 * framedFor) frame(built.extent);
    const s = state.size; dims.textContent = `${fmt.format(s.W)} wide × ${fmt.format(s.H)} high × ${fmt.format(Math.round(s.L))} mm long`; draw();
  }
  document.addEventListener('hhquote:update', (e) => { state = e.detail; apply(); });
  // Only spin up WebGL once the viewer scrolls near the screen.
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); init(); } }, { rootMargin: '200px' }); io.observe(stage); } else init();
}
