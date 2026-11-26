import "server-only";
import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

/**
 * Read client for published content. `useCdn: false` because results are already cached by
 * Next.js ('use cache' + cacheTag) and the publish webhook must read fresh data, not a CDN copy.
 *
 * The dataset holds job applications (personal data), so it must be PRIVATE in Sanity.
 * Reading a private dataset needs SANITY_API_READ_TOKEN ("Viewer"). The token is only used
 * on the server; queries never ask for application documents.
 */
export const readClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;

/**
 * Write client for job applications. Needs SANITY_API_WRITE_TOKEN with "Editor" rights
 * (create documents + upload assets). Null when not configured.
 */
export function getWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!isSanityConfigured || !token) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}
