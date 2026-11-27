import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote/QuoteBuilder";
import { Container } from "@/components/sections/Container";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const title = "Get a Tanker Quote";
const description =
  "Build an instant tanker quote: choose capacity, material and accessories, preview your tanker in 3D and see the estimated delivery date.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/quote" },
  robots: { index: false, follow: true },
  openGraph: { url: "/quote", title: `${title} | ${SITE_NAME}`, description },
};

export default function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Instant quote"
        title="Get your tanker quote"
        description="Choose capacity, material and accessories. Your selections are saved as you go, so you can jump to the calculator and come back."
        image="/images/hero/hero4.webp"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Get a quote" }]}
      />
      <section className="bg-[#f8f7fb] py-10 md:py-14">
        <Container>
          <QuoteBuilder />
        </Container>
      </section>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Get a quote", path: "/quote" },
        ])}
      />
    </>
  );
}
