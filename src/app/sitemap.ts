import type { MetadataRoute } from "next";
import { getBlogSitemap, POSTS_PER_PAGE } from "@/lib/blog/data";
import {
  authorPath,
  blogPath,
  categoryPath,
  pagePath,
} from "@/lib/blog/format";
import { getOpenJobs } from "@/lib/careers/data";
import { jobPath } from "@/lib/careers/format";
import { products } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

// Fixed date: the sitemap is generated at build and reading the clock is not allowed while prerendering.
const LAST_UPDATED = "2026-11-12";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Open jobs only; lastmod is the real edit time so Google recrawls changed postings.
  const [jobs, blog] = await Promise.all([getOpenJobs(), getBlogSitemap()]);
  const blogPages = Math.ceil(blog.total / POSTS_PER_PAGE);
  const page = (
    path: string,
    priority: number,
    changeFrequency: "monthly" | "yearly",
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LAST_UPDATED,
    changeFrequency,
    priority,
  });

  return [
    page("", 1, "monthly"),
    page("/products", 0.9, "monthly"),
    ...products.map((p) => page(`/${p.slug}`, 0.8, "monthly")),
    page("/calculator", 0.7, "monthly"),
    page("/about", 0.7, "yearly"),
    page("/contact", 0.7, "yearly"),
    page("/career", 0.6, "monthly"),
    {
      url: `${SITE_URL}/blog`,
      lastModified: blog.posts[0]?.lastmod ?? LAST_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...Array.from({ length: Math.max(0, blogPages - 1) }, (_, i) => ({
      url: `${SITE_URL}${pagePath(i + 2)}`,
      changeFrequency: "weekly" as const,
      priority: 0.3,
    })),
    ...blog.posts.map((p) => ({
      url: `${SITE_URL}${blogPath(p.slug)}`,
      lastModified: p.lastmod,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...blog.categories.map((c) => ({
      url: `${SITE_URL}${categoryPath(c.slug)}`,
      lastModified: c.lastmod,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...blog.authors.map((a) => ({
      url: `${SITE_URL}${authorPath(a.slug)}`,
      lastModified: a.lastmod,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
    ...jobs.map((j) => ({
      url: `${SITE_URL}${jobPath(j.slug)}`,
      lastModified: j.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
