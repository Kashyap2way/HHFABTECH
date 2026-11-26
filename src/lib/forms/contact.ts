"use client";

import { submitToNetlifyAndSanity } from "./dual-submit";

export const CONTACT_FORM_NAME = "contact";

/** Sales inquiry → Netlify Forms (notifications) + Sanity (record, attachment ≤ 4.5 MB). */
export function submitContact(data: FormData): Promise<void> {
  return submitToNetlifyAndSanity({
    formName: CONTACT_FORM_NAME,
    apiPath: "/api/contact",
    data,
    fileField: "attachment",
    failureMessage:
      "Your message couldn't be sent right now. Please try again, or call or WhatsApp us.",
  });
}
