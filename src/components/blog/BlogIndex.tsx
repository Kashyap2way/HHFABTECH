import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getPostsPage } from "@/lib/blog/data";
import { pagePath } from "@/lib/blog/format";
import { blogJsonLd } from "@/lib/blog/jsonld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  BlogSection,
  CategoryNav,
  EmptyBlog,
  Pagination,
  PostGrid,
} from "./BlogListing";

export const BLOG_TITLE = "Tanker & Storage Tank Guides";
export const BLOG_DESCRIPTION =
  "Practical guides from HH FABTECH on choosing, specifying, certifying and maintaining petroleum, chemical, SS and water tankers.";

/** Blog index page N (1 = /blog). Page 1 features the newest post. */
export async function BlogIndex({ page }: { page: number }) {
  const [{ posts, pages }, categories] = await Promise.all([
    getPostsPage(page),
    getCategories(),
  ]);
  if (page > 1 && page > pages) notFound();
  const path = pagePath(page);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={page > 1 ? `${BLOG_TITLE} – page ${page}` : BLOG_TITLE}
        description={BLOG_DESCRIPTION}
        image="/images/hero/hero2.webp"
        breadcrumbs={[
          { name: "Home", href: "/" },
          page > 1 ? { name: "Blog", href: "/blog" } : { name: "Blog" },
          ...(page > 1 ? [{ name: `Page ${page}` }] : []),
        ]}
      />
      <BlogSection>
        <CategoryNav categories={categories} />
        {posts.length ? (
          <PostGrid posts={posts} list="blog" featureFirst={page === 1} />
        ) : (
          <EmptyBlog />
        )}
        <Pagination page={page} pages={pages} />
      </BlogSection>
      <JsonLd data={blogJsonLd(posts, `${SITE_URL}${path}`)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          ...(page > 1 ? [{ name: `Page ${page}`, path }] : []),
        ])}
      />
    </>
  );
}
