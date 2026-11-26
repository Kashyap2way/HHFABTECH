"use client";

import { MailIcon, SearchXIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TrackedAnchor } from "@/components/analytics/TrackedLink";
import { buttonVariants } from "@/components/ui/button";
import { track } from "@/lib/analytics/events";
import type { Job } from "@/lib/careers/types";
import { contact } from "@/lib/site";
import { cn } from "@/lib/utils";
import { JobCard } from "./JobCard";

const ALL = "All";

/**
 * Open positions with a department filter. Filtering is client-side (a handful of jobs),
 * so every job card is in the server HTML for crawlers.
 */
export function JobBoard({ jobs }: { jobs: Job[] }) {
  const departments = useMemo(
    () => [...new Set(jobs.map((j) => j.department))].sort(),
    [jobs],
  );
  const [dept, setDept] = useState<string>(ALL);
  const shown = dept === ALL ? jobs : jobs.filter((j) => j.department === dept);

  useEffect(() => {
    track({ name: "view_job_list", count: jobs.length });
  }, [jobs.length]);

  if (!jobs.length) return <NoOpenings />;

  return (
    <div>
      {departments.length > 1 ? (
        <fieldset className="mb-8">
          <legend className="sr-only">Filter by department</legend>
          <div className="flex flex-wrap gap-2">
            {[ALL, ...departments].map((d) => {
              const count =
                d === ALL
                  ? jobs.length
                  : jobs.filter((j) => j.department === d).length;
              const active = dept === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setDept(d);
                    track({
                      name: "job_filter",
                      department: d,
                      results: count,
                    });
                  }}
                  className={cn(
                    "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-brand/15 bg-white text-brand hover:border-brand/40",
                  )}
                >
                  {d}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active ? "bg-white/20" : "bg-brand/[0.07]",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? "position" : "positions"} shown
      </p>
      {shown.length ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {shown.map((job, i) => (
            <li key={job.id}>
              <JobCard job={job} index={i} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-muted-foreground">
          <SearchXIcon aria-hidden="true" className="size-5" />
          No openings in this department right now.
        </p>
      )}
    </div>
  );
}

function NoOpenings() {
  return (
    <div className="rounded-2xl border border-dashed border-brand/20 bg-white p-8 text-center md:p-12">
      <h3 className="text-xl font-bold text-brand md:text-2xl">
        No open positions right now
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        We're always glad to hear from skilled fabricators, welders, engineers
        and production staff. Send us your résumé below and we'll contact you
        when a suitable role opens.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href="#apply"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 rounded-full px-6 font-semibold",
          )}
        >
          Send your résumé
        </a>
        <TrackedAnchor
          href={`mailto:${contact.email}?subject=${encodeURIComponent("Job application")}`}
          event={{
            name: "contact_click",
            method: "email",
            location: "careers",
          }}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 rounded-full px-6",
          )}
        >
          <MailIcon aria-hidden="true" />
          {contact.email}
        </TrackedAnchor>
      </div>
    </div>
  );
}
