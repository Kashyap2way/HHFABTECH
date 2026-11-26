import { products } from "../products.ts";

/**
 * Classify a path for reporting. Sent as GA4 `content_group` (built-in) and `page_type`,
 * so reports can compare e.g. all product pages, or all job pages, as one group.
 */
const PRODUCT_SLUGS = new Set(products.map((p) => p.slug));

export type PageContext = {
  page_type:
    | "home"
    | "products"
    | "product"
    | "calculator"
    | "about"
    | "contact"
    | "careers"
    | "job"
    | "blog"
    | "blog_post"
    | "blog_category"
    | "blog_author"
    | "other";
  content_group: string;
  page_slug?: string;
};

export function pageContext(pathname: string): PageContext {
  const path = pathname.replace(/\/+$/, "") || "/";
  const [first, second] = path.split("/").filter(Boolean);
  if (path === "/") return { page_type: "home", content_group: "Home" };
  if (first === "products")
    return { page_type: "products", content_group: "Products" };
  if (first && PRODUCT_SLUGS.has(first))
    return {
      page_type: "product",
      content_group: "Product pages",
      page_slug: first,
    };
  if (first === "calculator")
    return { page_type: "calculator", content_group: "Calculator" };
  if (first === "about") return { page_type: "about", content_group: "About" };
  if (first === "contact")
    return { page_type: "contact", content_group: "Contact" };
  if (first === "career" && second)
    return { page_type: "job", content_group: "Job pages", page_slug: second };
  if (first === "career")
    return { page_type: "careers", content_group: "Careers" };
  if (first === "blog") {
    if (second === "category")
      return {
        page_type: "blog_category",
        content_group: "Blog categories",
        page_slug: path.split("/")[3],
      };
    if (second === "author")
      return {
        page_type: "blog_author",
        content_group: "Blog authors",
        page_slug: path.split("/")[3],
      };
    if (second && second !== "page")
      return {
        page_type: "blog_post",
        content_group: "Blog posts",
        page_slug: second,
      };
    return { page_type: "blog", content_group: "Blog" };
  }
  return { page_type: "other", content_group: "Other" };
}
