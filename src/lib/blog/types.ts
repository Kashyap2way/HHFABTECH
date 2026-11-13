import type { PortableTextBlock } from "next-sanity";

export type SanityImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
  lqip: string | null;
  /** Hotspot focal point (0–1), used for social / schema crops */
  hotspot: { x: number; y: number } | null;
};

export type AuthorRef = {
  name: string;
  slug: string;
  role: string | null;
  bio: string | null;
  image: SanityImage | null;
  sameAs: string[];
};

export type CategoryRef = { title: string; slug: string };

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string | null;
  /** _updatedAt, for the sitemap */
  editedAt: string;
  image: SanityImage | null;
  author: AuthorRef | null;
  categories: CategoryRef[];
  readingMinutes: number;
  noindex: boolean;
};

export type BodyFigure = {
  _type: "figure";
  _key: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
  lqip: string | null;
};

export type BodyCallout = {
  _type: "callout";
  _key: string;
  tone: "tip" | "note" | "warning";
  text: string;
};

export type PostBody = Array<PortableTextBlock | BodyFigure | BodyCallout>;

export type Post = PostSummary & {
  body: PostBody;
  faq: Array<{ question: string; answer: string }>;
  tags: string[];
  relatedProducts: string[];
  wordCount: number;
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    canonical: string | null;
  };
  related: PostSummary[];
};

export type Category = CategoryRef & { description: string };
