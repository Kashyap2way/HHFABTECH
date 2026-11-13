import {
  BadgeCheckIcon,
  HeadsetIcon,
  RulerIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchIcon,
} from "lucide-react";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const features = [
  {
    icon: BadgeCheckIcon,
    title: "Quality assurance",
    text: "Every product undergoes detailed inspection and testing before delivery to ensure the highest quality standards.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safety first",
    text: "Hydro and leakage testing on every compartment, with PESO-approved accessories on petroleum tankers.",
  },
  {
    icon: RulerIcon,
    title: "Built to your spec",
    text: "Capacity, compartments, material, loading type and branding configured for your chassis and application.",
  },
  {
    icon: WrenchIcon,
    title: "Modern fabrication",
    text: "Precision welding, 3-D pre-treatment and PU paint for a durable finish and long service life.",
  },
  {
    icon: TruckIcon,
    title: "On-time delivery",
    text: "Efficient manufacturing and logistics ensure timely delivery without compromising product quality.",
  },
  {
    icon: HeadsetIcon,
    title: "Responsive support",
    text: "Our experienced team is ready to provide technical assistance and customer support whenever required.",
  },
] as const;

export function WhyChoose() {
  return (
    <section aria-labelledby="why-title" className="bg-white py-16 md:py-24">
      <Container>
        <SectionHeading
          id="why-title"
          eyebrow="Why HH FABTECH"
          title="Built right, delivered on time"
          description="What fleet owners, oil marketing dealers and industries rely on us for."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="reveal group rounded-2xl border border-brand/10 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_30px_60px_-34px_rgb(67_35_111/0.45)]"
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
