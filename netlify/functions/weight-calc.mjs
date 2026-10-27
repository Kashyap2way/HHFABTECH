import { verifyToken, calculateTankWeight } from '../lib/weight.mjs';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Not allowed' }, 405);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!verifyToken(token, process.env.WEIGHT_TOKEN_SECRET)) return json({ error: 'Access denied.' }, 401);
  let body; try { body = await req.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  const r = calculateTankWeight(body || {});
  return r.errors ? json({ errors: r.errors }, 400) : json(r);
};
export const config = { path: '/api/weight-calc', rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
