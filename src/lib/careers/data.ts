import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readClient } from "@/sanity/client";
import { FALLBACK_JOBS } from "./fallback";
import { JOB_BY_SLUG_QUERY, JOB_SLUGS_QUERY, OPEN_JOBS_QUERY } from "./queries";
import type { Job } from "./types";

/**
 * Careers data, cached with Cache Components.
 *  - Tag `jobs`: purged by the Sanity publish webhook (/api/revalidate), so edits go live in seconds.
 *  - cacheLife "hours": bounds how long an expired job (past its last date) can stay listed.
 *
 * Without Sanity, sample jobs are served only when CAREERS_USE_SAMPLE_JOBS=true, so
 * placeholder openings can never reach Google Jobs by accident.
 */
export const JOBS_TAG = "jobs";
export const jobTag = (slug: string) => `job:${slug}`;

const sampleEnabled = () =>
  !readClient && process.env.CAREERS_USE_SAMPLE_JOBS === "true";

/** Same rule as the GROQ query: open, and the last date (end of day IST) not passed. */
function isLive(job: Job, now: number): boolean {
  if (job.status !== "open") return false;
  if (!job.validThrough) return true;
  return Date.parse(`${job.validThrough}T23:59:59+05:30`) >= now;
}

function sample(): Job[] {
  const now = Date.now();
  return FALLBACK_JOBS.map((j) => ({
    ...j,
    status: isLive(j, now) ? "open" : "closed",
  }));
}

export async function getOpenJobs(): Promise<Job[]> {
  "use cache";
  cacheTag(JOBS_TAG);
  cacheLife("hours");
  if (readClient) return readClient.fetch(OPEN_JOBS_QUERY);
  return sampleEnabled() ? sample().filter((j) => j.status === "open") : [];
}

export async function getJob(slug: string): Promise<Job | null> {
  "use cache";
  cacheTag(JOBS_TAG, jobTag(slug));
  cacheLife("hours");
  if (readClient) return readClient.fetch(JOB_BY_SLUG_QUERY, { slug });
  return sampleEnabled()
    ? (sample().find((j) => j.slug === slug) ?? null)
    : null;
}

export async function getJobSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(JOBS_TAG);
  cacheLife("hours");
  if (readClient) return readClient.fetch(JOB_SLUGS_QUERY);
  return sampleEnabled() ? FALLBACK_JOBS.map((j) => j.slug) : [];
}
