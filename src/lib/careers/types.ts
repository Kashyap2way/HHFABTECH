/** Job opening as used by the site (shape returned by the GROQ query, also used by the fallback). */
export type Job = {
  id: string;
  slug: string;
  title: string;
  status: "open" | "closed";
  department: string;
  employmentType: string[];
  vacancies: number;
  /** YYYY-MM-DD */
  datePosted: string;
  /** YYYY-MM-DD, last day to apply (inclusive, IST) */
  validThrough: string | null;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  workingHours: string | null;
  salary: { min: number | null; max: number | null; unit: string } | null;
  experience: { min: number | null; max: number | null } | null;
  educationLevel: string | null;
  qualification: string | null;
  experienceInPlaceOfEducation: boolean;
  location: {
    streetAddress: string | null;
    locality: string;
    region: string;
    postalCode: string | null;
    country: string;
  };
  /** ISO datetime of the last edit, for the sitemap lastmod */
  updatedAt: string;
};
