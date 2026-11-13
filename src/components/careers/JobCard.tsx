import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarClockIcon,
  GraduationCapIcon,
  IndianRupeeIcon,
  MapPinIcon,
} from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import {
  formatDate,
  formatEmployment,
  formatExperience,
  formatLocation,
  formatSalary,
  jobPath,
} from "@/lib/careers/format";
import type { Job } from "@/lib/careers/types";
import { cn } from "@/lib/utils";

/** One opening in the careers list. The whole card is a link (stretched), the title is the h3. */
export function JobCard({
  job,
  index,
  list = "careers",
  headingLevel = "h3",
  compact = false,
}: {
  job: Job;
  index: number;
  list?: string;
  headingLevel?: "h2" | "h3";
  compact?: boolean;
}) {
  const H = headingLevel;
  const salary = formatSalary(job);
  const experience = formatExperience(job);
  const facts = [
    { icon: BriefcaseIcon, label: "Type", value: formatEmployment(job) },
    { icon: MapPinIcon, label: "Location", value: formatLocation(job) },
    experience
      ? { icon: GraduationCapIcon, label: "Experience", value: experience }
      : null,
    salary ? { icon: IndianRupeeIcon, label: "Salary", value: salary } : null,
  ].filter(Boolean) as {
    icon: typeof BriefcaseIcon;
    label: string;
    value: string;
  }[];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-brand/10 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_30px_60px_-36px_rgb(67_35_111/0.5)] focus-within:ring-3 focus-within:ring-ring/50 md:p-7",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand/[0.07] px-3 py-1 text-xs font-semibold text-brand">
          {job.department}
        </span>
        {job.vacancies > 1 ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-dark">
            {job.vacancies} openings
          </span>
        ) : null}
      </div>
      <H className="mt-4 text-xl font-bold text-brand md:text-[1.375rem]">
        <TrackedLink
          href={jobPath(job.slug)}
          event={{
            name: "select_job",
            jobId: job.id,
            title: job.title,
            list,
            index,
          }}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          {job.title}
        </TrackedLink>
      </H>
      {compact ? null : (
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
          {job.summary}
        </p>
      )}
      <dl className="mt-5 mb-5 grid gap-x-5 gap-y-2.5 text-sm sm:grid-cols-2">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <dt className="sr-only">{label}</dt>
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-gold-dark"
            />
            <dd className="text-foreground/80">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-brand/10 pt-4 text-sm">
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClockIcon aria-hidden="true" className="size-4" />
          {job.validThrough
            ? `Apply by ${formatDate(job.validThrough)}`
            : `Posted ${formatDate(job.datePosted)}`}
        </p>
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1 font-semibold text-brand transition-transform group-hover:translate-x-0.5"
        >
          View &amp; apply <ArrowRightIcon className="size-4" />
        </span>
      </div>
    </article>
  );
}
