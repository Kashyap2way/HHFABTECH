import { MailIcon } from "lucide-react";
import type { Metadata } from "next";
import { TrackedAnchor } from "@/components/analytics/TrackedLink";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { JobBoard } from "@/components/careers/JobBoard";
import { HiringProcess, WhyJoin } from "@/components/careers/WhyJoin";
import { Container } from "@/components/sections/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { getOpenJobs } from "@/lib/careers/data";
import { breadcrumbJsonLd } from "@/lib/seo";
import { contact, SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

const title = "Careers: Tanker Manufacturing Jobs in Ahmedabad";
const description =
  "Join HH FABTECH in Sanathal, Ahmedabad. Open jobs in tanker fabrication, welding, production and quality control. Apply online in two minutes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/career" },
  openGraph: {
    url: "/career",
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [{ url: "/images/hero/hero3.webp", alt: "HH FABTECH factory" }],
  },
};

export default async function CareersPage() {
  const jobs = await getOpenJobs();
  const positions = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
  }));

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build your career with HH FABTECH"
        description="Join one of Gujarat's growing tanker manufacturers and become part of a team that values quality, innovation and engineering excellence."
        image="/images/hero/hero3.webp"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Careers" }]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#openings"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full bg-gold px-7 text-base font-semibold text-brand-dark hover:bg-gold-light",
            )}
          >
            {jobs.length
              ? `View ${jobs.length} open ${jobs.length === 1 ? "position" : "positions"}`
              : "Explore careers"}
          </a>
          <a
            href="#apply"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/20 hover:text-white",
            )}
          >
            Send your résumé
          </a>
        </div>
      </PageHero>

      <section
        id="openings"
        aria-labelledby="openings-title"
        className="scroll-mt-24 bg-[#f8f7fb] py-16 md:py-24"
      >
        <Container>
          <SectionHeading
            id="openings-title"
            eyebrow="Open positions"
            title="Current openings"
            description="All roles are based at our factory in Sanathal, Ahmedabad."
            align="left"
          />
          <JobBoard jobs={jobs} />
        </Container>
      </section>

      <WhyJoin />
      <HiringProcess />

      <section
        id="apply"
        aria-labelledby="apply-title"
        className="scroll-mt-24 bg-[#f8f7fb] py-16 md:py-24"
      >
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              id="apply-title"
              eyebrow="Apply now"
              title="Send us your application"
              description="Choose an open position, or send a general application and we'll contact you when a suitable role opens."
              align="left"
              className="mb-6 md:mb-8"
            />
            <p className="text-muted-foreground">
              Prefer email? Send your résumé to
            </p>
            <TrackedAnchor
              href={`mailto:${contact.email}?subject=${encodeURIComponent("Job application")}`}
              event={{
                name: "contact_click",
                method: "email",
                location: "careers",
              }}
              className="mt-1 inline-flex items-center gap-2 font-semibold text-brand underline-offset-4 hover:underline"
            >
              <MailIcon aria-hidden="true" className="size-4" />
              {contact.email}
            </TrackedAnchor>
          </div>
          <div className="rounded-3xl border border-brand/10 bg-white p-5 shadow-[0_30px_60px_-44px_rgb(21_15_38/0.45)] sm:p-8">
            <ApplicationForm positions={positions} location="careers" />
          </div>
        </Container>
      </section>

      {/* No JobPosting here: Google only allows it on single-job pages. */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/career" },
        ])}
      />
    </>
  );
}
