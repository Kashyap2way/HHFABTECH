import type { PortableTextBlock } from "next-sanity";
import type { PostBody, SanityImage } from "./types.ts";

export const blogPath = (slug: string) => `/blog/${slug}`;
export const categoryPath = (slug: string) => `/blog/category/${slug}`;
export const authorPath = (slug: string) => `/blog/author/${slug}`;
export const pagePath = (page: number) =>
  page <= 1 ? "/blog" : `/blog/page/${page}`;

/** Sanity CDN crop around the editor's hotspot (focal point). */
export function cropUrl(img: SanityImage, w: number, h: number): string {
  const u = new URL(img.url);
  u.searchParams.set("w", String(w));
  u.searchParams.set("h", String(h));
  u.searchParams.set("fit", "crop");
  if (img.hotspot) {
    u.searchParams.set("crop", "focalpoint");
    u.searchParams.set("fp-x", img.hotspot.x.toFixed(3));
    u.searchParams.set("fp-y", img.hotspot.y.toFixed(3));
  }
  u.searchParams.set("auto", "format");
  return u.toString();
}

/** "12 Nov 2026", in IST so the date matches what editors picked. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

const isBlock = (b: PostBody[number]): b is PortableTextBlock =>
  b._type === "block";

export const blockText = (b: PortableTextBlock) =>
  (b.children ?? []).map((c) => ("text" in c ? String(c.text) : "")).join("");

/** URL-safe, readable heading ids. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

export type TocItem = { id: string; text: string; level: 2 | 3; key: string };

/**
 * Headings (h2/h3) with unique ids, keyed by block _key so the renderer and the
 * table of contents always agree.
 */
export function headingsOf(body: PostBody): TocItem[] {
  const used = new Map<string, number>();
  const out: TocItem[] = [];
  for (const b of body) {
    if (!isBlock(b) || (b.style !== "h2" && b.style !== "h3")) continue;
    const text = blockText(b).trim();
    if (!text) continue;
    const base = slugify(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    out.push({
      id: n ? `${base}-${n + 1}` : base,
      text,
      level: b.style === "h2" ? 2 : 3,
      key: b._key ?? base,
    });
  }
  return out;
}
