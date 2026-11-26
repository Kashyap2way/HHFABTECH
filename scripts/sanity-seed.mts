/**
 * Import the legacy openings (src/lib/careers/fallback.ts) into Sanity as DRAFTS.
 * Drafts are not public: review the text in /studio, then press Publish.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=… SANITY_API_WRITE_TOKEN=… pnpm sanity:seed
 *
 * Uses the HTTP mutate API directly, so no extra dependency. Safe to re-run
 * (createOrReplace on fixed draft IDs).
 */
import { FALLBACK_JOBS } from "../src/lib/careers/fallback.ts";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-11-01";

if (!projectId || !token) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (Editor) first.",
  );
  process.exit(1);
}

const mutations = FALLBACK_JOBS.map((j) => ({
  createOrReplace: {
    _id: `drafts.job-${j.slug}`,
    _type: "jobPosting",
    title: j.title,
    slug: { _type: "slug", current: j.slug },
    status: "open",
    department: j.department,
    employmentType: j.employmentType,
    vacancies: j.vacancies,
    datePosted: j.datePosted,
    validThrough: j.validThrough ?? undefined,
    summary: j.summary,
    responsibilities: j.responsibilities,
    requirements: j.requirements,
    benefits: j.benefits,
    workingHours: j.workingHours ?? undefined,
    salary: j.salary
      ? {
          min: j.salary.min ?? undefined,
          max: j.salary.max ?? undefined,
          unit: j.salary.unit,
        }
      : undefined,
    experience: j.experience
      ? {
          min: j.experience.min ?? undefined,
          max: j.experience.max ?? undefined,
        }
      : undefined,
    educationLevel: j.educationLevel ?? undefined,
    qualification: j.qualification ?? undefined,
    experienceInPlaceOfEducation: j.experienceInPlaceOfEducation,
    location: { ...j.location },
  },
}));

const res = await fetch(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}?returnIds=true`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  },
);

const body = await res.text();
if (!res.ok) {
  console.error(`Seed failed (${res.status}): ${body}`);
  process.exit(1);
}
console.log(
  `Imported ${mutations.length} draft job(s). Review and publish them in /studio.`,
);
