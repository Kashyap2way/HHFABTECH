import type { Metadata } from "next";
import {
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  BlogIndex,
} from "@/components/blog/BlogIndex";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${BLOG_TITLE} | Blog`,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: `${BLOG_TITLE} | ${SITE_NAME} Blog`,
    description: BLOG_DESCRIPTION,
    images: [{ url: "/images/hero/hero2.webp", alt: "HH FABTECH tankers" }],
  },
};

export default function BlogPage() {
  return <BlogIndex page={1} />;
}
