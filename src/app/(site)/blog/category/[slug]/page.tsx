import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  BlogSection,
  CategoryNav,
  EmptyBlog,
  PostGrid,
} from "@/components/blog/BlogListing";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories, getCategory } from "@/lib/blog/data";
import { categoryPath, cropUrl } from "@/lib/blog/format";
import { collectionJsonLd } from "@/lib/blog/jsonld";
import { breadcrumbJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const cats = await getCategories();
  return (cats.length ? cats.map((c) => c.slug) : ["uncategorised"]).map(
    (slug) => ({ slug }),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const cat = await getCategory((await params).slug);
  if (!cat) return { title: "Category not found", robots: { index: false } };
  const og = cat.posts[0]?.image
    ? cropUrl(cat.posts[0].image, 1200, 630)
    : "/images/hero/hero2.webp";
  return {
    title: `${cat.title} | Blog`,
    description: cat.description,
    alternates: { canonical: categoryPath(cat.slug) },
    openGraph: {
      type: "website",
      url: categoryPath(cat.slug),
      title: `${cat.title} | HH FABTECH Blog`,
      description: cat.description,
      images: [{ url: og, alt: cat.title }],
    },
  };
}

async function CategoryContent({
  params,
}: {
  params: PageProps<"/blog/category/[slug]">["params"];
}) {
  const { slug } = await params;
  const [cat, categories] = await Promise.all([
    getCategory(slug),
    getCategories(),
  ]);
  if (!cat) notFound();
  const path = categoryPath(cat.slug);
  return (
    <>
      <PageHero
        eyebrow="Blog category"
        title={cat.title}
        description={cat.description}
        image="/images/hero/hero2.webp"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: cat.title },
        ]}
      />
      <BlogSection>
        <CategoryNav categories={categories} current={cat.slug} />
        {cat.posts.length ? (
          <PostGrid posts={cat.posts} list={`category:${cat.slug}`} />
        ) : (
          <EmptyBlog />
        )}
      </BlogSection>
      <JsonLd
        data={collectionJsonLd({
          name: cat.title,
          description: cat.description,
          path,
          posts: cat.posts,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: cat.title, path },
        ])}
      />
    </>
  );
}

export default function CategoryPage(
  props: PageProps<"/blog/category/[slug]">,
) {
  return (
    <Suspense>
      <CategoryContent params={props.params} />
    </Suspense>
  );
}
