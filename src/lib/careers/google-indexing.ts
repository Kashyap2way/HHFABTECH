import "server-only";
import { createSign } from "node:crypto";

/**
 * Google Indexing API: tells Google to crawl a job page as soon as it's published, or to drop
 * it when closed/deleted. Google recommends this over sitemaps for JobPosting pages.
 * https://developers.google.com/search/apis/indexing-api/v3/using-api
 *
 * Optional. Enabled when GOOGLE_INDEXING_CLIENT_EMAIL and GOOGLE_INDEXING_PRIVATE_KEY are set
 * (a service account added as an Owner of the site in Search Console).
 * Uses a self-signed JWT, so no Google SDK is bundled.
 */

const SCOPE = "https://www.googleapis.com/auth/indexing";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const PUBLISH_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

const b64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

function credentials() {
  const email = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  // Netlify env vars store newlines as "\n" literals.
  const key = process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return email && key ? { email, key } : null;
}

export const isIndexingConfigured = () => credentials() !== null;

async function accessToken(email: string, key: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("no access_token");
  return body.access_token;
}

export type IndexingType = "URL_UPDATED" | "URL_DELETED";

/** Returns false (never throws) so a Google outage can't break publishing. */
export async function notifyGoogle(
  url: string,
  type: IndexingType,
): Promise<boolean> {
  const creds = credentials();
  if (!creds) return false;
  try {
    const token = await accessToken(creds.email, creds.key);
    const res = await fetch(PUBLISH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type }),
    });
    if (!res.ok) {
      console.error("[indexing]", type, url, res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[indexing] failed", e);
    return false;
  }
}
