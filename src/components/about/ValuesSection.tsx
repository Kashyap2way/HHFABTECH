import {
  BadgeCheckIcon,
  ClockIcon,
  FactoryIcon,
  HandshakeIcon,
  LightbulbIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const values = [
  {
    icon: BadgeCheckIcon,
    title: "Quality",
    text: "Premium raw materials and inspection at every stage of production.",
  },
  {
    icon: LightbulbIcon,
    title: "Innovation",
    text: "Modern fabrication methods and designs tailored to each application.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safety",
    text: "Hydro and leakage tested tanks built for safe transport and storage.",
  },
  {
    icon: ClockIcon,
    title: "Timely delivery",
    text: "Planned production so your tanker reaches you on schedule.",
  },
] as const;

const capabilities = [
  {
    icon: FactoryIcon,
    title: "Modern manufacturing",
    text: "Advanced fabrication facilities equipped for precision engineering.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Quality standards",
    text: "Strict inspection and quality control during every stage of production.",
  },
  {
    icon: HandshakeIcon,
    title: "Customer satisfaction",
    text: "Customised solutions and long-term relationships with every client.",
  },
] as const;

export function ValuesSection() {
  return (
    <section aria-labelledby="values-title" className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading
          id="values-title"
          eyebrow="What we stand for"
          title="Our values"
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
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

        {/* Capabilities: dark band for contrast */}
        <div className="relative isolate mt-16 overflow-hidden rounded-[2rem] bg-[#150f26] p-8 text-white md:mt-20 md:p-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_0%_0%,rgb(111_66_193/0.5),transparent_70%),radial-gradient(40%_70%_at_100%_100%,rgb(244_180_0/0.18),transparent_70%)]"
          />
          <h2 className="text-2xl font-semibold md:text-3xl">
            What we bring to every project
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/70">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
