import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

/** Blog category, with its own indexable page at /blog/category/[slug]. */
export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required().max(60),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "title", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      description:
        "Shown on the category page and used as its meta description.",
      type: "text",
      rows: 3,
      validation: (r) => r.required().min(50).max(160),
    }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});
