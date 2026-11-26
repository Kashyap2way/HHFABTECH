import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";
import { products } from "../../lib/products";

/**
 * Blog post. Fields map to Google's Article (BlogPosting) structured data
 * (https://developers.google.com/search/docs/appearance/structured-data/article):
 * headline, images, author, datePublished, dateModified. SEO fields override the defaults.
 */
export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Details" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "The H1 and headline. Aim for 40–70 characters.",
      type: "string",
      group: "content",
      validation: (r) => [
        r.required().min(10).max(110),
        r.max(70).warning("Titles over 70 characters are cut off in Google."),
      ],
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 80 },
      validation: (r) =>
        r
          .required()
          .custom((slug) =>
            slug?.current &&
            ["page", "category", "author", "rss.xml"].includes(slug.current)
              ? "This URL is reserved by the blog. Choose another."
              : true,
          ),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description:
        "1–2 sentences for the blog list and the default meta description (120–160 characters is ideal).",
      type: "text",
      rows: 3,
      group: "content",
      validation: (r) => [
        r.required().min(50).max(220),
        r
          .max(160)
          .warning("Over 160 characters gets truncated in search results."),
      ],
    }),
    defineField({
      name: "mainImage",
      title: "Cover image",
      description:
        "At least 1200 px wide. Used for the page, social shares and Google.",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (r) => r.required().min(5).max(160),
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      description:
        "Optional questions shown at the end (also marked up as FAQPage).",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          fields: [
            defineField({
              name: "question",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "answer",
              type: "text",
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),

    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "meta",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "meta",
      of: [
        defineArrayMember({ type: "reference", to: [{ type: "category" }] }),
      ],
      validation: (r) => r.required().min(1).max(3),
    }),
    defineField({
      name: "tags",
      title: "Keywords",
      type: "array",
      group: "meta",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "relatedProducts",
      title: "Related products",
      description:
        "Shown as links after the article (internal linking helps SEO).",
      type: "array",
      group: "meta",
      of: [defineArrayMember({ type: "string" })],
      options: {
        list: products.map((p) => ({ title: p.name, value: p.slug })),
      },
    }),
    defineField({
      name: "publishedAt",
      title: "Published",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Last meaningful update",
      description:
        "Set when the content changes substantially. Shown as “Updated” and sent to Google as dateModified.",
      type: "datetime",
      group: "meta",
    }),

    defineField({
      name: "seo",
      title: "SEO overrides",
      type: "object",
      group: "seo",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta title",
          description:
            "Defaults to the title. “| HH FABTECH” is added automatically.",
          type: "string",
          validation: (r) => r.max(60).warning("Keep under 60 characters."),
        }),
        defineField({
          name: "metaDescription",
          title: "Meta description",
          description: "Defaults to the excerpt.",
          type: "text",
          rows: 3,
          validation: (r) => r.max(160).warning("Keep under 160 characters."),
        }),
        defineField({
          name: "canonical",
          title: "Canonical URL",
          description: "Only if this article was first published elsewhere.",
          type: "url",
        }),
        defineField({
          name: "noindex",
          title: "Hide from search engines",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      date: "publishedAt",
      media: "mainImage",
    },
    prepare({ title, author, date, media }) {
      return {
        title,
        subtitle: [author, date ? String(date).slice(0, 10) : null]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
