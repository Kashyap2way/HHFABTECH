import { getPostsPage } from "@/lib/blog/data";
import { blogPath, cropUrl } from "@/lib/blog/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** RSS 2.0 feed of the latest articles (/blog/rss.xml), linked from the blog's <head>. */

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const { posts } = await getPostsPage(1);
  const items = posts
    .filter((p) => !p.noindex)
    .map((p) => {
      const url = `${SITE_URL}${blogPath(p.slug)}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>${p.author ? `\n      <dc:creator>${esc(p.author.name)}</dc:creator>` : ""}${p.categories.map((c) => `\n      <category>${esc(c.title)}</category>`).join("")}${p.image ? `\n      <enclosure url="${esc(cropUrl(p.image, 1200, 675))}" type="image/jpeg" length="0"/>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(`${SITE_NAME} Blog`)}</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Guides on petroleum, chemical, SS and water tankers and storage tanks.</description>
    <language>en-IN</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
