// Run: node tests/weight.test.mjs
import assert from 'node:assert'; import { readFileSync, readdirSync, statSync } from 'node:fs'; import { join } from 'node:path';
import { hashPassword, verifyPassword, signToken, verifyToken, calculateTankWeight } from '../netlify/lib/weight.mjs';
const TEST_PW = 'unit-test-pw-not-real'; process.env.WEIGHT_PASSWORD_HASH = hashPassword(TEST_PW); process.env.WEIGHT_TOKEN_SECRET = 'x'.repeat(64);
const auth = (await import('../netlify/functions/weight-auth.mjs')).default, calc = (await import('../netlify/functions/weight-calc.mjs')).default;
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok -', name); };
const post = (h, body, token) => h(new Request('http://x/api', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) }));
const near = (a, b) => assert(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const input = { A_mm2: 1e6, P_mm: 4000, L_mm: 5000, shellMm: 3, dishMm: 4, material: 'ms', baffles: 2 };

await t('wrong password: generic 401, no token', async () => { const r = await post(auth, { password: 'nope' }); assert.equal(r.status, 401); const j = await r.json(); assert.deepEqual(Object.keys(j), ['error']); });
await t('missing/oversized/non-string password rejected', async () => { for (const p of [undefined, 123, 'x'.repeat(500), '']) assert.equal((await post(auth, { password: p })).status, 401); });
await t('GET not allowed; unconfigured server returns 503', async () => { assert.equal((await auth(new Request('http://x/api'))).status, 405);
  const h = process.env.WEIGHT_PASSWORD_HASH; delete process.env.WEIGHT_PASSWORD_HASH; assert.equal((await post(auth, { password: TEST_PW })).status, 503); process.env.WEIGHT_PASSWORD_HASH = h; });
let token; await t('correct password returns signed token', async () => { const r = await post(auth, { password: TEST_PW }); assert.equal(r.status, 200); token = (await r.json()).token; assert(verifyToken(token, process.env.WEIGHT_TOKEN_SECRET)); });
await t('calc without / with forged / expired / wrong-secret token → 401', async () => {
  assert.equal((await post(calc, input)).status, 401); assert.equal((await post(calc, input, 'abc.def')).status, 401);
  assert.equal((await post(calc, input, token.slice(0, -2) + 'xx')).status, 401);
  assert.equal((await post(calc, input, signToken(process.env.WEIGHT_TOKEN_SECRET, Date.now() - 31 * 60 * 1000))).status, 401);
  assert.equal((await post(calc, input, signToken('other-secret'))).status, 401); });
await t('weight matches hand calculation (steel)', async () => { const r = await (await post(calc, input, token)).json();
  near(r.shellKg, 471); near(r.dishKg, 62.8); near(r.baffleKg, 62.8); near(r.steelKg, 596.6); assert.equal(r.liquidKg, null); assert.equal(r.operatingKg, null); });
await t('liquid = volume × density; operating = steel + liquid', async () => { const r = calculateTankWeight({ ...input, filledM3: 5, liquidDensity: 830 });
  near(r.liquidKg, 4150); near(r.operatingKg, 596.6 + 4150); });
await t('materials and custom density', async () => { near(calculateTankWeight({ ...input, material: 'al' }).shellKg, 4 * 5 * 0.003 * 2700); near(calculateTankWeight({ ...input, material: 'custom', customDensity: 1000 }).shellKg, 60);
  assert(calculateTankWeight({ ...input, material: 'custom', customDensity: 50 }).errors.material); });
await t('invalid inputs rejected per field; never NaN', async () => { for (const bad of [{ A_mm2: -1 }, { P_mm: NaN }, { L_mm: Infinity }, { shellMm: 0 }, { dishMm: '4' }, { baffles: 1.5 }, { material: 'gold' }, { liquidDensity: -5, filledM3: 1 }, { filledM3: -1, liquidDensity: 1000 }]) {
    const r = calculateTankWeight({ ...input, ...bad }); assert(r.errors && Object.keys(r.errors).length, JSON.stringify(bad)); }
  const r = await post(calc, { ...input, A_mm2: -1 }, token); assert.equal(r.status, 400); });
await t('password hash verify: right/wrong/garbage', () => { const h = hashPassword('abc'); assert(verifyPassword('abc', h)); assert(!verifyPassword('abd', h)); assert(!verifyPassword('abc', 'garbage')); assert(!verifyPassword('abc', undefined)); });
await t('no password, hash, secret or weight maths shipped to the browser', () => {
  const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return f === 'node_modules' || f === '.git' || f === 'netlify' || f === 'tests' || f === 'scripts' ? [] : statSync(p).isDirectory() ? walk(p) : /\.(html|js|css|json|txt|xml)$/.test(f) ? [p] : []; });
  for (const f of walk('.')) { const s = readFileSync(f, 'utf8'); assert(!s.includes('scrypt$'), f); assert(!/WEIGHT_TOKEN_SECRET|WEIGHT_PASSWORD/.test(s), f); assert(!/\b4046\b/.test(s), f); }
  const html = readFileSync('calculator.html', 'utf8'); assert(!/density\s*\*|\*\s*density|dishOne/.test(html), 'weight formula still in browser'); });
console.log(`\n${n} weight test groups passed`);
