import type { NextRequest } from "next/server";
import {
  ATTACHMENT_ACCEPT,
  validateContact,
} from "@/lib/forms/contact-validation";
import {
  attributionFrom,
  clientIp,
  createRateLimiter,
  json,
  readForm,
  safeFilename,
} from "@/lib/forms/server";
import { getWriteClient } from "@/sanity/client";

/**
 * Stores a Contact-form inquiry (and attachment) in Sanity. The browser also posts the same
 * form to Netlify Forms for email notifications. Files over 4.5 MB are not sent here
 * (serverless request limit); they arrive flagged as `attachment_skipped`.
 */

const MAX_BODY = 5 * 1024 * 1024;
const limited = createRateLimiter(5, 10 * 60 * 1000);

/** Field → max length. Anything not listed is ignored. */
const FIELDS = {
  name: 80,
  company: 120,
  phone: 20,
  email: 120,
  city: 120,
  product: 80,
  vehicle: 120,
  capacity: 60,
  compartments: 60,
  material: 60,
  requirement: 3000,
  specification: 4000,
  customization: 3000,
} as const;

export async function POST(request: NextRequest) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY)
    return json({ ok: false, error: "too_large" }, 413);
  if (limited(clientIp(request)))
    return json({ ok: false, error: "rate_limited" }, 429);

  const data = await readForm(request);
  if (!data) return json({ ok: false, error: "bad_request" }, 400);

  // Honeypot: pretend success so bots don't retry.
  if (String(data.get("bot-field") ?? "")) return json({ ok: true });

  const errors = validateContact(data);
  if (Object.keys(errors).length)
    return json({ ok: false, error: "invalid", errors }, 400);

  const client = getWriteClient();
  if (!client) return json({ ok: false, error: "not_configured" }, 503);

  const fields: Record<string, string> = {};
  for (const [k, max] of Object.entries(FIELDS)) {
    const v = String(data.get(k) ?? "").trim();
    if (v) fields[k] = v.slice(0, max);
  }

  try {
    let attachment: Record<string, unknown> | undefined;
    const file = data.get("attachment");
    if (file instanceof File && file.size > 0) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (ATTACHMENT_ACCEPT.split(",").includes(ext)) {
        const asset = await client.assets.upload(
          "file",
          Buffer.from(await file.arrayBuffer()),
          {
            filename: safeFilename(file.name),
            contentType: file.type || "application/octet-stream",
          },
        );
        attachment = {
          _type: "file",
          asset: { _type: "reference", _ref: asset._id },
        };
      }
    }
    const skipped = String(data.get("attachment_skipped") ?? "").trim();

    await client.create({
      _type: "inquiry",
      status: "new",
      ...fields,
      ...(attachment ? { attachment } : {}),
      ...(skipped
        ? {
            attachmentNote: `“${skipped.slice(0, 120)}” was too large to store here. It is attached to the Netlify Forms email.`,
          }
        : {}),
      submittedAt: new Date().toISOString(),
      attribution: attributionFrom(data),
    });
  } catch (e) {
    console.error("[contact] Sanity write failed", e);
    return json({ ok: false, error: "store_failed" }, 502);
  }

  return json({ ok: true });
}
