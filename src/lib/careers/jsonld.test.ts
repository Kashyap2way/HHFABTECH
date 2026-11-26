import assert from "node:assert/strict";
import { test } from "node:test";
import { FALLBACK_JOBS } from "./fallback.ts";
import { jobDescriptionHtml, jobPostingJsonLd } from "./jsonld.ts";
import type { Job } from "./types.ts";

const job: Job = FALLBACK_JOBS[0];

test("has every property Google requires", () => {
  const d = jobPostingJsonLd(job);
  for (const k of [
    "title",
    "description",
    "datePosted",
    "hiringOrganization",
    "jobLocation",
  ])
    assert.ok(d[k], `missing ${k}`);
  const addr = (d.jobLocation as { address: Record<string, string> }).address;
  assert.equal(addr.addressCountry, "IN");
  assert.equal(d["@type"], "JobPosting");
});

test("validThrough is the end of the last day in IST", () => {
  assert.equal(jobPostingJsonLd(job).validThrough, "2026-12-01T23:59:59+05:30");
  const forever = jobPostingJsonLd({ ...job, validThrough: null });
  assert.equal("validThrough" in forever, false);
});

test("salary range uses min/max with INR and a valid unitText", () => {
  const s = jobPostingJsonLd(job).baseSalary as {
    currency: string;
    value: Record<string, unknown>;
  };
  assert.equal(s.currency, "INR");
  assert.deepEqual(s.value, {
    "@type": "QuantitativeValue",
    minValue: 20000,
    maxValue: 25000,
    unitText: "MONTH",
  });
  assert.equal(
    "baseSalary" in jobPostingJsonLd({ ...job, salary: null }),
    false,
  );
});

test("experience is in months; experienceInPlaceOfEducation needs both requirements", () => {
  const d = jobPostingJsonLd(job);
  assert.deepEqual(d.experienceRequirements, {
    "@type": "OccupationalExperienceRequirements",
    monthsOfExperience: 24,
  });
  assert.equal(d.experienceInPlaceOfEducation, true);
  const noEdu = jobPostingJsonLd({ ...job, educationLevel: null });
  assert.equal("experienceInPlaceOfEducation" in noEdu, false);
});

test("description uses only p/ul/li and escapes HTML", () => {
  const html = jobDescriptionHtml({
    ...job,
    summary: "Weld <b>tanks</b> & more",
  });
  assert.match(html, /^<p>Weld &lt;b&gt;tanks&lt;\/b&gt; &amp; more<\/p>/);
  const tags = new Set(
    html.match(/<\/?([a-z]+)/g)?.map((t) => t.replace(/[</]/g, "")),
  );
  assert.deepEqual([...tags].sort(), ["li", "p", "ul"]);
});

test("multiple employment types become an array", () => {
  const d = jobPostingJsonLd({
    ...job,
    employmentType: ["FULL_TIME", "INTERN"],
  });
  assert.deepEqual(d.employmentType, ["FULL_TIME", "INTERN"]);
  assert.equal(jobPostingJsonLd(job).employmentType, "FULL_TIME");
});
