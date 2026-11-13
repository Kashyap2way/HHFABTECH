/**
 * Analytics configuration. All IDs are public (they ship to the browser) and
 * come from NEXT_PUBLIC_* env vars so each Netlify context can use its own.
 *
 * Tags only load in production builds unless NEXT_PUBLIC_ANALYTICS_DEBUG=true.
 */

const toNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const analyticsConfig = {
  /** GA4 measurement ID. Defaults to the ID used by the legacy site. */
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "G-7B4LV4Z6FE",
  /** Meta (Facebook) Pixel ID. */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  /** LinkedIn Insight Tag partner ID. */
  linkedinPartnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,
  /** LinkedIn conversion rule IDs (Campaign Manager > Analyze > Conversions). */
  linkedinConversions: {
    lead: toNumber(process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_LEAD),
    application: toNumber(
      process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_APPLICATION,
    ),
    contact: toNumber(process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_CONTACT),
  },
  /** Load tags and fire events in this environment? */
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
  debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
} as const;
