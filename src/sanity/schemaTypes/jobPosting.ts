import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A job opening. Fields map 1:1 to Google's JobPosting structured data
 * (https://developers.google.com/search/docs/appearance/structured-data/job-posting),
 * so whatever the team publishes here is eligible for Google Jobs.
 */

export const DEPARTMENTS = [
  "Production",
  "Fabrication & Welding",
  "Quality Control",
  "Design & Engineering",
  "Maintenance",
  "Stores & Purchase",
  "Sales & Marketing",
  "Accounts & Admin",
  "Logistics",
  "Other",
] as const;

/** Google `employmentType` values (case-sensitive). */
export const EMPLOYMENT_TYPES = [
  { title: "Full time", value: "FULL_TIME" },
  { title: "Part time", value: "PART_TIME" },
  { title: "Contract", value: "CONTRACTOR" },
  { title: "Temporary", value: "TEMPORARY" },
  { title: "Internship / Apprentice", value: "INTERN" },
  { title: "Per day", value: "PER_DIEM" },
  { title: "Other", value: "OTHER" },
] as const;

/** Google `credentialCategory` values with Indian equivalents in the labels. */
export const EDUCATION_LEVELS = [
  { title: "No formal requirement", value: "no requirements" },
  { title: "10th / 12th pass (high school)", value: "high school" },
  {
    title: "ITI / trade certificate",
    value: "professional certificate",
  },
  { title: "Diploma", value: "associate degree" },
  { title: "Graduate (B.E. / B.Tech / B.Com …)", value: "bachelor degree" },
  { title: "Post-graduate", value: "postgraduate degree" },
] as const;

export const SALARY_UNITS = [
  { title: "per month", value: "MONTH" },
  { title: "per year", value: "YEAR" },
  { title: "per day", value: "DAY" },
  { title: "per hour", value: "HOUR" },
] as const;

const textList = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
    group: "details",
  });

export const jobPosting = defineType({
  name: "jobPosting",
  title: "Job opening",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "details", title: "Description" },
    { name: "pay", title: "Salary & requirements" },
    { name: "location", title: "Location" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Job title",
      description:
        "Only the job title, e.g. “Production Supervisor”. No salary, location or company name (Google rejects those).",
      type: "string",
      group: "basics",
      validation: (r) => r.required().min(3).max(80),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "basics",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      description:
        "Closed jobs disappear from the careers page and from Google Jobs right away.",
      type: "string",
      group: "basics",
      initialValue: "open",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Open", value: "open" },
          { title: "Closed", value: "closed" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      group: "basics",
      options: { list: [...DEPARTMENTS] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "employmentType",
      title: "Employment type",
      type: "array",
      group: "basics",
      of: [defineArrayMember({ type: "string" })],
      options: { list: [...EMPLOYMENT_TYPES], layout: "grid" },
      initialValue: ["FULL_TIME"],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "vacancies",
      title: "Number of openings",
      type: "number",
      group: "basics",
      initialValue: 1,
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: "datePosted",
      title: "Date posted",
      type: "date",
      group: "basics",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "validThrough",
      title: "Last date to apply",
      description:
        "The job closes automatically at the end of this day (IST). Leave empty only if it never expires.",
      type: "date",
      group: "basics",
      validation: (r) =>
        r.custom((value, ctx) => {
          const posted = (ctx.document as { datePosted?: string } | undefined)
            ?.datePosted;
          if (value && posted && value < posted)
            return "Must be on or after the date posted.";
          return true;
        }),
    }),

    defineField({
      name: "summary",
      title: "Short summary",
      description:
        "One or two sentences shown on the careers list and in search results.",
      type: "text",
      rows: 3,
      group: "details",
      validation: (r) => r.required().min(40).max(300),
    }),
    textList(
      "responsibilities",
      "Responsibilities",
      "One duty per line. Google needs a complete description, so be specific.",
    ),
    textList(
      "requirements",
      "Skills & requirements",
      "One requirement per line.",
    ),
    textList("benefits", "Benefits", "Optional. One benefit per line."),
    defineField({
      name: "workingHours",
      title: "Working hours",
      type: "string",
      group: "details",
      initialValue: "Monday to Saturday, 9:00 AM – 7:00 PM",
    }),

    defineField({
      name: "salary",
      title: "Salary",
      type: "object",
      group: "pay",
      description:
        "Only the real salary offered by HH FABTECH. Leave the amounts empty to hide salary.",
      fields: [
        defineField({ name: "min", title: "Minimum (₹)", type: "number" }),
        defineField({
          name: "max",
          title: "Maximum (₹)",
          type: "number",
          validation: (r) =>
            r.custom((value, ctx) => {
              const min = (ctx.parent as { min?: number } | undefined)?.min;
              if (value !== undefined && min !== undefined && value < min)
                return "Must be at least the minimum.";
              return true;
            }),
        }),
        defineField({
          name: "unit",
          title: "Paid",
          type: "string",
          initialValue: "MONTH",
          options: { list: [...SALARY_UNITS], layout: "radio" },
        }),
      ],
    }),
    defineField({
      name: "experience",
      title: "Experience (years)",
      type: "object",
      group: "pay",
      options: { columns: 2 },
      fields: [
        defineField({
          name: "min",
          title: "Minimum",
          type: "number",
          initialValue: 0,
          validation: (r) => r.min(0),
        }),
        defineField({
          name: "max",
          title: "Maximum",
          type: "number",
          validation: (r) => r.min(0),
        }),
      ],
    }),
    defineField({
      name: "educationLevel",
      title: "Minimum education",
      type: "string",
      group: "pay",
      options: { list: [...EDUCATION_LEVELS] },
    }),
    defineField({
      name: "qualification",
      title: "Qualification (as shown on the page)",
      description: "e.g. “Diploma Mechanical / ITI Fitter / 12th pass”.",
      type: "string",
      group: "pay",
    }),
    defineField({
      name: "experienceInPlaceOfEducation",
      title: "Accept experience instead of the qualification",
      type: "boolean",
      group: "pay",
      initialValue: false,
    }),

    defineField({
      name: "location",
      title: "Work location",
      type: "object",
      group: "location",
      description: "Defaults to the Sanathal factory.",
      fields: [
        defineField({
          name: "streetAddress",
          title: "Street address",
          type: "string",
          initialValue:
            "Near Sanathal Circle Road, Fatewadi Canal, Sanathal, Sanand",
        }),
        defineField({
          name: "locality",
          title: "City",
          type: "string",
          initialValue: "Ahmedabad",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "region",
          title: "State",
          type: "string",
          initialValue: "Gujarat",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "postalCode",
          title: "PIN code",
          type: "string",
          initialValue: "382210",
        }),
        defineField({
          name: "country",
          title: "Country code",
          type: "string",
          initialValue: "IN",
          readOnly: true,
        }),
      ],
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "datePostedDesc",
      by: [{ field: "datePosted", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      department: "department",
      status: "status",
      validThrough: "validThrough",
    },
    prepare({ title, department, status, validThrough }) {
      const closed = status !== "open";
      return {
        title,
        subtitle: [
          closed ? "Closed" : "Open",
          department,
          validThrough ? `apply by ${validThrough}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
