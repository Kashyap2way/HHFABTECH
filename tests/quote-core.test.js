// Run: node tests/quote-core.test.js
const assert = require('assert'), Q = require('../assets/js/quote-core.js'); let n = 0; const t = (m, f) => { f(); n++; console.log('ok -', m); };
t('size round-trip: recomputed capacity equals requested', () => { for (const L of [5000, 12000, 20000, 32000]) { const s = Q.sizeTank(L); const back = s.areaMm2 * (s.L + 4 / 3 * s.emboss) / 1e6; assert(Math.abs(back - L) < 1e-6, L); } });
t('width/height never exceed 2400 x 1830', () => { const s = Q.sizeTank(20000, { W: 5000, H: 5000 }); assert(s.W === 2400 && s.H === 1830); });
t('too-small or invalid capacity returns null', () => { assert.strictEqual(Q.sizeTank(0), null); assert.strictEqual(Q.sizeTank(-5), null); assert.strictEqual(Q.sizeTank(100), null); });
t('baffles follow calculator rule (5000 L, +20%, 95%, even)', () => { assert.deepStrictEqual([Q.baffles(20000).sections, Q.baffles(20000).plates], [4, 3]); assert.strictEqual(Q.baffles(5000).plates, 0); assert.strictEqual(Q.baffles(0).sections, 0); assert(Q.baffles(30000).sections % 2 === 0); });
t('TON to KL uses density', () => { assert(Math.abs(Q.toKL(16.6, 'TON', 0.83) - 20) < 1e-9); assert.strictEqual(Q.toKL(20, 'KL', 0.83), 20); });
t('price is null until rate card set; then adds 18% GST', () => { const q = { capacityKL: 10, material: 'ms', accessories: [] }; assert.strictEqual(Q.price(q), null);
  Q.CFG.pricing.perKL = 100000; const p = Q.price(q); assert.strictEqual(p.subtotal, 1e6); assert.strictEqual(p.gst, 180000); assert.strictEqual(p.total, 1180000); assert.strictEqual(Q.price({ ...q, material: 'ss304' }), null); Q.CFG.pricing.perKL = null; });
t('defaults match brief: only fire extinguisher unchecked, MS material', () => { const d = Q.defaults(); assert.strictEqual(d.material, 'ms'); assert(!d.accessories.includes('fire')); assert.strictEqual(d.accessories.length, 8); });
t('delivery skips Sundays and holidays', () => { const d = Q.estimateDelivery(new Date(2026, 5, 1), 5); assert(Q.isWorking(d.date)); assert.strictEqual(d.peak, false); assert.strictEqual(d.workingDays, 25);
  const pk = Q.estimateDelivery(new Date(2026, 2, 2), 5); assert(pk.peak && pk.workingDays === Math.ceil(25 * 1.25)); assert(!Q.isWorking(new Date(2026, 10, 8))); });
console.log(`\n${n} quote test groups passed`);
