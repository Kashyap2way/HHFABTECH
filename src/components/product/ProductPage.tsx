import { TrackView } from "@/components/analytics/TrackView";
import { Container } from "@/components/sections/Container";
import { CtaBand } from "@/components/sections/CtaBand";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProductDetail } from "@/lib/product-details";
import { inquiryHref } from "@/lib/product-links";
import { productJsonLd } from "@/lib/product-seo";
import { BrandingSwitcher } from "./BrandingSwitcher";
import { CompareTable } from "./CompareTable";
import { ConfigTable } from "./ConfigTable";
import { PesoLogos } from "./PesoLogos";
import { ProductFaq } from "./ProductFaq";
import { ProductFeatures } from "./ProductFeatures";
import { ProductGridSection } from "./ProductGridSection";
import { ProductHeroDetail } from "./ProductHeroDetail";
import { ProductOverview } from "./ProductOverview";
import { RelatedProducts } from "./RelatedProducts";
import { SpecChips } from "./SpecChips";

/**
 * Shared template for every product detail page. Sections render only when the
 * product has data for them, so each page stays focused.
 */
export function ProductPage({ slug }: { slug: string }) {
  const p = getProductDetail(slug);

  return (
    <>
      <ProductHeroDetail
        product={p}
        media={p.extras?.branding ? <BrandingSwitcher /> : undefined}
      />
      <ProductOverview product={p} />
      <SpecChips groups={p.chipGroups} />
      {p.configTable ? <ConfigTable data={p.configTable} /> : null}
      {p.comparison ? <CompareTable data={p.comparison} /> : null}
      {p.extras?.pesoLogos ? <PesoLogos /> : null}
      {p.gridSections.map((section, i) => (
        <ProductGridSection
          key={section.title}
          section={section}
          id={`grid-${i}`}
          tone={i % 2 === 0 ? "grey" : "white"}
        />
      ))}
      <ProductFeatures features={p.features} />

      <section aria-labelledby="faq-title" className="bg-white py-16 md:py-20">
        <Container className="max-w-4xl">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title={`${p.name}: common questions`}
          />
          <ProductFaq faqs={p.faqs} product={p.name} />
        </Container>
      </section>

      <RelatedProducts slugs={p.related} />
      <CtaBand
        location={`product_cta_${p.slug}`}
        title={p.ctaTitle}
        text={p.ctaText}
        quoteHref={inquiryHref(p.name)}
        product={p.name}
      />

      {productJsonLd(p).map((data, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-order list of schema blocks
        <JsonLd key={i} data={data} />
      ))}
      <TrackView
        event={{
          name: "view_product",
          slug: p.slug,
          product: p.name,
          category: p.category,
        }}
      />
    </>
  );
}
