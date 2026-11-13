import { defineQuery } from "next-sanity";

/**
 * Published = has a slug and a publish date that has passed (so scheduled posts appear on
 * their date; the Next cache life of an hour bounds the delay).
 */
const LIVE = `_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()`;

const IMAGE = (field: string) => `select(defined(${field}.asset) => {
    "url": ${field}.asset->url,
    "alt": coalesce(${field}.alt, ""),
    "width": ${field}.asset->metadata.dimensions.width,
    "height": ${field}.asset->metadata.dimensions.height,
    "lqip": ${field}.asset->metadata.lqip,
    "hotspot": select(defined(${field}.hotspot) => {"x": ${field}.hotspot.x, "y": ${field}.hotspot.y}, null)
  }, null)`;

const AUTHOR = `select(defined(author) => author->{
    name,
    "slug": slug.current,
    "role": coalesce(role, null),
    "bio": coalesce(bio, null),
    "image": ${IMAGE("image")},
    "sameAs": coalesce(sameAs, [])
  }, null)`;

const SUMMARY = `
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  publishedAt,
  "updatedAt": coalesce(updatedAt, null),
  "editedAt": _updatedAt,
  "image": ${IMAGE("mainImage")},
  "author": ${AUTHOR},
  "categories": coalesce(categories[]->{title, "slug": slug.current}, []),
  "readingMinutes": round(length(pt::text(body)) / 5 / 200) + 1,
  "noindex": coalesce(seo.noindex, false)
`;

export const POSTS_PAGE_QUERY = defineQuery(`{
  "posts": *[${LIVE}] | order(publishedAt desc) [$from...$to] { ${SUMMARY} },
  "total": count(*[${LIVE}])
}`);

export const POST_QUERY = defineQuery(`*[${LIVE} && slug.current == $slug][0] {
  ${SUMMARY},
  "body": body[]{
    ...,
    _type == "figure" => {
      _type, _key,
      "url": asset->url,
      "alt": coalesce(alt, ""),
      "caption": coalesce(caption, null),
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      "lqip": asset->metadata.lqip
    }
  },
  "faq": coalesce(faq[]{question, answer}, []),
  "tags": coalesce(tags, []),
  "relatedProducts": coalesce(relatedProducts, []),
  "wordCount": length(string::split(pt::text(body), " ")),
  "seo": {
    "metaTitle": coalesce(seo.metaTitle, null),
    "metaDescription": coalesce(seo.metaDescription, null),
    "canonical": coalesce(seo.canonical, null)
  },
  "related": *[${LIVE} && _id != ^._id && count(categories[@._ref in ^.^.categories[]._ref]) > 0]
    | order(publishedAt desc)[0...3] { ${SUMMARY} }
}`);

export const POST_SLUGS_QUERY = defineQuery(
  `*[${LIVE}] | order(publishedAt desc)[0...200].slug.current`,
);

/** Everything the sitemap needs, in one request. */
export const BLOG_SITEMAP_QUERY = defineQuery(`{
  "posts": *[${LIVE} && coalesce(seo.noindex, false) != true] | order(publishedAt desc) {
    "slug": slug.current, "lastmod": coalesce(updatedAt, _updatedAt)
  },
  "categories": *[_type == "category" && defined(slug.current) && count(*[${LIVE} && references(^._id)]) > 0] {
    "slug": slug.current, "lastmod": _updatedAt
  },
  "authors": *[_type == "author" && defined(slug.current) && count(*[${LIVE} && references(^._id)]) > 0] {
    "slug": slug.current, "lastmod": _updatedAt
  },
  "total": count(*[${LIVE}])
}`);

export const CATEGORIES_QUERY = defineQuery(
  `*[_type == "category" && defined(slug.current) && count(*[${LIVE} && references(^._id)]) > 0]
    | order(title asc) { title, "slug": slug.current, description }`,
);

export const CATEGORY_QUERY =
  defineQuery(`*[_type == "category" && slug.current == $slug][0] {
  title, "slug": slug.current, description,
  "posts": *[${LIVE} && references(^._id)] | order(publishedAt desc)[0...60] { ${SUMMARY} }
}`);

export const AUTHOR_QUERY =
  defineQuery(`*[_type == "author" && slug.current == $slug][0] {
  name, "slug": slug.current, "role": coalesce(role, null), "bio": coalesce(bio, null),
  "image": ${IMAGE("image")}, "sameAs": coalesce(sameAs, []),
  "posts": *[${LIVE} && references(^._id)] | order(publishedAt desc)[0...60] { ${SUMMARY} }
}`);
