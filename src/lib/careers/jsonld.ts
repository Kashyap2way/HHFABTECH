import { contact, SITE_NAME, SITE_URL } from "../site.ts";
import { jobPath } from "./format.ts";
import type { Job } from "./types.ts";

/**
 * Google JobPosting structured data for ONE job page (never on the list page:
 * Google treats JobPosting on list pages as a policy violation).
 * Every value here is also visible on the page, as Google requires.
 * Spec: https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Description as HTML using only the tags Google recognises (p, ul, li, br). */
export function jobDescriptionHtml(job: Job): string {
  const list = (title: string, items: string[]) =>
    items.length
      ? `<p>${esc(title)}</p><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
      : "";
  const facts = [
    job.qualification ? `Qualification: ${job.qualification}` : null,
    job.workingHours ? `Working hours: ${job.workingHours}` : null,
  ].filter(Boolean) as string[];
  return [
    `<p>${esc(job.summary)}</p>`,
    list("Responsibilities", job.responsibilities),
    list("Skills and requirements", job.requirements),
    list("Benefits", job.benefits),
    facts.map((f) => `<p>${esc(f)}</p>`).join(""),
  ].join("");
}

export function jobPostingJsonLd(job: Job) {
  const url = `${SITE_URL}${jobPath(job.slug)}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: jobDescriptionHtml(job),
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: job.id,
    },
    datePosted: job.datePosted,
    employmentType:
      job.employmentType.length === 1
        ? job.employmentType[0]
        : job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.location.streetAddress
          ? { streetAddress: job.location.streetAddress }
          : {}),
        addressLocality: job.location.locality,
        addressRegion: job.location.region,
        ...(job.location.postalCode
          ? { postalCode: job.location.postalCode }
          : {}),
        addressCountry: job.location.country,
      },
    },
    totalJobOpenings: job.vacancies,
    directApply: true,
    url,
  };

  // Last day to apply, end of day IST. Omitted when the job never expires.
  if (job.validThrough)
    data.validThrough = `${job.validThrough}T23:59:59+05:30`;

  const s = job.salary;
  if (s && (s.min != null || s.max != null)) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "INR",
      value:
        s.min != null && s.max != null && s.min !== s.max
          ? {
              "@type": "QuantitativeValue",
              minValue: s.min,
              maxValue: s.max,
              unitText: s.unit,
            }
          : {
              "@type": "QuantitativeValue",
              value: s.min ?? s.max,
              unitText: s.unit,
            },
    };
  }

  if (job.educationLevel) {
    data.educationRequirements =
      job.educationLevel === "no requirements"
        ? "no requirements"
        : {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: job.educationLevel,
          };
  }

  const months = job.experience?.min;
  if (months != null) {
    data.experienceRequirements =
      months === 0
        ? "no requirements"
        : {
            "@type": "OccupationalExperienceRequirements",
            monthsOfExperience: months * 12,
          };
  }
  if (
    job.experienceInPlaceOfEducation &&
    data.educationRequirements &&
    data.experienceRequirements
  ) {
    data.experienceInPlaceOfEducation = true;
  }

  return data;
}

/** Contact used on the "no openings" state and in the apply notes. */
export const CAREERS_EMAIL = contact.email;
