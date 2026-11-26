import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import type { Feature } from "@/lib/product-details";

export function ProductFeatures({
  features,
}: {
  features: readonly Feature[];
}) {
  return (
    <section
      aria-labelledby="why-title"
      className="bg-[#f8f7fb] py-16 md:py-20"
    >
      <Container>
        <SectionHeading
          id="why-title"
          eyebrow="Why HH FABTECH"
          title="Why choose us"
        />
        <ul className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="reveal group rounded-2xl border border-brand/10 bg-white p-7"
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
