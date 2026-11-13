import assert from "node:assert/strict";
import { test } from "node:test";
import { cropUrl, headingsOf, slugify } from "./format.ts";
import { blogPostingJsonLd } from "./jsonld.ts";
import type { Post, PostBody } from "./types.ts";

const img = {
  url: "https://cdn.sanity.io/images/p/d/abc-1600x900.jpg",
  alt: "Tanker",
  width: 1600,
  height: 900,
  lqip: null,
  hotspot: { x: 0.25, y: 0.6 },
};

const block = (key: string, style: string, text: string) => ({
  _type: "block",
  _key: key,
  style,
  children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
  markDefs: [],
});

const post: Post = {
  id: "p1",
  slug: "how-to-choose-a-diesel-tanker",
  title: "How to choose a diesel tanker",
  excerpt:
    "Capacity, compartments and chassis: what to decide before you order.",
  publishedAt: "2026-11-01T04:30:00Z",
  updatedAt: null,
  editedAt: "2026-11-02T00:00:00Z",
  image: img,
  author: {
    name: "Devarsh Patel",
    slug: "devarsh-patel",
    role: "Director",
    bio: null,
    image: null,
    sameAs: ["https://www.linkedin.com/in/example"],
  },
  categories: [{ title: "Buying guides", slug: "buying-guides" }],
  readingMinutes: 4,
  noindex: false,
  body: [],
  faq: [],
  tags: ["diesel tanker", "capacity"],
  relatedProducts: [],
  wordCount: 820,
  seo: { metaTitle: null, metaDescription: null, canonical: null },
  related: [],
};

test("slugify makes readable ids", () => {
  assert.equal(
    slugify("Capacity & compartments (KL)"),
    "capacity-compartments-kl",
  );
  assert.equal(slugify("Café"), "cafe");
  assert.equal(slugify("!!!"), "section");
});

test("headings get unique ids and only h2/h3 are listed", () => {
  const body = [
    block("a", "h2", "Capacity"),
    block("b", "normal", "text"),
    block("c", "h3", "Capacity"),
    block("d", "h4", "Ignored"),
  ] as unknown as PostBody;
  assert.deepEqual(
    headingsOf(body).map((h) => [h.id, h.level, h.key]),
    [
      ["capacity", 2, "a"],
      ["capacity-2", 3, "c"],
    ],
  );
});

test("cropUrl crops around the hotspot", () => {
  const u = new URL(cropUrl(img, 1200, 630));
  assert.equal(u.searchParams.get("w"), "1200");
  assert.equal(u.searchParams.get("h"), "630");
  assert.equal(u.searchParams.get("crop"), "focalpoint");
  assert.equal(u.searchParams.get("fp-x"), "0.250");
});

test("BlogPosting has the properties Google recommends", () => {
  const d = blogPostingJsonLd(post);
  assert.equal(d["@type"], "BlogPosting");
  assert.equal(d.headline, post.title);
  assert.equal((d.image as string[]).length, 3);
  assert.equal(d.datePublished, post.publishedAt);
  assert.equal(d.dateModified, post.publishedAt);
  const author = d.author as Record<string, unknown>;
  assert.equal(author["@type"], "Person");
  assert.match(String(author.url), /\/blog\/author\/devarsh-patel$/);
  assert.deepEqual(d.articleSection, ["Buying guides"]);
  assert.equal(d.keywords, "diesel tanker, capacity");
  assert.equal(
    blogPostingJsonLd({ ...post, updatedAt: "2026-11-10T00:00:00Z" })
      .dateModified,
    "2026-11-10T00:00:00Z",
  );
});
