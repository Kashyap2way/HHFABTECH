// Server-only helpers for the password-gated weight calculator. Never imported by browser code.
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

export const TOKEN_TTL_MS = 30 * 60 * 1000;
const b64 = b => Buffer.from(b).toString('base64url');

/** Create "scrypt$<salt>$<hash>" for the WEIGHT_PASSWORD_HASH env var. */
export function hashPassword(pw, salt = randomBytes(16).toString('hex')) {
  return `scrypt$${salt}$${scryptSync(String(pw), salt, 32).toString('hex')}`;
}
export function verifyPassword(pw, stored) {
  const [alg, salt, hash] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !salt || !hash || typeof pw !== 'string' || pw.length > 200) return false;
  const a = scryptSync(pw, salt, 32), b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
export function signToken(secret, now = Date.now()) {
  const p = b64(JSON.stringify({ exp: now + TOKEN_TTL_MS, n: randomBytes(8).toString('hex') }));
  return `${p}.${createHmac('sha256', secret).update(p).digest('base64url')}`;
}
export function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || !secret) return false;
  const [p, sig] = token.split('.');
  if (!p || !sig) return false;
  const good = createHmac('sha256', secret).update(p).digest('base64url');
  if (sig.length !== good.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > now; } catch { return false; }
}

const MATERIALS = { ms: 7850, ss304: 7930, ss316: 8000, al: 2700 };   // kg/m³ (typical handbook values)
const num = (v, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v > lo && v <= hi ? v : null);

/**
 * Estimate weights. Units: A mm² (cross-section), P mm (perimeter), L mm, thicknesses mm,
 * densities kg/m³, filledM3 m³. Returns { errors } or { shellKg, dishKg, baffleKg, steelKg, liquidKg, operatingKg }.
 * Steel = shell + two dish ends + baffles only; fittings, brackets, manholes, welds are NOT included.
 */
export function calculateTankWeight(i) {
  const e = {}, g = (k, lo, hi) => { const v = num(i[k], lo, hi); if (v === null) e[k] = 'invalid'; return v; };
  const A = g('A_mm2', 0, 1e8), P = g('P_mm', 0, 1e6), L = g('L_mm', 0, 1e6), ts = g('shellMm', 0, 100), td = g('dishMm', 0, 100);
  const rho = MATERIALS[i.material] ?? (i.material === 'custom' ? num(i.customDensity, 100, 25000) : null);
  if (rho === null) e.material = 'invalid';
  const nb = Number.isInteger(i.baffles) && i.baffles >= 0 && i.baffles <= 200 ? i.baffles : (e.baffles = 'invalid', 0);
  let liquid = null;
  if (i.filledM3 != null || i.liquidDensity != null) {
    const v = typeof i.filledM3 === 'number' && Number.isFinite(i.filledM3) && i.filledM3 >= 0 && i.filledM3 <= 1000 ? i.filledM3 : (e.filledM3 = 'invalid', 0);
    const d = num(i.liquidDensity, 0, 25000); if (d === null) e.liquidDensity = 'invalid'; else liquid = v * d;   // Mass = Volume × Density
  }
  if (Object.keys(e).length) return { errors: e };
  const shellKg = (P / 1000) * (L / 1000) * (ts / 1000) * rho, dishOne = (A / 1e6) * (td / 1000) * rho;
  const dishKg = 2 * dishOne, baffleKg = nb * dishOne, steelKg = shellKg + dishKg + baffleKg;
  return { shellKg, dishKg, baffleKg, steelKg, liquidKg: liquid, operatingKg: liquid === null ? null : steelKg + liquid };
}
