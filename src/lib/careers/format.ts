import type { Job } from "./types.ts";

/** Display helpers shared by the careers pages and the JSON-LD (so markup always matches the page). */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const UNIT_LABEL: Record<string, string> = {
  MONTH: "per month",
  YEAR: "per year",
  DAY: "per day",
  HOUR: "per hour",
};

export const EMPLOYMENT_LABEL: Record<string, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACTOR: "Contract",
  TEMPORARY: "Temporary",
  INTERN: "Internship",
  PER_DIEM: "Per day",
  OTHER: "Other",
};

export function formatSalary(job: Job): string | null {
  const s = job.salary;
  if (!s || (s.min == null && s.max == null)) return null;
  const unit = UNIT_LABEL[s.unit] ?? "";
  if (s.min != null && s.max != null && s.min !== s.max)
    return `${inr.format(s.min)} – ${inr.format(s.max)} ${unit}`.trim();
  return `${inr.format((s.min ?? s.max) as number)} ${unit}`.trim();
}

export function formatExperience(job: Job): string | null {
  const e = job.experience;
  if (!e || (e.min == null && e.max == null)) return null;
  const { min, max } = e;
  if (!min && !max) return "Freshers welcome";
  if (min != null && max != null && max > min) return `${min}–${max} years`;
  const n = (min ?? max) as number;
  return n === 0 ? "Freshers welcome" : `${n}+ ${n === 1 ? "year" : "years"}`;
}

export function formatEmployment(job: Job): string {
  return job.employmentType.map((t) => EMPLOYMENT_LABEL[t] ?? t).join(" / ");
}

export function formatLocation(job: Job): string {
  return `${job.location.locality}, ${job.location.region}`;
}

/** "12 Nov 2026" from YYYY-MM-DD, without timezone drift. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(y, m - 1, d));
}

export const jobPath = (slug: string) => `/career/${slug}`;
