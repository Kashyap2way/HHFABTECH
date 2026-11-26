"use client";

import { track } from "@/lib/analytics/events";
import { FormSubmitError, submitNetlifyForm } from "./netlify";

/**
 * Sends one form submission to both destinations:
 *  - Netlify Forms: email notifications + dashboard (the team's inbox)
 *  - Sanity via `apiPath`: the stored record, managed in /studio
 * Delivered if either succeeds; a partial failure is reported to analytics, not the visitor.
 *
 * Files above `maxApiFileBytes` are dropped from the Sanity copy (serverless request limit)
 * and flagged with `attachment_skipped`; Netlify still receives them.
 */
type StoreResult = "stored" | "not_configured" | "failed";

async function store(
  apiPath: string,
  data: FormData,
  fileField: string | undefined,
  maxApiFileBytes: number,
): Promise<StoreResult> {
  let body = data;
  const file = fileField ? data.get(fileField) : null;
  if (file instanceof File && file.size > maxApiFileBytes) {
    body = new FormData();
    for (const [k, v] of data) if (k !== fileField) body.append(k, v);
    body.set("attachment_skipped", file.name);
  }
  try {
    const res = await fetch(apiPath, { method: "POST", body });
    if (res.ok) return "stored";
    return res.status === 503 ? "not_configured" : "failed";
  } catch {
    return "failed";
  }
}

export async function submitToNetlifyAndSanity({
  formName,
  apiPath,
  data,
  fileField,
  maxApiFileBytes = 4.5 * 1024 * 1024,
  failureMessage,
}: {
  formName: string;
  apiPath: string;
  data: FormData;
  fileField?: string;
  maxApiFileBytes?: number;
  failureMessage: string;
}): Promise<void> {
  // submitNetlifyForm adds form-name + attribution synchronously, so both copies carry them.
  const netlify = submitNetlifyForm(formName, data);
  const sanity = store(apiPath, data, fileField, maxApiFileBytes);
  const [n, s] = await Promise.allSettled([netlify, sanity]);

  const netlifyOk = n.status === "fulfilled";
  const sanityResult = s.status === "fulfilled" ? s.value : "failed";

  if (!netlifyOk && sanityResult !== "stored") {
    throw n.reason instanceof FormSubmitError
      ? n.reason
      : new FormSubmitError(failureMessage);
  }
  if (!netlifyOk)
    track({ name: "exception", description: `${formName}: netlify failed` });
  if (sanityResult === "failed")
    track({ name: "exception", description: `${formName}: sanity failed` });
}
