import { defineQuery } from "next-sanity";

/**
 * A job is live while it is marked open and its last date (end of day, IST) hasn't passed.
 * Evaluated by Sanity at query time; the Next cache life (hours) bounds how stale it can be.
 */
const LIVE = `status == "open" && (!defined(validThrough) || dateTime(validThrough + "T23:59:59+05:30") >= now())`;

const JOB_FIELDS = `
  "id": _id,
  "slug": slug.current,
  title,
  "status": select(${LIVE} => "open", "closed"),
  department,
  "employmentType": coalesce(employmentType, ["FULL_TIME"]),
  "vacancies": coalesce(vacancies, 1),
  datePosted,
  "validThrough": coalesce(validThrough, null),
  summary,
  "responsibilities": coalesce(responsibilities, []),
  "requirements": coalesce(requirements, []),
  "benefits": coalesce(benefits, []),
  "workingHours": coalesce(workingHours, null),
  "salary": select(defined(salary.min) || defined(salary.max) => {
    "min": coalesce(salary.min, null),
    "max": coalesce(salary.max, null),
    "unit": coalesce(salary.unit, "MONTH")
  }, null),
  "experience": select(defined(experience) => {
    "min": coalesce(experience.min, null),
    "max": coalesce(experience.max, null)
  }, null),
  "educationLevel": coalesce(educationLevel, null),
  "qualification": coalesce(qualification, null),
  "experienceInPlaceOfEducation": coalesce(experienceInPlaceOfEducation, false),
  "location": {
    "streetAddress": coalesce(location.streetAddress, null),
    "locality": coalesce(location.locality, "Ahmedabad"),
    "region": coalesce(location.region, "Gujarat"),
    "postalCode": coalesce(location.postalCode, null),
    "country": coalesce(location.country, "IN")
  },
  "updatedAt": _updatedAt
`;

export const OPEN_JOBS_QUERY = defineQuery(
  `*[_type == "jobPosting" && defined(slug.current) && ${LIVE}] | order(datePosted desc, _createdAt desc) { ${JOB_FIELDS} }`,
);

/** Any job by slug, open or closed, so a closed job can show a "position closed" page. */
export const JOB_BY_SLUG_QUERY = defineQuery(
  `*[_type == "jobPosting" && slug.current == $slug][0] { ${JOB_FIELDS} }`,
);

/** Slugs to prerender at build. Closed jobs are included so their pages resolve too. */
export const JOB_SLUGS_QUERY = defineQuery(
  `*[_type == "jobPosting" && defined(slug.current)] | order(datePosted desc)[0...100].slug.current`,
);
