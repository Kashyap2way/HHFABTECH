import type { Config } from "@netlify/functions";
import { calculateTankWeight, verifyToken } from "../lib/weight.mts";

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

/** POST (Authorization: Bearer <token>) with the tank figures -> weights. */
export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Not allowed" }, 405);
  const token = (req.headers.get("authorization") ?? "").replace(
    /^Bearer /,
    "",
  );
  if (!verifyToken(token, process.env.WEIGHT_TOKEN_SECRET))
    return json({ error: "Access denied." }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const result = calculateTankWeight((body ?? {}) as Record<string, unknown>);
  return "errors" in result
    ? json({ errors: result.errors }, 400)
    : json(result);
};

export const config: Config = {
  path: "/api/weight-calc",
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
