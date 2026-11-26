// Server-only helpers for the password-gated weight estimate. Never imported by browser code.
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const TOKEN_TTL_MS = 30 * 60 * 1000;
const b64 = (b: string | Buffer) => Buffer.from(b).toString("base64url");

/** Create "scrypt$<salt>$<hash>" for the WEIGHT_PASSWORD_HASH env var. */
export function hashPassword(
  pw: string,
  salt = randomBytes(16).toString("hex"),
): string {
  return `scrypt$${salt}$${scryptSync(String(pw), salt, 32).toString("hex")}`;
}

export function verifyPassword(
  pw: unknown,
  stored: string | undefined,
): boolean {
  const [alg, salt, hash] = String(stored ?? "").split("$");
  if (
    alg !== "scrypt" ||
    !salt ||
    !hash ||
    typeof pw !== "string" ||
    pw.length > 200
  )
    return false;
  const a = scryptSync(pw, salt, 32);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signToken(secret: string, now = Date.now()): string {
  const p = b64(
    JSON.stringify({
      exp: now + TOKEN_TTL_MS,
      n: randomBytes(8).toString("hex"),
    }),
  );
  return `${p}.${createHmac("sha256", secret).update(p).digest("base64url")}`;
}

export function verifyToken(
  token: unknown,
  secret: string | undefined,
  now = Date.now(),
): boolean {
  if (typeof token !== "string" || !secret) return false;
  const [p, sig] = token.split(".");
  if (!p || !sig) return false;
  const good = createHmac("sha256", secret).update(p).digest("base64url");
  if (
    sig.length !== good.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(good))
  )
    return false;
  try {
    return JSON.parse(Buffer.from(p, "base64url").toString()).exp > now;
  } catch {
    return false;
  }
}

/** Typical handbook densities, kg/m³. */
const MATERIALS: Record<string, number> = {
  ms: 7850,
  ss304: 7930,
  ss316: 8000,
  al: 2700,
};

const num = (v: unknown, lo: number, hi: number): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > lo && v <= hi ? v : null;

export type WeightInput = {
  A_mm2?: unknown;
  P_mm?: unknown;
  L_mm?: unknown;
  shellMm?: unknown;
  dishMm?: unknown;
  material?: unknown;
  customDensity?: unknown;
  baffles?: unknown;
  filledM3?: unknown;
  liquidDensity?: unknown;
};

export type WeightResult = {
  shellKg: number;
  dishKg: number;
  baffleKg: number;
  steelKg: number;
  liquidKg: number | null;
  operatingKg: number | null;
};

/**
 * Steel = shell + two dish ends + baffles only. Fittings, brackets, manholes, welds and chassis
 * are NOT included. Units: A mm², P mm, L mm, thicknesses mm, densities kg/m³, filledM3 m³.
 */
export function calculateTankWeight(
  i: WeightInput,
): WeightResult | { errors: Record<string, string> } {
  const e: Record<string, string> = {};
  const g = (k: keyof WeightInput, lo: number, hi: number): number => {
    const v = num(i[k], lo, hi);
    if (v === null) e[k] = "invalid";
    return v ?? 0;
  };
  const A = g("A_mm2", 0, 1e8);
  const P = g("P_mm", 0, 1e6);
  const L = g("L_mm", 0, 1e6);
  const ts = g("shellMm", 0, 100);
  const td = g("dishMm", 0, 100);

  const material = typeof i.material === "string" ? i.material : "";
  let rho: number | null = MATERIALS[material] ?? null;
  if (rho === null && material === "custom")
    rho = num(i.customDensity, 100, 25000);
  if (rho === null) e.material = "invalid";

  let nb = 0;
  if (
    typeof i.baffles === "number" &&
    Number.isInteger(i.baffles) &&
    i.baffles >= 0 &&
    i.baffles <= 200
  )
    nb = i.baffles;
  else e.baffles = "invalid";

  let liquid: number | null = null;
  if (i.filledM3 != null || i.liquidDensity != null) {
    let v = 0;
    if (
      typeof i.filledM3 === "number" &&
      Number.isFinite(i.filledM3) &&
      i.filledM3 >= 0 &&
      i.filledM3 <= 1000
    )
      v = i.filledM3;
    else e.filledM3 = "invalid";
    const d = num(i.liquidDensity, 0, 25000);
    if (d === null) e.liquidDensity = "invalid";
    else liquid = v * d; // mass = volume × density
  }
  if (Object.keys(e).length || rho === null) return { errors: e };

  const shellKg = (P / 1000) * (L / 1000) * (ts / 1000) * rho;
  const dishOne = (A / 1e6) * (td / 1000) * rho;
  const dishKg = 2 * dishOne;
  const baffleKg = nb * dishOne;
  const steelKg = shellKg + dishKg + baffleKg;
  return {
    shellKg,
    dishKg,
    baffleKg,
    steelKg,
    liquidKg: liquid,
    operatingKg: liquid === null ? null : steelKg + liquid,
  };
}
