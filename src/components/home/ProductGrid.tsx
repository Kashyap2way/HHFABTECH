import { ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { products } from "@/lib/products";

export function ProductGrid() {
  return (
    <section
      aria-labelledby="products-title"
      className="bg-[#f8f7fb] py-16 md:py-24"
    >
      <Container>
        <SectionHeading
          id="products-title"
          eyebrow="Our expertise"
          title="Our product range"
          description="Every unit is fabricated to order, tested before dispatch and backed by our engineering team."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {products.map((p) => (
            <li key={p.slug} className="reveal">
              <TrackedLink
                href={`/${p.slug}`}
                event={{
                  name: "cta_click",
                  label: p.name,
                  location: "home_products",
                  product: p.name,
                }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white shadow-[0_18px_40px_-26px_rgb(21_15_38/0.35)] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_34px_60px_-30px_rgb(67_35_111/0.5)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-white">
                  <Image
                    src={p.image.src}
                    alt={p.name}
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                    className="object-contain p-4 pt-10 transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand backdrop-blur">
                    {p.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-brand">{p.name}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">
                    {p.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark">
                    View details
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </TrackedLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
