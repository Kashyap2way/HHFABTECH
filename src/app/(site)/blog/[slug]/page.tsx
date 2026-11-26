import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  ListIcon,
  RefreshCwIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Image } from "next-sanity/image";
import { Suspense } from "react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ArticleTracking } from "@/components/blog/ArticleTracking";
import { PostGrid } from "@/components/blog/BlogListing";
import { PortableBody } from "@/components/blog/PortableBody";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { Container } from "@/components/sections/Container";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { Skeleton } from "@/components/ui/skeleton";
import { getPost, getPostSlugs } from "@/lib/blog/data";
import {
  authorPath,
  blogPath,
  categoryPath,
  cropUrl,
  formatPostDate,
  headingsOf,
} from "@/lib/blog/format";
import { blogPostingJsonLd, faqJsonLd } from "@/lib/blog/jsonld";
import type { Post } from "@/lib/blog/types";
import { products } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Blog article. Semantic structure: <article> with <header> (h1, byline, <time>), a table of
 * contents <nav>, the body (h2–h4 only), FAQ, and an author <aside>. BlogPosting, FAQPage and
 * BreadcrumbList JSON-LD mirror what's on the page.
 */

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  // Cache Components needs at least one param; the placeholder simply 404s.
  return (slugs.length ? slugs : ["coming-soon"]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const title = post.seo.metaTitle ?? post.title;
  const description = post.seo.metaDescription ?? post.excerpt;
  const og = post.image ? cropUrl(post.image, 1200, 630) : undefined;
  return {
    title,
    description,
    authors: post.author
      ? [{ name: post.author.name, url: authorPath(post.author.slug) }]
      : undefined,
    keywords: post.tags.length ? post.tags : undefined,
    alternates: { canonical: post.seo.canonical ?? blogPath(post.slug) },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url: blogPath(post.slug),
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: post.author
        ? [`${SITE_URL}${authorPath(post.author.slug)}`]
        : undefined,
      section: post.categories[0]?.title,
      tags: post.tags,
      images: og
        ? [{ url: og, width: 1200, height: 630, alt: post.image?.alt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: og ? [og] : undefined,
    },
  };
}

export default function PostPage(props: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostDetail params={props.params} />
    </Suspense>
  );
}

async function PostDetail({
  params,
}: {
  params: PageProps<"/blog/[slug]">["params"];
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}${blogPath(post.slug)}`;
  const toc = headingsOf(post.body);
  const primary = post.categories[0];
  const relatedProducts = products.filter((p) =>
    post.relatedProducts.includes(p.slug),
  );

  return (
    <>
      <article aria-labelledby="post-title">
        <header className="bg-white pt-10 md:pt-14">
          <Container className="max-w-4xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 text-sm text-muted-foreground"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="hover:text-brand">
                    Blog
                  </Link>
                </li>
                {primary ? (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link
                        href={categoryPath(primary.slug)}
                        className="hover:text-brand"
                      >
                        {primary.title}
                      </Link>
                    </li>
                  </>
                ) : null}
              </ol>
            </nav>
            {post.categories.length ? (
              <ul className="mb-4 flex flex-wrap gap-2">
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
            <h1
              id="post-title"
              className="text-4xl leading-[1.15] font-bold tracking-tight text-balance text-brand md:text-5xl"
            >
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
              {post.excerpt}
            </p>
            <div className="mt-8 flex flex-col gap-5 border-y border-brand/10 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {post.author?.image ? (
                  <Image
                    src={cropUrl(post.author.image, 96, 96)}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full object-cover"
                  />
                ) : null}
                <div className="text-sm">
                  {post.author ? (
                    <p>
                      By{" "}
                      <Link
                        href={authorPath(post.author.slug)}
                        rel="author"
                        className="font-semibold text-brand hover:underline"
                      >
                        {post.author.name}
                      </Link>
                      {post.author.role ? (
                        <span className="text-muted-foreground">
                          , {post.author.role}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon aria-hidden="true" className="size-3.5" />
                      <time dateTime={post.publishedAt}>
                        {formatPostDate(post.publishedAt)}
                      </time>
                    </span>
                    {post.updatedAt ? (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCwIcon
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        Updated{" "}
                        <time dateTime={post.updatedAt}>
                          {formatPostDate(post.updatedAt)}
                        </time>
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon aria-hidden="true" className="size-3.5" />
                      {post.readingMinutes} min read
                    </span>
                  </p>
                </div>
              </div>
              <ShareButtons url={url} title={post.title} slug={post.slug} />
            </div>
          </Container>
          {post.image ? (
            <Container className="mt-10 max-w-6xl">
              <figure>
                <Image
                  src={cropUrl(post.image, 1600, 900)}
                  alt={post.image.alt}
                  width={1600}
                  height={900}
                  sizes="(min-width: 1280px) 1150px, 100vw"
                  loading="eager"
                  fetchPriority="high"
                  placeholder={post.image.lqip ? "blur" : "empty"}
                  blurDataURL={post.image.lqip ?? undefined}
                  className="h-auto w-full rounded-3xl"
                />
              </figure>
            </Container>
          ) : null}
        </header>

        <div className="bg-white pb-16 md:pb-24">
          <Container className="grid max-w-6xl gap-10 pt-10 md:pt-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            {toc.length > 1 ? (
              <TableOfContents items={toc} />
            ) : (
              <div className="hidden lg:block" />
            )}
            <div className="max-w-[760px]">
              <div id="article-body">
                <PortableBody body={post.body} />
              </div>
              <span id="article-end" aria-hidden="true" />

              {post.faq.length ? (
                <section aria-labelledby="faq-title" className="mt-14">
                  <h2
                    id="faq-title"
                    className="mb-5 text-2xl font-bold text-brand"
                  >
                    Frequently asked questions
                  </h2>
                  <div className="divide-y divide-brand/10 rounded-2xl border border-brand/10">
                    {post.faq.map((f) => (
                      <details
                        key={f.question}
                        className="group p-5 [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-brand">
                          <h3 className="text-base">{f.question}</h3>
                          <span
                            aria-hidden="true"
                            className="text-xl leading-none text-gold-dark transition-transform group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="mt-3 leading-relaxed text-foreground/80">
                          {f.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}

              {post.tags.length ? (
                <ul
                  aria-label="Keywords"
                  className="mt-10 flex flex-wrap gap-2"
                >
                  {post.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-brand/15 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}

              {post.author ? <AuthorBox post={post} /> : null}

              {relatedProducts.length ? (
                <aside
                  aria-labelledby="products-title"
                  className="mt-10 rounded-2xl bg-[#f8f7fb] p-6"
                >
                  <h2
                    id="products-title"
                    className="text-lg font-bold text-brand"
                  >
                    Products mentioned in this article
                  </h2>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {relatedProducts.map((p) => (
                      <li key={p.slug}>
                        <TrackedLink
                          href={`/${p.slug}`}
                          event={{
                            name: "select_product",
                            slug: p.slug,
                            product: p.name,
                            list: "blog_article",
                          }}
                          className="group flex items-center justify-between rounded-xl border border-brand/10 bg-white px-4 py-3 font-semibold text-brand hover:border-brand/40"
                        >
                          {p.name}
                          <ArrowRightIcon
                            aria-hidden="true"
                            className="size-4 text-gold-dark transition-transform group-hover:translate-x-0.5"
                          />
                        </TrackedLink>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>
          </Container>
        </div>
      </article>

      {post.related.length ? (
        <section
          aria-labelledby="related-title"
          className="bg-[#f8f7fb] py-16 md:py-20"
        >
          <Container>
            <h2
              id="related-title"
              className="mb-8 text-2xl font-bold text-brand md:text-3xl"
            >
              Keep reading
            </h2>
            <PostGrid posts={post.related} list="related_articles" />
          </Container>
        </section>
      ) : null}

      <CtaBand
        location="blog_article"
        title="Planning a tanker or storage tank?"
        text="Share your capacity, product and chassis. Our engineers will recommend a specification and send a quotation."
      />

      {post.noindex ? null : <JsonLd data={blogPostingJsonLd(post)} />}
      {post.faq.length && !post.noindex ? (
        <JsonLd data={faqJsonLd(post.faq)} />
      ) : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          ...(primary
            ? [{ name: primary.title, path: categoryPath(primary.slug) }]
            : []),
          { name: post.title, path: blogPath(post.slug) },
        ])}
      />
      <ArticleTracking
        readingMinutes={post.readingMinutes}
        view={{
          name: "view_article",
          slug: post.slug,
          title: post.title,
          category: primary?.title,
          author: post.author?.name,
        }}
      />
    </>
  );
}

function TableOfContents({ items }: { items: ReturnType<typeof headingsOf> }) {
  const list = (
    <ol className="grid gap-1 text-sm">
      {items.map((h) => (
        <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${h.id}`}
            className="block rounded-md px-2 py-1.5 text-foreground/70 hover:bg-brand/[0.05] hover:text-brand"
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <nav
      aria-label="Table of contents"
      data-section="Table of contents"
      className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start"
    >
      <details className="rounded-2xl border border-brand/10 p-4 lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 font-semibold text-brand">
          <ListIcon aria-hidden="true" className="size-4" /> In this article
        </summary>
        <div className="mt-3">{list}</div>
      </details>
      <div className="hidden lg:block">
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-gold-dark uppercase">
          In this article
        </p>
        {list}
      </div>
    </nav>
  );
}

function AuthorBox({ post }: { post: Post }) {
  const a = post.author;
  if (!a) return null;
  return (
    <aside
      aria-label="About the author"
      className="mt-12 flex gap-5 rounded-2xl border border-brand/10 p-6"
    >
      {a.image ? (
        <Image
          src={cropUrl(a.image, 160, 160)}
          alt={a.name}
          width={80}
          height={80}
          className="size-16 shrink-0 rounded-full object-cover md:size-20"
        />
      ) : null}
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-gold-dark uppercase">
          Written by
        </p>
        <p className="mt-1 text-lg font-bold text-brand">
          <Link
            href={authorPath(a.slug)}
            rel="author"
            className="hover:underline"
          >
            {a.name}
          </Link>
        </p>
        {a.role ? (
          <p className="text-sm text-muted-foreground">
            {a.role}, {SITE_NAME}
          </p>
        ) : null}
        {a.bio ? (
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">
            {a.bio}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function PostSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading article…</span>
      <Container className="max-w-4xl py-14">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-2/3" />
        <Skeleton className="mt-6 h-6 w-full" />
        <Skeleton className="mt-10 aspect-[16/9] w-full rounded-3xl" />
      </Container>
    </div>
  );
}
