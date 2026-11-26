import { CheckCircle2Icon } from "lucide-react";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import type { ProductDetail } from "@/lib/product-details";

export function ProductOverview({ product }: { product: ProductDetail }) {
  return (
    <section
      aria-labelledby="overview-title"
      className="bg-white py-16 md:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionHeading
            id="overview-title"
            align="left"
            eyebrow="Overview"
            title={product.overviewTitle}
            className="mb-6 md:mb-8"
          />
          <div className="space-y-4 leading-relaxed text-muted-foreground md:text-lg">
            {product.overview.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-brand/10 bg-[#f8f7fb] p-6 md:p-8 lg:self-end">
          <h3 className="mb-5 text-sm font-semibold tracking-[0.14em] text-gold-dark uppercase">
            Key features
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15px] leading-snug">
                <CheckCircle2Icon
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-gold-dark"
                />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
