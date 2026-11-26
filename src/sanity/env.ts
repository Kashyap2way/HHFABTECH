/**
 * Sanity connection settings. The project ID and dataset are public (they ship to the
 * browser for the embedded Studio); tokens are server-only and never prefixed NEXT_PUBLIC_.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
/** Pin the API version so query behaviour never changes underneath us. */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-01";

/** False until a project ID is configured; the careers pages then use the bundled fallback jobs. */
export const isSanityConfigured = /^[a-z0-9-]+$/.test(projectId);
