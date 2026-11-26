import type { Config } from "@netlify/functions";
import { signToken, verifyPassword } from "../lib/weight.mts";

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

/** POST { password } -> { token, expiresInSeconds }. The password is never logged. */
export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Not allowed" }, 405);
  const hash = process.env.WEIGHT_PASSWORD_HASH;
  const secret = process.env.WEIGHT_TOKEN_SECRET;
  if (!hash || !secret)
    return json({ error: "Weight calculator is not configured." }, 503);

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Access denied." }, 401);
  }
  if (!verifyPassword(body?.password, hash)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return json({ error: "Access denied." }, 401);
  }
  return json({ token: signToken(secret), expiresInSeconds: 1800 });
};

export const config: Config = {
  path: "/api/weight-auth",
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
