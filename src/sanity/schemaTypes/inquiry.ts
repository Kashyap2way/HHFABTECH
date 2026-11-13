import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";

/**
 * A sales inquiry from the Contact form, created by /api/contact (never by editors).
 * Customer fields are read-only; the team tracks the deal with status, owner and notes.
 */
export const INQUIRY_STATUSES = [
  { title: "New", value: "new" },
  { title: "Contacted", value: "contacted" },
  { title: "Quotation sent", value: "quoted" },
  { title: "Won", value: "won" },
  { title: "Lost", value: "lost" },
  { title: "Spam", value: "spam" },
] as const;

const ro = { readOnly: true } as const;
const text = (name: string, title: string, group = "request") =>
  defineField({ name, title, type: "string", group, ...ro });

export const inquiry = defineType({
  name: "inquiry",
  title: "Inquiry",
  type: "document",
  icon: EnvelopeIcon,
  groups: [
    { name: "request", title: "Request", default: true },
    { name: "customer", title: "Customer" },
    { name: "pipeline", title: "Follow-up" },
    { name: "source", title: "Source" },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "pipeline",
      initialValue: "new",
      options: { list: [...INQUIRY_STATUSES], layout: "radio" },
    }),
    defineField({
      name: "owner",
      title: "Handled by",
      type: "string",
      group: "pipeline",
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 4,
      group: "pipeline",
    }),

    text("product", "Product"),
    text("capacity", "Capacity"),
    text("compartments", "Compartments"),
    text("material", "Material"),
    text("vehicle", "Vehicle / chassis"),
    defineField({
      name: "requirement",
      title: "Requirement",
      type: "text",
      group: "request",
      ...ro,
    }),
    defineField({
      name: "specification",
      title: "Specification",
      type: "text",
      group: "request",
      ...ro,
    }),
    defineField({
      name: "customization",
      title: "Customisation",
      type: "text",
      group: "request",
      ...ro,
    }),
    defineField({
      name: "attachment",
      title: "Attachment",
      type: "file",
      group: "request",
      ...ro,
    }),
    defineField({
      name: "attachmentNote",
      title: "Attachment note",
      description:
        "Set when a file was too large to store here; it is in the Netlify Forms submission.",
      type: "string",
      group: "request",
      ...ro,
    }),

    text("name", "Name", "customer"),
    text("company", "Company", "customer"),
    text("phone", "Phone", "customer"),
    text("email", "Email", "customer"),
    text("city", "City / State", "customer"),

    defineField({
      name: "submittedAt",
      title: "Submitted",
      type: "datetime",
      group: "source",
      ...ro,
    }),
    defineField({
      name: "attribution",
      title: "Traffic source",
      type: "object",
      group: "source",
      ...ro,
      fields: [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "fbclid",
        "li_fat_id",
        "landing_page",
        "referrer",
        "source_page",
      ].map((name) => defineField({ name, title: name, type: "string" })),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "submittedAtDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      company: "company",
      product: "product",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ name, company, product, status, submittedAt }) {
      const label =
        INQUIRY_STATUSES.find((s) => s.value === status)?.title ?? "New";
      return {
        title: [name, company].filter(Boolean).join(" · ") || "Inquiry",
        subtitle: [
          label,
          product,
          submittedAt ? String(submittedAt).slice(0, 10) : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
