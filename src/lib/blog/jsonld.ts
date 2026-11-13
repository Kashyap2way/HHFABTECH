import { SITE_NAME, SITE_URL } from "../site.ts";
import { authorPath, blogPath, cropUrl } from "./format.ts";
import type { AuthorRef, Post, PostSummary } from "./types.ts";

/**
 * Structured data for the blog, following Google's Article guidelines
 * (https://developers.google.com/search/docs/appearance/structured-data/article):
 * multiple image ratios (16:9, 4:3, 1:1), author as a Person with a profile URL,
 * datePublished / dateModified with timezone, and the business as publisher.
 */

export const BLOG_ID = `${SITE_URL}/blog#blog`;
const PUBLISHER = { "@id": `${SITE_URL}/#business` };

export function personJsonLd(a: AuthorRef) {
  return {
    "@type": "Person",
    name: a.name,
    url: `${SITE_URL}${authorPath(a.slug)}`,
    ...(a.role ? { jobTitle: a.role } : {}),
    ...(a.image ? { image: cropUrl(a.image, 400, 400) } : {}),
    ...(a.sameAs.length ? { sameAs: a.sameAs } : {}),
    worksFor: PUBLISHER,
  };
}

function images(p: PostSummary): string[] | undefined {
  if (!p.image) return undefined;
  return [
    cropUrl(p.image, 1600, 900),
    cropUrl(p.image, 1600, 1200),
    cropUrl(p.image, 1200, 1200),
  ];
}

export function blogPostingJsonLd(p: Post) {
  const url = `${SITE_URL}${blogPath(p.slug)}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: p.title.slice(0, 110),
    description: p.seo.metaDescription ?? p.excerpt,
    image: images(p),
    datePublished: p.publishedAt,
    dateModified: p.updatedAt ?? p.publishedAt,
    author: p.author
      ? personJsonLd(p.author)
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      ...PUBLISHER,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    isPartOf: { "@id": BLOG_ID },
    inLanguage: "en-IN",
    wordCount: p.wordCount,
    timeRequired: `PT${p.readingMinutes}M`,
    ...(p.categories.length
      ? { articleSection: p.categories.map((c) => c.title) }
      : {}),
    ...(p.tags.length ? { keywords: p.tags.join(", ") } : {}),
  };
}

export function faqJsonLd(faq: Post["faq"]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** The blog index: a Blog with its latest posts (allowed on list pages, unlike JobPosting). */
export function blogJsonLd(posts: PostSummary[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID,
    name: `${SITE_NAME} Blog`,
    url: pageUrl,
    inLanguage: "en-IN",
    publisher: PUBLISHER,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}${blogPath(p.slug)}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt ?? p.publishedAt,
      ...(p.image ? { image: cropUrl(p.image, 1200, 675) } : {}),
      ...(p.author
        ? { author: { "@type": "Person", name: p.author.name } }
        : {}),
    })),
  };
}

export function collectionJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  posts: PostSummary[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { "@id": BLOG_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${blogPath(p.slug)}`,
        name: p.title,
      })),
    },
  };
}

export function profilePageJsonLd(a: AuthorRef) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}${authorPath(a.slug)}`,
    mainEntity: {
      ...personJsonLd(a),
      ...(a.bio ? { description: a.bio } : {}),
    },
  };
}
