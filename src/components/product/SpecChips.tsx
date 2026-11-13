import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import type { ChipGroup } from "@/lib/product-details";
import { cn } from "@/lib/utils";

/** Option groups (capacities, materials, pumps) as cards of pill chips. */
export function SpecChips({ groups }: { groups: readonly ChipGroup[] }) {
  if (!groups.length) return null;
  return (
    <section
      aria-labelledby="options-title"
      className="bg-[#f8f7fb] py-16 md:py-20"
    >
      <Container>
        <SectionHeading
          id="options-title"
          eyebrow="Options"
          title="Available options"
          description="Every unit is configured to order. Pick a standard option or ask for a custom build."
        />
        <div
          className={cn(
            "grid gap-5",
            groups.length > 1 && "md:grid-cols-2",
            groups.length === 1 && "mx-auto max-w-3xl",
          )}
        >
          {groups.map((g) => (
            <div
              key={g.title}
              className="reveal rounded-2xl border border-brand/10 bg-white p-6 md:p-7"
            >
              <h3 className="text-lg font-semibold text-brand">{g.title}</h3>
              {g.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {g.description}
                </p>
              ) : null}
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-brand/15 bg-brand/[0.04] px-4 py-2 text-sm font-semibold text-brand"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
