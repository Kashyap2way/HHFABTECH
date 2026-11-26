import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { POSTS_TAG } from "@/lib/blog/data";
import { JOBS_TAG, jobTag } from "@/lib/careers/data";
import { jobPath } from "@/lib/careers/format";
import { notifyGoogle } from "@/lib/careers/google-indexing";
import { SITE_URL } from "@/lib/site";

/**
 * Sanity → site webhook. Configure in sanity.io/manage → API → Webhooks:
 *   URL:        https://<site>/api/revalidate
 *   Trigger on: Create, Update, Delete
 *   Filter:     _type in ["jobPosting", "post", "author", "category"]
 *   Projection: {_type, "slug": slug.current, status, validThrough, "operation": delta::operation()}
 *   Secret:     same value as SANITY_REVALIDATE_SECRET
 *
 * Purges the cached careers data, refreshes the sitemap, and (if configured) pings the
 * Google Indexing API so new jobs appear in Google Jobs quickly and closed ones drop out.
 */

type Payload = {
  _type?: string;
  slug?: string | null;
  status?: string | null;
  validThrough?: string | null;
  operation?: "create" | "update" | "delete";
};

const isLive = (p: Payload) =>
  p.status === "open" &&
  (!p.validThrough ||
    Date.parse(`${p.validThrough}T23:59:59+05:30`) >= Date.now());

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  let parsed: Awaited<ReturnType<typeof parseBody<Payload>>>;
  try {
    // `true` waits for Content Lake consistency so the refetch sees the new content.
    parsed = await parseBody<Payload>(request, secret, true);
  } catch {
    return Response.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  if (!parsed.isValidSignature)
    return Response.json(
      { ok: false, error: "invalid_signature" },
      { status: 401 },
    );

  const body = parsed.body ?? {};

  // Blog: any post / author / category change refreshes the blog, feed and sitemap.
  if (
    body._type === "post" ||
    body._type === "author" ||
    body._type === "category"
  ) {
    revalidateTag(POSTS_TAG, { expire: 0 });
    if (body._type === "post" && body.slug)
      revalidateTag(`post:${body.slug}`, { expire: 0 });
    revalidatePath("/sitemap.xml");
    revalidatePath("/blog/rss.xml");
    return Response.json({
      ok: true,
      type: body._type,
      slug: body.slug ?? null,
    });
  }

  if (body._type !== "jobPosting")
    return Response.json({ ok: true, skipped: true });

  // Webhooks come from outside a Server Action, so expire immediately rather than serve stale.
  revalidateTag(JOBS_TAG, { expire: 0 });
  if (body.slug) revalidateTag(jobTag(body.slug), { expire: 0 });
  revalidatePath("/sitemap.xml");

  let indexed: boolean | null = null;
  if (body.slug) {
    const url = `${SITE_URL}${jobPath(body.slug)}`;
    const live = body.operation !== "delete" && isLive(body);
    indexed = await notifyGoogle(url, live ? "URL_UPDATED" : "URL_DELETED");
  }

  return Response.json({ ok: true, slug: body.slug ?? null, indexed });
}
