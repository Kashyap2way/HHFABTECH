import { Container } from "@/components/sections/Container";

const highlights = [
  { value: "1967", label: "Founded" },
  { value: "6", label: "Product lines" },
  { value: "12–40 KL", label: "Petroleum tanker range" },
  { value: "Pan India", label: "Supply and support" },
] as const;

/** Key facts card that overlaps the hero bottom edge on larger screens. */
export function HighlightsStrip() {
  return (
    <section aria-label="Key facts" className="bg-white pt-12 md:pt-16">
      <Container>
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[0_30px_60px_-30px_rgb(67_35_111/0.35)] lg:grid-cols-4">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex flex-col-reverse gap-1 border-brand/10 p-5 text-center not-last:border-r max-lg:nth-2:border-r-0 max-lg:nth-[-n+2]:border-b md:p-7"
            >
              <dt className="text-sm text-muted-foreground">{h.label}</dt>
              <dd className="text-2xl font-bold text-brand md:text-3xl">
                {h.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
