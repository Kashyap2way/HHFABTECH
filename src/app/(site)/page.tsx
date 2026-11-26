import type { Metadata } from "next";
import { AboutIntro } from "@/components/home/AboutIntro";
import { CalculatorPromo } from "@/components/home/CalculatorPromo";
import { HeroSection } from "@/components/home/HeroSection";
import { HighlightsStrip } from "@/components/home/HighlightsStrip";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ProductGrid } from "@/components/home/ProductGrid";
import { WhyChoose } from "@/components/home/WhyChoose";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { products } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const productListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "HH FABTECH product range",
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/${p.slug}`,
    name: p.name,
  })),
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HighlightsStrip />
      <AboutIntro />
      <ProductGrid />
      <CalculatorPromo />
      <WhyChoose />
      <ProcessSteps />
      <CtaBand location="home_cta" />
      <JsonLd data={productListJsonLd} />
    </>
  );
}
