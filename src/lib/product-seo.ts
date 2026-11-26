import type { Metadata } from "next";
import { getProductDetail, type ProductDetail } from "./product-details";
import { breadcrumbJsonLd } from "./seo";
import { SITE_NAME, SITE_URL } from "./site";

export function productMetadata(slug: string): Metadata {
  const p = getProductDetail(slug);
  const path = `/${p.slug}`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${p.metaTitle} | ${SITE_NAME}`,
      description: p.metaDescription,
      images: [
        {
          url: p.image.src,
          width: p.image.width,
          height: p.image.height,
          alt: p.image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.metaTitle} | ${SITE_NAME}`,
      description: p.metaDescription,
      images: [p.image.src],
    },
  };
}

/**
 * Product + Breadcrumb + FAQ structured data for one product page.
 * Product has no offers because prices are quoted per order; all fields are factual.
 */
export function productJsonLd(p: ProductDetail): Record<string, unknown>[] {
  const url = `${SITE_URL}/${p.slug}`;
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    url,
    image: `${SITE_URL}${p.image.src}`,
    description: p.metaDescription,
    category: p.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": `${SITE_URL}/#business` },
    additionalProperty: p.keySpecs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: p.name, path: `/${p.slug}` },
  ]);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return [product, breadcrumbs, faq];
}
