import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";

const steps = [
  {
    title: "Requirement",
    text: "Share capacity, product, chassis and compartment needs.",
  },
  {
    title: "Design & quote",
    text: "We confirm dimensions, material and a detailed quotation.",
  },
  {
    title: "Fabrication",
    text: "Precision welding, baffles, fittings and surface treatment.",
  },
  {
    title: "Testing",
    text: "Hydro test, leakage test and final quality inspection.",
  },
  {
    title: "Delivery",
    text: "Dispatch on schedule with documentation and support.",
  },
] as const;

export function ProcessSteps() {
  return (
    <section
      aria-labelledby="process-title"
      className="bg-[#f8f7fb] py-16 md:py-24"
    >
      <Container>
        <SectionHeading
          id="process-title"
          eyebrow="How we work"
          title="From enquiry to delivery"
        />
        <ol className="grid gap-6 md:grid-cols-5 md:gap-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="reveal relative flex gap-4 md:flex-col md:gap-0 md:text-center"
            >
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-6 left-6 h-full w-px bg-brand/15 md:top-6 md:left-[calc(50%+1.75rem)] md:h-px md:w-[calc(100%-3.5rem)]"
                />
              ) : null}
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-gold ring-8 ring-[#f8f7fb] md:mx-auto md:mb-5">
                {i + 1}
              </span>
              <div className="pb-2">
                <h3 className="text-lg font-semibold text-brand">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
