import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactDetails } from "@/components/contact/ContactDetails";
import { ContactForm } from "@/components/contact/ContactForm";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { Container } from "@/components/sections/Container";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Skeleton } from "@/components/ui/skeleton";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const title = "Contact Us";
const description =
  "Contact HH FABTECH for petroleum, chemical, SS and water tankers, fuel bowsers, storage tanks and custom fabrication. Call, WhatsApp or send an inquiry.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: `${title} | HH FABTECH`,
    description,
    images: [
      {
        url: "/images/og-banner.png",
        alt: "HH FABTECH tanker manufacturer, Ahmedabad",
      },
    ],
  },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact HH FABTECH",
  url: `${SITE_URL}/contact`,
  about: { "@id": `${SITE_URL}/#business` },
};

function FormSkeleton() {
  return (
    <output aria-busy="true" className="grid gap-5">
      <span className="sr-only">Loading form…</span>
      <Skeleton className="h-4 w-32" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="ml-auto h-12 w-40 rounded-full" />
    </output>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Let's build your next tanker"
        eyebrow="Contact HH FABTECH"
        description="Ask for a quotation, technical specifications or a custom tanker. Our team usually responds within one working day."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Contact Us" }]}
      />

      <section
        aria-labelledby="inquiry-title"
        className="bg-white py-14 md:py-20"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <h2 className="text-2xl font-bold text-brand md:text-3xl">
              Get in touch
            </h2>
            <p className="mt-3 mb-8 leading-relaxed text-muted-foreground">
              We manufacture petroleum, chemical, stainless steel and water
              tankers, fuel bowsers and storage tanks. Reach us directly or send
              the details of your requirement.
            </p>
            <ContactDetails />
          </div>

          <div className="rounded-3xl border border-brand/10 bg-[#fbfaff] p-5 shadow-[0_30px_60px_-40px_rgb(21_15_38/0.45)] sm:p-8 lg:p-10">
            <h2
              id="inquiry-title"
              className="text-2xl font-bold text-brand md:text-3xl"
            >
              Send an inquiry
            </h2>
            <p className="mt-2 mb-8 text-muted-foreground">
              Share as much detail as you can. Drawings and photos help us quote
              faster.
            </p>
            <Suspense fallback={<FormSkeleton />}>
              <ContactForm />
            </Suspense>
          </div>
        </Container>
      </section>

      <MapEmbed />

      <JsonLd data={contactPageJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact Us", path: "/contact" },
        ])}
      />
    </>
  );
}
