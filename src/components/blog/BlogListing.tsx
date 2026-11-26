import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/sections/Container";
import { categoryPath, pagePath } from "@/lib/blog/format";
import type { CategoryRef, PostSummary } from "@/lib/blog/types";
import { cn } from "@/lib/utils";
import { PostCard } from "./PostCard";

/** Category chips. `current` marks the active one with aria-current. */
export function CategoryNav({
  categories,
  current,
}: {
  categories: CategoryRef[];
  current?: string;
}) {
  if (!categories.length) return null;
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors",
      active
        ? "border-brand bg-brand text-white"
        : "border-brand/15 bg-white text-brand hover:border-brand/40",
    );
  return (
    <nav aria-label="Blog categories" className="mb-10">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/blog"
            aria-current={!current ? "page" : undefined}
            className={chip(!current)}
          >
            All articles
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={categoryPath(c.slug)}
              aria-current={current === c.slug ? "page" : undefined}
              className={chip(current === c.slug)}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PostGrid({
  posts,
  list,
  featureFirst = false,
}: {
  posts: PostSummary[];
  list: string;
  featureFirst?: boolean;
}) {
  const [first, ...rest] = posts;
  return (
    <div className="grid gap-6">
      {featureFirst && first ? (
        <PostCard post={first} index={0} list={list} featured priority />
      ) : null}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(featureFirst ? rest : posts).map((p, i) => (
          <li key={p.id}>
            <PostCard
              post={p}
              index={featureFirst ? i + 1 : i}
              list={list}
              priority={!featureFirst && i === 0}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const link =
    "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border border-brand/15 bg-white px-3 text-sm font-semibold text-brand hover:border-brand";
  return (
    <nav aria-label="Blog pages" className="mt-12 flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <li>
            <Link href={pagePath(page - 1)} rel="prev" className={link}>
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
              Newer
            </Link>
          </li>
        ) : null}
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={pagePath(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              className={cn(
                link,
                n === page && "border-brand bg-brand text-white",
              )}
            >
              {n}
            </Link>
          </li>
        ))}
        {page < pages ? (
          <li>
            <Link href={pagePath(page + 1)} rel="next" className={link}>
              Older
              <ChevronRightIcon aria-hidden="true" className="size-4" />
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

export function EmptyBlog() {
  return (
    <div className="rounded-2xl border border-dashed border-brand/20 bg-white p-10 text-center">
      <h2 className="text-xl font-bold text-brand">Articles are on the way</h2>
      <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
        Our team is writing guides on choosing, specifying and maintaining
        tankers. Check back soon, or contact us with a question.
      </p>
      <Link
        href="/contact"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-light"
      >
        Ask our team
      </Link>
    </div>
  );
}

export function BlogSection({ children }: { children: React.ReactNode }) {
  return (
    <section aria-label="Articles" className="bg-[#f8f7fb] py-14 md:py-20">
      <Container>{children}</Container>
    </section>
  );
}
