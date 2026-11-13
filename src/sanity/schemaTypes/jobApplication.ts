import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";

/**
 * A candidate's application, created by /api/careers/apply (never by editors).
 * Candidate fields are read-only in the Studio; the team only updates the pipeline status and notes.
 */
export const APPLICATION_STATUSES = [
  { title: "New", value: "new" },
  { title: "Reviewing", value: "reviewing" },
  { title: "Shortlisted", value: "shortlisted" },
  { title: "Interview", value: "interview" },
  { title: "Hired", value: "hired" },
  { title: "Rejected", value: "rejected" },
] as const;

const ro = { readOnly: true } as const;

export const jobApplication = defineType({
  name: "jobApplication",
  title: "Application",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "candidate", title: "Candidate", default: true },
    { name: "pipeline", title: "Pipeline" },
    { name: "source", title: "Source" },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "pipeline",
      initialValue: "new",
      options: { list: [...APPLICATION_STATUSES], layout: "radio" },
    }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "text",
      rows: 4,
      group: "pipeline",
    }),
    defineField({
      name: "job",
      title: "Job",
      type: "reference",
      to: [{ type: "jobPosting" }],
      weak: true,
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "position",
      title: "Position applied for",
      description: "Saved as text so it survives if the job is deleted.",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "name",
      title: "Full name",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "city",
      title: "Current city",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "qualification",
      title: "Qualification",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "currentCompany",
      title: "Current company",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "expectedSalary",
      title: "Expected salary",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "noticePeriod",
      title: "Notice period",
      type: "string",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "message",
      title: "Cover letter / message",
      type: "text",
      group: "candidate",
      ...ro,
    }),
    defineField({
      name: "resume",
      title: "Résumé",
      type: "file",
      group: "candidate",
      options: { accept: ".pdf,.doc,.docx" },
      ...ro,
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted",
      type: "datetime",
      group: "candidate",
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
      title: "name",
      position: "position",
      status: "status",
      submittedAt: "submittedAt",
    },
    prepare({ title, position, status, submittedAt }) {
      const label =
        APPLICATION_STATUSES.find((s) => s.value === status)?.title ?? "New";
      return {
        title: title ?? "Applicant",
        subtitle: [
          label,
          position,
          submittedAt ? String(submittedAt).slice(0, 10) : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
