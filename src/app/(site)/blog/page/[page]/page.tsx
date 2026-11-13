import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import {
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  BlogIndex,
} from "@/components/blog/BlogIndex";
import { getPostsPage } from "@/lib/blog/data";
import { pagePath } from "@/lib/blog/format";

/** /blog/page/2 … : each page is self-canonical (Google indexes paginated lists individually). */

const parse = (raw: string) => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function generateStaticParams() {
  const { pages } = await getPostsPage(1);
  const list = Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
  // Cache Components needs at least one param; an out-of-range page 404s.
  return list.length ? list : [{ page: "2" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/page/[page]">): Promise<Metadata> {
  const n = parse((await params).page) ?? 0;
  return {
    title: `${BLOG_TITLE} – page ${n} | Blog`,
    description: BLOG_DESCRIPTION,
    alternates: { canonical: pagePath(n) },
  };
}

async function Paged({
  params,
}: {
  params: PageProps<"/blog/page/[page]">["params"];
}) {
  const n = parse((await params).page);
  if (!n) notFound();
  if (n === 1) permanentRedirect("/blog");
  return <BlogIndex page={n} />;
}

export default function BlogPagedPage(props: PageProps<"/blog/page/[page]">) {
  return (
    <Suspense>
      <Paged params={props.params} />
    </Suspense>
  );
}
