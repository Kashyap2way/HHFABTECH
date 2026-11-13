"use client";

import { submitToNetlifyAndSanity } from "./dual-submit";

export const APPLICATION_FORM_NAME = "career";

/** Job application → Netlify Forms (notifications) + Sanity (record and résumé). */
export function submitApplication(data: FormData): Promise<void> {
  return submitToNetlifyAndSanity({
    formName: APPLICATION_FORM_NAME,
    apiPath: "/api/careers/apply",
    data,
    // Résumés are capped at 5 MB by validation, so they always go to Sanity too.
    fileField: "resume",
    maxApiFileBytes: Number.POSITIVE_INFINITY,
    failureMessage:
      "Your application couldn't be sent right now. Please try again, or email us your résumé.",
  });
}
