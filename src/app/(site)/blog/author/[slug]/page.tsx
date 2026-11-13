import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Image } from "next-sanity/image";
import { Suspense } from "react";
import { BlogSection, PostGrid } from "@/components/blog/BlogListing";
import { Container } from "@/components/sections/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAuthor, getBlogSitemap } from "@/lib/blog/data";
import { authorPath, cropUrl } from "@/lib/blog/format";
import { profilePageJsonLd } from "@/lib/blog/jsonld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/** Author profile (ProfilePage): who writes the articles, for readers and Google's E-E-A-T. */

export async function generateStaticParams() {
  const { authors } = await getBlogSitemap();
  return (authors.length ? authors.map((a) => a.slug) : ["team"]).map(
    (slug) => ({ slug }),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/author/[slug]">): Promise<Metadata> {
  const a = await getAuthor((await params).slug);
  if (!a) return { title: "Author not found", robots: { index: false } };
  const description = (
    a.bio ??
    `Articles by ${a.name}${a.role ? `, ${a.role}` : ""} at ${SITE_NAME}.`
  ).slice(0, 160);
  return {
    title: `${a.name} | Blog author`,
    description,
    alternates: { canonical: authorPath(a.slug) },
    openGraph: {
      type: "profile",
      url: authorPath(a.slug),
      title: `${a.name} | ${SITE_NAME}`,
      description,
      images: a.image
        ? [{ url: cropUrl(a.image, 600, 600), alt: a.name }]
        : undefined,
    },
  };
}

async function AuthorContent({
  params,
}: {
  params: PageProps<"/blog/author/[slug]">["params"];
}) {
  const { slug } = await params;
  const a = await getAuthor(slug);
  if (!a) notFound();
  return (
    <>
      <section className="bg-brand-deep text-white">
        <Container className="flex flex-col gap-6 py-14 sm:flex-row sm:items-center md:py-20">
          {a.image ? (
            <Image
              src={cropUrl(a.image, 320, 320)}
              alt={a.name}
              width={128}
              height={128}
              loading="eager"
              className="size-28 shrink-0 rounded-full border-4 border-white/10 object-cover md:size-32"
            />
          ) : null}
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-gold uppercase">
              Author
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
              {a.name}
            </h1>
            {a.role ? (
              <p className="mt-2 text-lg text-white/80">
                {a.role}, {SITE_NAME}
              </p>
            ) : null}
            {a.bio ? (
              <p className="mt-4 max-w-2xl leading-relaxed text-white/80">
                {a.bio}
              </p>
            ) : null}
            {a.sameAs.length ? (
              <ul className="mt-4 flex flex-wrap gap-3 text-sm">
                {a.sameAs.map((u) => (
                  <li key={u}>
                    <a
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="text-gold underline-offset-4 hover:underline"
                    >
                      {new URL(u).hostname.replace(/^www\./, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </section>
      <BlogSection>
        <h2 className="mb-8 text-2xl font-bold text-brand">
          Articles by {a.name}
        </h2>
        <PostGrid posts={a.posts} list={`author:${a.slug}`} />
      </BlogSection>
      <JsonLd data={profilePageJsonLd(a)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: a.name, path: authorPath(a.slug) },
        ])}
      />
    </>
  );
}

export default function AuthorPage(props: PageProps<"/blog/author/[slug]">) {
  return (
    <Suspense>
      <AuthorContent params={props.params} />
    </Suspense>
  );
}
