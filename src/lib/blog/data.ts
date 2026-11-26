import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readClient } from "@/sanity/client";
import {
  AUTHOR_QUERY,
  BLOG_SITEMAP_QUERY,
  CATEGORIES_QUERY,
  CATEGORY_QUERY,
  POST_QUERY,
  POST_SLUGS_QUERY,
  POSTS_PAGE_QUERY,
} from "./queries";
import type { AuthorRef, Category, Post, PostSummary } from "./types";

/**
 * Blog data, cached with Cache Components and tagged `posts`.
 * The Sanity webhook (/api/revalidate) purges the tag on every post/author/category change;
 * cacheLife "hours" makes scheduled posts appear within an hour of their publish time.
 */
export const POSTS_TAG = "posts";
export const POSTS_PER_PAGE = 12;

export async function getPostsPage(
  page: number,
): Promise<{ posts: PostSummary[]; total: number; pages: number }> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("hours");
  if (!readClient) return { posts: [], total: 0, pages: 0 };
  const from = (page - 1) * POSTS_PER_PAGE;
  const { posts, total } = await readClient.fetch<{
    posts: PostSummary[];
    total: number;
  }>(POSTS_PAGE_QUERY, { from, to: from + POSTS_PER_PAGE });
  return { posts, total, pages: Math.ceil(total / POSTS_PER_PAGE) };
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag(POSTS_TAG, `post:${slug}`);
  cacheLife("hours");
  if (!readClient) return null;
  return readClient.fetch<Post | null>(POST_QUERY, { slug });
}

export async function getPostSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("hours");
  if (!readClient) return [];
  return readClient.fetch<string[]>(POST_SLUGS_QUERY);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("hours");
  if (!readClient) return [];
  return readClient.fetch<Category[]>(CATEGORIES_QUERY);
}

export async function getCategory(
  slug: string,
): Promise<(Category & { posts: PostSummary[] }) | null> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("hours");
  if (!readClient) return null;
  return readClient.fetch(CATEGORY_QUERY, { slug });
}

export async function getAuthor(
  slug: string,
): Promise<(AuthorRef & { posts: PostSummary[] }) | null> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("hours");
  if (!readClient) return null;
  return readClient.fetch(AUTHOR_QUERY, { slug });
}

type Lastmod = { slug: string; lastmod: string };
export async function getBlogSitemap(): Promise<{
  posts: Lastmod[];
  categories: Lastmod[];
  authors: Lastmod[];
  total: number;
}> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife("hours");
  if (!readClient) return { posts: [], categories: [], authors: [], total: 0 };
  return readClient.fetch(BLOG_SITEMAP_QUERY);
}
