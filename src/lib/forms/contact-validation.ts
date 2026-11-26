/** Contact form validation. Pure and framework-free so it can be unit tested. */

export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // Netlify limit per submission
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.dwg";

export type ContactErrors = Partial<
  Record<
    "name" | "phone" | "email" | "product" | "requirement" | "attachment",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(data: FormData): ContactErrors {
  const get = (k: string) => String(data.get(k) ?? "").trim();
  const errors: ContactErrors = {};

  if (get("name").length < 2) errors.name = "Please enter your full name.";

  const digits = get("phone").replace(/\D/g, "");
  if (!digits) errors.phone = "Please enter your mobile number.";
  else if (digits.length < 10 || digits.length > 13)
    errors.phone = "Enter a valid mobile number, e.g. +91 98765 43210.";

  const email = get("email");
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!get("product")) errors.product = "Please choose a product.";

  if (get("requirement").length < 10)
    errors.requirement =
      "Please describe your requirement in a few words (at least 10 characters).";

  const file = data.get("attachment");
  if (file instanceof File && file.size > 0) {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ATTACHMENT_ACCEPT.split(",").includes(ext))
      errors.attachment = "Upload a PDF, JPG, PNG, WEBP or DWG file.";
    else if (file.size > MAX_ATTACHMENT_BYTES)
      errors.attachment = "Files must be 8 MB or smaller.";
  }

  return errors;
}
