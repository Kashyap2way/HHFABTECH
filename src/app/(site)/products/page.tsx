import type { Metadata } from "next";
import { ProductListCard } from "@/components/product/ProductListCard";
import { Container } from "@/components/sections/Container";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { products } from "@/lib/products";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const title = "Our Product Range";
const description =
  "Petroleum and diesel tankers, chemical tankers, SS tankers, fuel bowsers, storage tanks and water tankers manufactured by HH FABTECH in Ahmedabad, Gujarat.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/products" },
  openGraph: {
    url: "/products",
    title: `${title} | HH FABTECH`,
    description,
    images: [
      {
        url: "/images/products/petroleum.webp",
        alt: "HH FABTECH petroleum tanker",
      },
    ],
  },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "HH FABTECH product range",
  url: `${SITE_URL}/products`,
  description,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/${p.slug}`,
      name: p.name,
      image: `${SITE_URL}${p.image.src}`,
    })),
  },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Our product range"
        description="High-quality tankers designed for performance, safety and reliability, built to your capacity and application."
        image="/images/hero/hero2.webp"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Products" }]}
      />

      <section
        aria-labelledby="catalog-title"
        className="bg-[#f8f7fb] py-16 md:py-24"
      >
        <Container>
          <SectionHeading
            id="catalog-title"
            eyebrow="Tankers & tanks"
            title="Six product lines, built to order"
            description="Choose a product to see capacities, specifications and options."
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {products.map((p, i) => (
              <li key={p.slug} className="reveal">
                <ProductListCard product={p} index={i} priority={i < 3} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand
        location="products_cta"
        title="Need a customised tanker?"
        text="Contact HH FABTECH for tanker manufacturing tailored to your business: capacity, compartments, material and branding."
      />

      <JsonLd data={collectionJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ])}
      />
    </>
  );
}
