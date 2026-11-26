"use client";

/**
 * First-touch attribution. Ad platforms append UTM params and click IDs
 * (gclid, fbclid, li_fat_id) to the landing URL. We keep them for the session so
 * a lead submitted three pages later still carries its campaign source into the
 * Netlify Forms submission.
 */

const STORAGE_KEY = "hh_attribution_v1";

const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "li_fat_id",
] as const;

export type Attribution = Partial<
  Record<(typeof TRACKED_PARAMS)[number] | "landing_page" | "referrer", string>
>;

export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const data: Attribution = {};
    for (const key of TRACKED_PARAMS) {
      const value = params.get(key);
      if (value) data[key] = value;
    }
    data.landing_page = window.location.pathname;
    if (document.referrer) data.referrer = document.referrer;

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be blocked (private mode); attribution is best-effort.
  }
}

export function getAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
