"use client";

import { getAttribution } from "@/lib/analytics/attribution";

/**
 * Netlify Forms with the Next.js runtime (OpenNext):
 * forms are detected at deploy time from the static file `public/__forms.html`,
 * and submissions must be POSTed to that static file. Field names sent here
 * MUST also exist in that file, or Netlify silently drops them.
 * https://opennext.js.org/netlify/forms
 */
export const NETLIFY_FORMS_ENDPOINT = "/__forms.html";

/** Hidden attribution fields appended to every submission (declared in __forms.html). */
export const ATTRIBUTION_FIELDS = [
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
] as const;

export class FormSubmitError extends Error {}

/**
 * Submit a Netlify form. Sends multipart FormData so file attachments work
 * (do not set Content-Type manually; the browser adds the boundary).
 *
 * In development there is no Netlify forms backend, so submissions are logged
 * and simulated unless NEXT_PUBLIC_FORMS_LIVE=true (e.g. under `netlify dev`).
 */
export async function submitNetlifyForm(
  formName: string,
  data: FormData,
): Promise<void> {
  data.set("form-name", formName);

  const attribution = getAttribution();
  for (const key of ATTRIBUTION_FIELDS) {
    const value = attribution[key];
    if (value && !data.get(key)) data.set(key, value);
  }

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_FORMS_LIVE !== "true"
  ) {
    console.info("[forms] simulated submission", Object.fromEntries(data));
    await new Promise((r) => setTimeout(r, 900));
    return;
  }

  let response: Response;
  try {
    response = await fetch(NETLIFY_FORMS_ENDPOINT, {
      method: "POST",
      body: data,
    });
  } catch {
    throw new FormSubmitError(
      "We couldn't reach the server. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    throw new FormSubmitError(
      response.status === 413
        ? "The attachment is too large. Please keep files under 8 MB."
        : "Your message couldn't be sent right now. Please try again, or call or WhatsApp us.",
    );
  }
}
