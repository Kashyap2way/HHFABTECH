import { verifyPassword, signToken } from '../lib/weight.mjs';
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Not allowed' }, 405);
  const hash = process.env.WEIGHT_PASSWORD_HASH, secret = process.env.WEIGHT_TOKEN_SECRET;
  if (!hash || !secret) return json({ error: 'Weight calculator is not configured.' }, 503);
  let body; try { body = await req.json(); } catch { return json({ error: 'Access denied.' }, 401); }
  if (!verifyPassword(body?.password, hash)) { await new Promise(r => setTimeout(r, 600)); return json({ error: 'Access denied.' }, 401); } // generic; password never logged
  return json({ token: signToken(secret), expiresInSeconds: 1800 });
};
export const config = { path: '/api/weight-auth', rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] } };
