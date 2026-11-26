import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Article body. Headings start at H2 (the page title is the only H1) so every post has a
 * valid outline for SEO and screen readers. Images require alt text.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullets", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                description:
                  "Use a site path like /petroleum-tanker for internal links, or a full https:// URL.",
                type: "url",
                validation: (r) =>
                  r.required().uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto", "tel"],
                  }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      name: "figure",
      title: "Image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          description:
            "Describe the image for search engines and screen readers.",
          type: "string",
          validation: (r) => r.required().min(5).max(160),
        }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    defineArrayMember({
      name: "callout",
      title: "Callout",
      type: "object",
      icon: BulbOutlineIcon,
      fields: [
        defineField({
          name: "tone",
          title: "Tone",
          type: "string",
          initialValue: "tip",
          options: {
            layout: "radio",
            direction: "horizontal",
            list: [
              { title: "Tip", value: "tip" },
              { title: "Note", value: "note" },
              { title: "Warning", value: "warning" },
            ],
          },
        }),
        defineField({
          name: "text",
          title: "Text",
          type: "text",
          rows: 3,
          validation: (r) => r.required(),
        }),
      ],
      preview: {
        select: { title: "text", subtitle: "tone" },
      },
    }),
  ],
});
