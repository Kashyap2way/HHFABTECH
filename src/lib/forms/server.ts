import "server-only";
import type { NextRequest } from "next/server";

/** Shared pieces for the form API routes (/api/contact, /api/careers/apply). */

export const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "li_fat_id",
  "landing_page",
  "referrer",
  "source_page",
] as const;

export const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Best-effort per-IP limiter; instances are short-lived, Netlify's spam filter covers the rest. */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > max;
  };
}

/** Keep the original extension, drop anything path-like or odd. */
export const safeFilename = (name: string) =>
  name
    .replace(/[/\\]/g, "_")
    .replace(/[^\w.\- ]+/g, "")
    .slice(-100) || "upload";

export function attributionFrom(data: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ATTRIBUTION_KEYS) {
    const v = String(data.get(k) ?? "").trim();
    if (v) out[k] = v.slice(0, 500);
  }
  return out;
}

export async function readForm(request: NextRequest): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}
