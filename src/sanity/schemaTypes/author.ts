import { UsersIcon } from "@sanity/icons/Users";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Article author. A real name, role and bio support Google's E-E-A-T guidance for articles. */
export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      description: "e.g. “Director, HH FABTECH” or “Production Head”.",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Short bio",
      description: "Experience and expertise, shown under every article.",
      type: "text",
      rows: 3,
      validation: (r) => r.max(400),
    }),
    defineField({
      name: "sameAs",
      title: "Profiles",
      description: "LinkedIn or other public profiles (full URLs).",
      type: "array",
      of: [defineArrayMember({ type: "url" })],
    }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "image" } },
});
