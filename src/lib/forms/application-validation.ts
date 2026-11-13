/**
 * Job application validation. Pure and framework-free: the browser uses it for instant
 * feedback and /api/careers/apply re-runs it, since client checks can be bypassed.
 */

/** Below Netlify's 8 MB form limit and the 6 MB function request limit (multipart overhead included). */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Some browsers / OSes send an empty or generic type; the extension check covers those.
  "",
  "application/octet-stream",
]);

export const APPLICATION_FIELDS = [
  "name",
  "email",
  "phone",
  "city",
  "qualification",
  "experience",
  "current_company",
  "expected_salary",
  "notice_period",
  "message",
  "job_position",
  "job_id",
  "consent",
] as const;

export type ApplicationErrors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "qualification"
    | "job_position"
    | "message"
    | "resume"
    | "consent",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Max lengths keep stored documents and notification emails sane. */
export const MAX_LEN: Record<string, number> = {
  name: 80,
  email: 120,
  phone: 20,
  city: 80,
  qualification: 120,
  experience: 40,
  current_company: 120,
  expected_salary: 40,
  notice_period: 40,
  message: 3000,
  job_position: 120,
  job_id: 120,
};

type FileLike = { name: string; size: number; type: string };
const isFile = (v: unknown): v is FileLike =>
  typeof v === "object" &&
  v !== null &&
  "size" in v &&
  "name" in v &&
  typeof (v as FileLike).size === "number";

export function validateApplication(data: FormData): ApplicationErrors {
  const get = (k: string) => String(data.get(k) ?? "").trim();
  const errors: ApplicationErrors = {};

  const name = get("name");
  if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > MAX_LEN.name) errors.name = "Name is too long.";

  const email = get("email");
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > MAX_LEN.email)
    errors.email = "Enter a valid email address.";

  const digits = get("phone").replace(/\D/g, "");
  if (!digits) errors.phone = "Please enter your mobile number.";
  else if (digits.length < 10 || digits.length > 13)
    errors.phone = "Enter a valid mobile number, e.g. +91 98765 43210.";

  if (get("qualification").length < 2)
    errors.qualification = "Please enter your highest qualification.";

  if (!get("job_position")) errors.job_position = "Please choose a position.";

  if (get("message").length > MAX_LEN.message)
    errors.message = "Please keep your message under 3,000 characters.";

  const file = data.get("resume");
  if (!isFile(file) || file.size === 0) {
    errors.resume = "Please attach your résumé (PDF, DOC or DOCX).";
  } else {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!RESUME_ACCEPT.split(",").includes(ext) || !RESUME_TYPES.has(file.type))
      errors.resume = "Upload your résumé as a PDF, DOC or DOCX file.";
    else if (file.size > MAX_RESUME_BYTES)
      errors.resume = "Résumé must be 5 MB or smaller.";
  }

  if (get("consent") !== "yes")
    errors.consent =
      "Please confirm we may store your details to process your application.";

  return errors;
}

/** Trimmed, length-capped string fields for storage. */
export function cleanApplication(data: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of APPLICATION_FIELDS) {
    const v = String(data.get(k) ?? "").trim();
    if (v) out[k] = v.slice(0, MAX_LEN[k] ?? 200);
  }
  return out;
}
