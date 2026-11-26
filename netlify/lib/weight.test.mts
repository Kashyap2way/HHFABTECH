// Run: node --test netlify/lib/weight.test.mts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateTankWeight,
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken,
} from "./weight.mts";

const PW = "unit-test-pw-not-real";
process.env.WEIGHT_PASSWORD_HASH = hashPassword(PW);
process.env.WEIGHT_TOKEN_SECRET = "x".repeat(64);

test("password hash verifies only the right password", () => {
  const stored = hashPassword(PW);
  assert.equal(verifyPassword(PW, stored), true);
  assert.equal(verifyPassword("wrong", stored), false);
  assert.equal(verifyPassword("a".repeat(201), stored), false);
  assert.equal(verifyPassword(PW, undefined), false);
});

test("tokens expire and reject tampering", () => {
  const secret = "s".repeat(64);
  const now = 1_000_000;
  const t = signToken(secret, now);
  assert.equal(verifyToken(t, secret, now + 1000), true);
  assert.equal(verifyToken(t, secret, now + 31 * 60 * 1000), false); // expired
  assert.equal(verifyToken(`${t}x`, secret, now), false);
  assert.equal(verifyToken(t, "other".repeat(13), now), false);
  assert.equal(verifyToken("", secret), false);
});

test("steel weight: shell + two dish ends + baffles", () => {
  const r = calculateTankWeight({
    A_mm2: 1.131e6, // ~1.2 m circle
    P_mm: 3770,
    L_mm: 3000,
    shellMm: 3,
    dishMm: 4,
    material: "ms",
    baffles: 1,
    filledM3: 3,
    liquidDensity: 1000,
  });
  assert.ok(!("errors" in r));
  if ("errors" in r) return;
  const shell = 3.77 * 3 * 0.003 * 7850;
  const dishOne = 1.131 * 0.004 * 7850;
  assert.ok(Math.abs(r.shellKg - shell) < 0.01);
  assert.ok(Math.abs(r.steelKg - (shell + 3 * dishOne)) < 0.01); // 2 ends + 1 baffle
  assert.equal(r.liquidKg, 3000);
  assert.ok(Math.abs((r.operatingKg ?? 0) - (r.steelKg + 3000)) < 1e-9);
});

test("invalid input is rejected field by field", () => {
  const r = calculateTankWeight({
    A_mm2: -1,
    material: "unobtainium",
    baffles: 1.5,
  });
  assert.ok("errors" in r);
  if (!("errors" in r)) return;
  for (const k of [
    "A_mm2",
    "P_mm",
    "L_mm",
    "shellMm",
    "dishMm",
    "material",
    "baffles",
  ])
    assert.ok(k in r.errors, k);
});

test("auth and calc handlers enforce the password and token", async () => {
  const auth = (await import("../functions/weight-auth.mts")).default;
  const calc = (await import("../functions/weight-calc.mts")).default;
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    new Request("http://x/", {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });

  assert.equal((await auth(new Request("http://x/"))).status, 405);
  assert.equal((await auth(post({ password: "nope" }))).status, 401);
  const ok = await auth(post({ password: PW }));
  assert.equal(ok.status, 200);
  const { token } = (await ok.json()) as { token: string };

  const body = {
    A_mm2: 1e6,
    P_mm: 3000,
    L_mm: 2000,
    shellMm: 3,
    dishMm: 4,
    material: "ms",
    baffles: 0,
  };
  assert.equal((await calc(post(body))).status, 401);
  assert.equal(
    (await calc(post(body, { authorization: "Bearer bad" }))).status,
    401,
  );
  const good = await calc(post(body, { authorization: `Bearer ${token}` }));
  assert.equal(good.status, 200);
  assert.ok(((await good.json()) as { steelKg: number }).steelKg > 0);
  assert.equal(
    (await calc(post({}, { authorization: `Bearer ${token}` }))).status,
    400,
  );
});
