import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";
import { ProductFaq } from "@/components/product/ProductFaq";
import { Container } from "@/components/sections/Container";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQS, HOW_TO } from "@/lib/calculator/content";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "Free Tank Volume Calculator: All Shapes & Partial Fill";
const description =
  "Free tank volume calculator for horizontal, vertical, oval, cone, capsule and dished-end tanks. Capacity and partial fill in litres, KL, m³ and gallons, with a 3D model.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/calculator" },
  openGraph: {
    url: "/calculator",
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [
      {
        url: "/images/og-calculator.jpg",
        alt: "HH FABTECH tank volume calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-calculator.jpg"],
  },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HH FABTECH Tank Volume Calculator",
  url: `${SITE_URL}/calculator`,
  description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  inLanguage: "en-IN",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@id": `${SITE_URL}/#business` },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CalculatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Free tool"
        title="Tank volume calculator"
        description="Total capacity and partial-fill volume for 11 tank shapes, with a live 2D and 3D model that shows your dimensions."
        image="/images/hero/hero4.webp"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Calculator" }]}
      />

      <Calculator />

      <section
        aria-labelledby="howto-title"
        className="bg-white py-16 md:py-24"
      >
        <Container>
          <SectionHeading
            id="howto-title"
            eyebrow="The formulas"
            title="How to calculate tank volume"
            description="Choose a shape, enter its internal dimensions and read the capacity in litres, KL, m³ and gallons. These are the standard formulas the calculator uses."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_TO.map((h) => (
              <li
                key={h.title}
                className="rounded-2xl border border-brand/10 bg-[#fbfaff] p-6"
              >
                <h3 className="text-lg font-semibold text-brand">{h.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {h.text}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        aria-labelledby="faq-title"
        className="bg-[#f8f7fb] py-16 md:py-24"
      >
        <Container className="max-w-4xl">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title="Tank volume calculator FAQ"
          />
          <ProductFaq faqs={FAQS} product="Tank volume calculator" />
        </Container>
      </section>

      <CtaBand
        location="calculator_cta"
        title="Need a tank built to your size?"
        text="HH FABTECH manufactures petroleum, chemical, stainless steel and water tankers, fuel bowsers and storage tanks to your exact dimensions."
      />

      <JsonLd data={appJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tank Volume Calculator", path: "/calculator" },
        ])}
      />
    </>
  );
}
