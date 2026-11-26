import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { cn } from "@/lib/utils";

export type Milestone = {
  /** Display year, e.g. "1990s" */
  year: string;
  /** Machine-readable year for <time>, e.g. "1990" */
  dateTime: string;
  title: string;
  text: string;
};

export const milestones: readonly Milestone[] = [
  {
    year: "1967",
    dateTime: "1967",
    title: "Foundation as HH Brothers",
    text: "Started a heavy fabrication business under the name HH Brothers, laying the foundation for a legacy of precision engineering.",
  },
  {
    year: "1990s",
    dateTime: "1990",
    title: "Manufacturing expansion",
    text: "Expanded operations through HH Engineering, HH Agrotech and Bhoomi Engineering, strengthening fabrication capabilities.",
  },
  {
    year: "2021",
    dateTime: "2021",
    title: "HH Engitech",
    text: "Established HH Engitech to manufacture tippers, trailers and heavy engineering products.",
  },
  {
    year: "2026",
    dateTime: "2026",
    title: "HH FABTECH",
    text: "A dedicated division for premium petroleum, chemical, stainless steel and water tankers, manufactured to industry standards.",
  },
];

/**
 * Semantic timeline (<ol> + <time>).
 * Mobile/tablet: single column with the rail on the left.
 * Desktop: cards alternate either side of a centred rail.
 */
export function Timeline() {
  return (
    <section
      aria-labelledby="journey-title"
      className="bg-[#f8f7fb] py-16 md:py-24"
    >
      <Container>
        <SectionHeading
          id="journey-title"
          eyebrow="Our journey"
          title="Building excellence since 1967"
          description="Nearly six decades of fabrication, from heavy engineering to dedicated tanker manufacturing."
        />

        <ol className="relative mx-auto max-w-5xl">
          {/* Rail */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[1.375rem] w-px bg-gradient-to-b from-brand/10 via-brand/40 to-gold lg:left-1/2 lg:-translate-x-1/2"
          />
          {milestones.map((m, i) => {
            const right = i % 2 === 1;
            return (
              <li
                key={m.year}
                className="reveal relative grid grid-cols-[2.75rem_1fr] gap-5 pb-10 last:pb-0 lg:grid-cols-[1fr_3.5rem_1fr] lg:gap-8 lg:not-first:-mt-28"
              >
                {/* Node */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative z-10 mt-5 flex size-11 items-center justify-center rounded-full border-4 border-[#f8f7fb] text-xs font-bold shadow-[0_0_0_6px_rgb(244_180_0/0.18)] lg:col-start-2 lg:row-start-1 lg:mx-auto lg:size-14",
                    i === milestones.length - 1
                      ? "bg-gold text-brand-dark"
                      : "bg-brand text-gold",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <article
                  className={cn(
                    "rounded-2xl border border-brand/10 bg-white p-6 shadow-[0_20px_45px_-30px_rgb(21_15_38/0.35)] transition-transform duration-500 hover:-translate-y-1 md:p-7 lg:row-start-1",
                    right ? "lg:col-start-3" : "lg:col-start-1 lg:text-right",
                  )}
                >
                  <time
                    dateTime={m.dateTime}
                    className="inline-block rounded-full bg-brand/[0.07] px-3 py-1 text-sm font-bold text-brand"
                  >
                    {m.year}
                  </time>
                  <h3 className="mt-3 text-xl font-semibold text-brand md:text-2xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {m.text}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
