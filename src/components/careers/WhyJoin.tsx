import {
  FactoryIcon,
  HardHatIcon,
  IndianRupeeIcon,
  TrendingUpIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const reasons = [
  {
    icon: FactoryIcon,
    title: "Modern manufacturing",
    text: "Work on real fabrication, welding and tanker manufacturing projects for oil, chemical and water customers.",
  },
  {
    icon: TrendingUpIcon,
    title: "Career growth",
    text: "Learn on the job and take on more responsibility as you grow, from the shop floor to leading a team.",
  },
  {
    icon: UsersIcon,
    title: "Supportive team",
    text: "A close-knit team where everyone's work is visible and every contribution counts.",
  },
  {
    icon: IndianRupeeIcon,
    title: "Competitive salary",
    text: "Fair pay for your skills, with growth based on performance.",
  },
] as const;

const process = [
  {
    icon: WrenchIcon,
    title: "Apply online",
    text: "Pick a role and send your résumé. It takes about two minutes.",
  },
  {
    icon: UsersIcon,
    title: "Screening call",
    text: "If your profile fits, our team calls you to talk about the role.",
  },
  {
    icon: HardHatIcon,
    title: "Visit the factory",
    text: "Meet the team in Sanathal. Skilled roles may include a practical test.",
  },
  {
    icon: TrendingUpIcon,
    title: "Offer & joining",
    text: "We share the offer and agree a joining date that works for you.",
  },
] as const;

export function WhyJoin() {
  return (
    <section aria-labelledby="why-title" className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading
          id="why-title"
          eyebrow="Life at HH FABTECH"
          title="Why join HH FABTECH?"
          description="Grow with a Gujarat tanker manufacturer committed to quality, safety and engineering excellence."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="reveal group rounded-2xl border border-brand/10 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgb(67_35_111/0.45)]"
            >
              <span className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand/[0.07] text-brand transition-colors group-hover:bg-brand group-hover:text-gold">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="text-lg font-semibold text-brand">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function HiringProcess() {
  return (
    <section
      aria-labelledby="process-title"
      className="bg-white pb-16 md:pb-24"
    >
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#150f26] p-8 text-white md:p-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_0%_0%,rgb(111_66_193/0.5),transparent_70%),radial-gradient(40%_70%_at_100%_100%,rgb(244_180_0/0.18),transparent_70%)]"
          />
          <h2 id="process-title" className="text-2xl font-semibold md:text-3xl">
            How hiring works
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4">
                <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Icon aria-hidden="true" className="size-5" />
                  <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-brand-dark">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
