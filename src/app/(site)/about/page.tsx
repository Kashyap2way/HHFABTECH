import type { Metadata } from "next";
import { StorySection } from "@/components/about/StorySection";
import { milestones, Timeline } from "@/components/about/Timeline";
import { ValuesSection } from "@/components/about/ValuesSection";
import { VisitStrip } from "@/components/about/VisitStrip";
import { CtaBand } from "@/components/sections/CtaBand";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const title = "About Us";
const description =
  "HH FABTECH is a manufacturer of petroleum, chemical, SS and water tankers in Ahmedabad, Gujarat, with fabrication expertise dating back to 1967.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: `${title} | HH FABTECH`,
    description,
    images: [
      { url: "/images/hero/hero3.webp", alt: "HH FABTECH chemical tanker" },
    ],
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About HH FABTECH",
  url: `${SITE_URL}/about`,
  description,
  mainEntity: {
    "@id": `${SITE_URL}/#business`,
    foundingDate: "1967",
    foundingLocation: "Ahmedabad, Gujarat, India",
  },
  hasPart: milestones.map((m) => ({
    "@type": "Event",
    name: m.title,
    startDate: m.dateTime,
    description: m.text,
  })),
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About HH FABTECH"
        title="Engineering excellence since 1967"
        description="A family legacy of heavy fabrication, now focused on premium petroleum, chemical, stainless steel and water tankers."
        image="/images/hero/hero3.webp"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "About Us" }]}
      />
      <StorySection />
      <Timeline />
      <ValuesSection />
      <VisitStrip />
      <CtaBand
        location="about_cta"
        title="Let's build your next tanker together"
        text="Share your capacity, product and chassis details. Our team will respond with specifications and a quotation."
      />
      <JsonLd data={aboutJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ])}
      />
    </>
  );
}
