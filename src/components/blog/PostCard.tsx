import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { Image } from "next-sanity/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import {
  blogPath,
  categoryPath,
  cropUrl,
  formatPostDate,
} from "@/lib/blog/format";
import type { PostSummary } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

/** Post teaser. The title link is stretched over the card; category links stay clickable on top. */
export function PostCard({
  post,
  index,
  list,
  headingLevel = "h2",
  featured = false,
  priority = false,
}: {
  post: PostSummary;
  index: number;
  list: string;
  headingLevel?: "h2" | "h3";
  featured?: boolean;
  /** Eager-load the first image above the fold (LCP). */
  priority?: boolean;
}) {
  const H = headingLevel;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white transition-all duration-300 focus-within:ring-3 focus-within:ring-ring/50 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-36px_rgb(67_35_111/0.5)]",
        featured && "lg:grid lg:grid-cols-[1.15fr_1fr]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden bg-brand/[0.05]",
          featured && "lg:aspect-auto lg:min-h-[340px]",
        )}
      >
        {post.image ? (
          <Image
            src={cropUrl(post.image, 1600, 900)}
            alt={post.image.alt}
            fill
            sizes={
              featured
                ? "(min-width: 1024px) 720px, 100vw"
                : "(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
            }
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            placeholder={post.image.lqip ? "blur" : "empty"}
            blurDataURL={post.image.lqip ?? undefined}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col p-6", featured && "lg:p-10")}>
        {post.categories.length ? (
          <ul className="relative z-10 mb-3 flex flex-wrap gap-2">
            {post.categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={categoryPath(c.slug)}
                  className="rounded-full bg-brand/[0.07] px-3 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <H
          className={cn(
            "font-bold text-balance text-brand",
            featured ? "text-2xl md:text-3xl" : "text-xl",
          )}
        >
          <TrackedLink
            href={blogPath(post.slug)}
            event={{
              name: "behavior",
              eventName: "select_content",
              params: {
                content_type: "article",
                item_id: post.slug,
                item_list_name: list,
                index,
              },
            }}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </TrackedLink>
        </H>
        <p
          className={cn(
            "mt-3 text-[15px] leading-relaxed text-muted-foreground",
            featured ? "line-clamp-4" : "line-clamp-3",
          )}
        >
          {post.excerpt}
        </p>
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 text-sm text-muted-foreground">
          {post.author ? (
            <span className="font-medium text-foreground/80">
              {post.author.name}
            </span>
          ) : null}
          <time dateTime={post.publishedAt}>
            {formatPostDate(post.publishedAt)}
          </time>
          <span className="inline-flex items-center gap-1">
            <ClockIcon aria-hidden="true" className="size-3.5" />
            {post.readingMinutes} min read
          </span>
        </p>
      </div>
    </article>
  );
}
