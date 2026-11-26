import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  CalendarX2Icon,
  ClockIcon,
  GraduationCapIcon,
  IndianRupeeIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { TrackView } from "@/components/analytics/TrackView";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { JobCard } from "@/components/careers/JobCard";
import { Container } from "@/components/sections/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getJob, getJobSlugs, getOpenJobs } from "@/lib/careers/data";
import {
  formatDate,
  formatEmployment,
  formatExperience,
  formatSalary,
  jobPath,
} from "@/lib/careers/format";
import { jobPostingJsonLd } from "@/lib/careers/jsonld";
import type { Job } from "@/lib/careers/types";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Single job page: the only place JobPosting structured data is rendered.
 * Known slugs are prerendered; jobs published later stream in on first visit and are cached
 * (ISR with Cache Components). Closed / expired jobs stay reachable but drop the markup and
 * are noindexed, which is how Google asks for expired postings to be handled.
 */

export async function generateStaticParams() {
  const slugs = await getJobSlugs();
  // Cache Components needs at least one param; the placeholder simply 404s.
  return (slugs.length ? slugs : ["no-openings"]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/career/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Job not found", robots: { index: false } };
  const closed = job.status !== "open";
  const title = `${job.title} Job in ${job.location.locality}`;
  const description = job.summary.slice(0, 155);
  return {
    title: closed ? `${job.title} (position closed)` : title,
    description,
    alternates: { canonical: jobPath(job.slug) },
    robots: closed ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: jobPath(job.slug),
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: "/images/hero/hero3.webp", alt: "HH FABTECH factory" }],
    },
  };
}

export default function JobPage(props: PageProps<"/career/[slug]">) {
  return (
    <Suspense fallback={<JobSkeleton />}>
      <JobDetail params={props.params} />
    </Suspense>
  );
}

async function JobDetail({
  params,
}: {
  params: PageProps<"/career/[slug]">["params"];
}) {
  const { slug } = await params;
  const [job, open] = await Promise.all([getJob(slug), getOpenJobs()]);
  if (!job) notFound();

  const closed = job.status !== "open";
  const others = open.filter((j) => j.id !== job.id).slice(0, 2);
  const positions = open.map((j) => ({
    id: j.id,
    title: j.title,
    department: j.department,
  }));

  return (
    <>
      <JobHero job={job} closed={closed} />

      <section className="bg-[#f8f7fb] py-12 md:py-16">
        <Container className="grid items-start gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div className="grid gap-6">
            {closed ? <ClosedNotice /> : null}
            <article className="rounded-3xl border border-brand/10 bg-white p-6 md:p-10">
              <h2 className="text-2xl font-bold text-brand">About the role</h2>
              <p className="mt-4 text-lg leading-relaxed text-foreground/85">
                {job.summary}
              </p>
              <JobList title="Responsibilities" items={job.responsibilities} />
              <JobList title="Skills & requirements" items={job.requirements} />
              <JobList title="Benefits" items={job.benefits} />
              {job.qualification || job.workingHours ? (
                <div className="mt-8 grid gap-4 border-t border-brand/10 pt-6 sm:grid-cols-2">
                  {job.qualification ? (
                    <p>
                      <span className="block text-sm text-muted-foreground">
                        Qualification
                      </span>
                      <span className="font-semibold text-brand">
                        {job.qualification}
                      </span>
                    </p>
                  ) : null}
                  {job.workingHours ? (
                    <p>
                      <span className="block text-sm text-muted-foreground">
                        Working hours
                      </span>
                      <span className="font-semibold text-brand">
                        {job.workingHours}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </article>
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <JobOverview job={job} closed={closed} />
          </aside>
        </Container>
      </section>

      <section
        id="apply"
        aria-labelledby="apply-title"
        className="scroll-mt-24 bg-white py-16 md:py-20"
      >
        <Container className="max-w-4xl">
          <h2
            id="apply-title"
            className="text-3xl font-bold text-brand md:text-4xl"
          >
            {closed ? "Send a general application" : `Apply for ${job.title}`}
          </h2>
          <p className="mt-3 mb-8 text-muted-foreground">
            {closed
              ? "This role is closed, but we keep good profiles on file for future openings."
              : "It takes about two minutes. We'll call you if your profile matches."}
          </p>
          <div className="rounded-3xl border border-brand/10 bg-[#fbfaff] p-5 sm:p-8">
            <ApplicationForm
              positions={positions}
              job={
                closed
                  ? undefined
                  : { id: job.id, title: job.title, department: job.department }
              }
              location="job_detail"
            />
          </div>
        </Container>
      </section>

      {others.length ? (
        <section
          aria-labelledby="more-title"
          className="bg-[#f8f7fb] py-16 md:py-20"
        >
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2
                id="more-title"
                className="text-2xl font-bold text-brand md:text-3xl"
              >
                Other openings
              </h2>
              <Link
                href="/career#openings"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                All openings
              </Link>
            </div>
            <ul className="grid gap-5 md:grid-cols-2">
              {others.map((j, i) => (
                <li key={j.id}>
                  <JobCard job={j} index={i} list="related_jobs" compact />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {closed ? null : <JsonLd data={jobPostingJsonLd(job)} />}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/career" },
          { name: job.title, path: jobPath(job.slug) },
        ])}
      />
      <TrackView
        event={{
          name: "view_job",
          jobId: job.id,
          title: job.title,
          department: job.department,
        }}
      />
    </>
  );
}

function JobHero({ job, closed }: { job: Job; closed: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_120%_at_90%_0%,rgb(244_180_0/0.2),transparent_60%),radial-gradient(60%_120%_at_0%_100%,rgb(111_66_193/0.55),transparent_65%),linear-gradient(135deg,#24103d,#43236f_60%,#5f3298)]"
      />
      <Container className="py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-white/70">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-gold">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/career" className="hover:text-gold">
                Careers
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white">
              {job.title}
            </li>
          </ol>
        </nav>
        <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-gold uppercase">
          {job.department}
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-balance md:text-5xl">
          {job.title}
        </h1>
        <ul className="mt-6 flex flex-wrap gap-2 text-sm">
          {[
            { icon: BriefcaseIcon, text: formatEmployment(job) },
            {
              icon: MapPinIcon,
              text: `${job.location.locality}, ${job.location.region}`,
            },
            formatExperience(job)
              ? { icon: GraduationCapIcon, text: formatExperience(job) }
              : null,
          ]
            .filter((x): x is { icon: typeof BriefcaseIcon; text: string } =>
              Boolean(x?.text),
            )
            .map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5"
              >
                <Icon aria-hidden="true" className="size-4 text-gold" />
                {text}
              </li>
            ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {closed ? (
            <span className="inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-6 font-semibold">
              <CalendarX2Icon aria-hidden="true" className="size-5" />
              This position is closed
            </span>
          ) : (
            <a
              href="#apply"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full bg-gold px-7 text-base font-semibold text-brand-dark hover:bg-gold-light",
              )}
            >
              Apply now
            </a>
          )}
          <TrackedLink
            href="/career#openings"
            event={{
              name: "cta_click",
              label: "All openings",
              location: "job_detail",
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-full border-white/40 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/20 hover:text-white",
            )}
          >
            <ArrowLeftIcon aria-hidden="true" />
            All openings
          </TrackedLink>
        </div>
      </Container>
    </section>
  );
}

function JobOverview({ job, closed }: { job: Job; closed: boolean }) {
  const salary = formatSalary(job);
  const experience = formatExperience(job);
  const rows = [
    salary ? { icon: IndianRupeeIcon, label: "Salary", value: salary } : null,
    experience
      ? { icon: GraduationCapIcon, label: "Experience", value: experience }
      : null,
    {
      icon: BriefcaseIcon,
      label: "Employment type",
      value: formatEmployment(job),
    },
    {
      icon: UsersIcon,
      label: "Openings",
      value: String(job.vacancies),
    },
    job.workingHours
      ? { icon: ClockIcon, label: "Working hours", value: job.workingHours }
      : null,
    {
      icon: MapPinIcon,
      label: "Location",
      value: [
        job.location.streetAddress,
        `${job.location.locality}, ${job.location.region}${job.location.postalCode ? ` ${job.location.postalCode}` : ""}`,
      ]
        .filter(Boolean)
        .join(", "),
    },
    {
      icon: CalendarIcon,
      label: "Posted",
      value: formatDate(job.datePosted),
    },
    job.validThrough
      ? {
          icon: CalendarX2Icon,
          label: closed ? "Closed on" : "Apply by",
          value: formatDate(job.validThrough),
        }
      : null,
  ].filter(Boolean) as {
    icon: typeof BriefcaseIcon;
    label: string;
    value: string;
  }[];

  return (
    <div className="rounded-3xl border border-brand/10 bg-white p-6 shadow-[0_30px_60px_-44px_rgb(21_15_38/0.45)] md:p-7">
      <h2 className="text-lg font-bold text-brand">Job overview</h2>
      <dl className="mt-5 grid gap-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/[0.07] text-brand">
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-[15px] font-semibold text-foreground/90">
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      {closed ? null : (
        <a
          href="#apply"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 h-12 w-full rounded-full text-base font-semibold",
          )}
        >
          Apply for this job
        </a>
      )}
    </div>
  );
}

function JobList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-brand">{title}</h3>
      <ul className="mt-3 grid gap-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 leading-relaxed text-foreground/85"
          >
            <span
              aria-hidden="true"
              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClosedNotice() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-5 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <strong className="font-semibold">This position is closed.</strong> It's
        no longer accepting applications.
      </p>
      <Link
        href="/career#openings"
        className="shrink-0 font-semibold underline underline-offset-4"
      >
        See current openings
      </Link>
    </div>
  );
}

function JobSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading job…</span>
      <section className="bg-brand-deep">
        <Container className="py-12 md:py-16">
          <Skeleton className="h-4 w-48 bg-white/10" />
          <Skeleton className="mt-6 h-12 w-2/3 bg-white/10" />
          <Skeleton className="mt-6 h-8 w-80 max-w-full bg-white/10" />
        </Container>
      </section>
      <Container className="grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </Container>
    </div>
  );
}
