import type { Job } from "./types.ts";

/**
 * Openings carried over from the legacy site's jobs.json. Used only until Sanity is
 * configured (NEXT_PUBLIC_SANITY_PROJECT_ID), and as the seed for `pnpm sanity:seed`.
 */
const location = {
  streetAddress: "Near Sanathal Circle Road, Fatewadi Canal, Sanathal, Sanand",
  locality: "Ahmedabad",
  region: "Gujarat",
  postalCode: "382210",
  country: "IN",
};

export const FALLBACK_JOBS: Job[] = [
  {
    id: "fallback-production-supervisor",
    slug: "production-supervisor",
    title: "Production Supervisor",
    status: "open",
    department: "Production",
    employmentType: ["FULL_TIME"],
    vacancies: 1,
    datePosted: "2026-08-01",
    validThrough: "2026-12-01",
    summary:
      "Lead a shift on our tanker fabrication floor in Sanathal, keeping welding, assembly and finishing on schedule and to drawing.",
    responsibilities: [
      "Plan and allocate daily work for fabrication, welding and assembly teams.",
      "Read fabrication drawings and make sure every tank is built to specification.",
      "Track job progress and report delays, material shortages and quality issues.",
      "Enforce safe working practices on the shop floor.",
      "Coordinate with stores, quality control and dispatch.",
    ],
    requirements: [
      "2 to 5 years of experience in a fabrication or manufacturing unit.",
      "Able to read mechanical and fabrication drawings.",
      "Experience leading a team of fitters and welders.",
      "Diploma in Mechanical Engineering, or 10th / 12th pass with strong shop-floor experience.",
    ],
    benefits: [],
    workingHours: "Monday to Saturday, 9:00 AM – 7:00 PM",
    salary: { min: 20000, max: 25000, unit: "MONTH" },
    experience: { min: 2, max: 5 },
    educationLevel: "high school",
    qualification: "Diploma Mechanical / 10th pass / 12th pass",
    experienceInPlaceOfEducation: true,
    location,
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "fallback-quality-inspector",
    slug: "quality-inspector",
    title: "Quality Inspector",
    status: "open",
    department: "Quality Control",
    employmentType: ["FULL_TIME"],
    vacancies: 1,
    datePosted: "2026-08-01",
    validThrough: "2026-12-01",
    summary:
      "Inspect welds, dimensions and finish on petroleum, chemical and water tankers before they leave our Sanathal factory.",
    responsibilities: [
      "Inspect incoming material, fit-up, welds and finished tanks against drawings.",
      "Carry out dimensional checks and leak / pressure tests.",
      "Record inspection results and raise non-conformance reports.",
      "Work with production to correct defects before dispatch.",
    ],
    requirements: [
      "1 to 2 years of quality inspection experience in fabrication.",
      "Familiar with measuring instruments and weld visual inspection.",
      "ITI, Diploma in Mechanical Engineering or 12th pass.",
    ],
    benefits: [],
    workingHours: "Monday to Saturday, 9:00 AM – 7:00 PM",
    salary: { min: 15000, max: 20000, unit: "MONTH" },
    experience: { min: 1, max: 2 },
    educationLevel: "high school",
    qualification: "ITI / Diploma Mechanical / 12th pass",
    experienceInPlaceOfEducation: true,
    location,
    updatedAt: "2026-08-01T00:00:00Z",
  },
];
