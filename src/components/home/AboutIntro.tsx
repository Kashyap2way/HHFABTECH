import { CheckCircle2Icon } from "lucide-react";
import Image from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const points = [
  "Precision welding and advanced fabrication",
  "Hydro, leakage and quality testing before dispatch",
  "Custom capacity, compartments, material and branding",
  "On-time delivery with dedicated after-sales support",
] as const;

export function AboutIntro() {
  return (
    <section aria-labelledby="about-title" className="bg-white py-16 md:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="reveal order-last lg:order-first">
          <div className="overflow-hidden rounded-3xl shadow-[0_40px_80px_-40px_rgb(21_15_38/0.5)]">
            <Image
              src="/images/products/storage.webp"
              alt="Industrial storage tank fabricated at the HH FABTECH facility"
              width={1376}
              height={768}
              sizes="(min-width: 1024px) 600px, 90vw"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>

        <div>
          <SectionHeading
            id="about-title"
            align="left"
            eyebrow="Who we are"
            title="Welcome to HH FABTECH"
            className="mb-6 md:mb-8"
          />
          <p className="leading-relaxed text-muted-foreground md:text-lg">
            HH FABTECH is committed to manufacturing premium-quality petroleum,
            diesel, chemical, stainless steel and water tankers with precision
            engineering, advanced fabrication and strict quality standards. Our
            goal is to provide reliable, durable and customised tanker solutions
            that meet the growing needs of industries across India.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-[15px] leading-snug">
                <CheckCircle2Icon
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-gold-dark"
                />
                {p}
              </li>
            ))}
          </ul>
          <TrackedLink
            href="/about"
            event={{
              name: "cta_click",
              label: "Our story",
              location: "home_about",
            }}
            className="mt-8 inline-flex items-center gap-2 font-semibold text-brand underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold-dark"
          >
            Read our story since 1967
          </TrackedLink>
        </div>
      </Container>
    </section>
  );
}
