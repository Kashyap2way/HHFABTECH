import type { NextRequest } from "next/server";
import {
  cleanApplication,
  MAX_RESUME_BYTES,
  validateApplication,
} from "@/lib/forms/application-validation";
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
 * Stores a job application (and résumé) in Sanity. The browser also submits the same form
 * to Netlify Forms for email notifications, so either store succeeding counts as delivered.
 *
 * Security: server-side validation (never trust the client), honeypot, size cap before
 * parsing, a small per-IP rate limit, and a write token that never leaves the server.
 */

const limited = createRateLimiter(5, 10 * 60 * 1000);

/** Sanity document IDs: letters, digits, `_`, `-` and `.`; sample jobs aren't real documents. */
const isDocId = (id: string) =>
  /^[\w.-]{1,128}$/.test(id) && !id.startsWith("fallback-");

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_RESUME_BYTES + 512 * 1024)
    return json({ ok: false, error: "too_large" }, 413);

  if (limited(clientIp(request)))
    return json({ ok: false, error: "rate_limited" }, 429);

  const data = await readForm(request);
  if (!data) return json({ ok: false, error: "bad_request" }, 400);

  // Honeypot: pretend success so bots don't retry.
  if (String(data.get("bot-field") ?? "")) return json({ ok: true });

  const errors = validateApplication(data);
  if (Object.keys(errors).length)
    return json({ ok: false, error: "invalid", errors }, 400);

  const client = getWriteClient();
  if (!client) return json({ ok: false, error: "not_configured" }, 503);

  const fields = cleanApplication(data);
  const resume = data.get("resume") as File;

  try {
    const asset = await client.assets.upload(
      "file",
      Buffer.from(await resume.arrayBuffer()),
      {
        filename: safeFilename(resume.name),
        contentType: resume.type || "application/octet-stream",
      },
    );

    const attribution = attributionFrom(data);

    const jobId = fields.job_id;
    await client.create({
      _type: "jobApplication",
      status: "new",
      ...(jobId && isDocId(jobId)
        ? { job: { _type: "reference", _ref: jobId, _weak: true } }
        : {}),
      position: fields.job_position,
      name: fields.name,
      email: fields.email,
      phone: fields.phone,
      city: fields.city,
      qualification: fields.qualification,
      experience: fields.experience,
      currentCompany: fields.current_company,
      expectedSalary: fields.expected_salary,
      noticePeriod: fields.notice_period,
      message: fields.message,
      resume: {
        _type: "file",
        asset: { _type: "reference", _ref: asset._id },
      },
      submittedAt: new Date().toISOString(),
      attribution,
    });
  } catch (e) {
    console.error("[careers/apply] Sanity write failed", e);
    return json({ ok: false, error: "store_failed" }, 502);
  }

  return json({ ok: true });
}
