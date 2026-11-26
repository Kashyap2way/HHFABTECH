import { ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { products } from "@/lib/products";

export function RelatedProducts({ slugs }: { slugs: readonly string[] }) {
  const items = slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p) => p !== undefined);
  return (
    <section
      aria-labelledby="related-title"
      className="bg-white py-16 md:py-20"
    >
      <Container>
        <SectionHeading
          id="related-title"
          eyebrow="Explore more"
          title="Related products"
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <li key={p.slug}>
              <TrackedLink
                href={`/${p.slug}`}
                event={{
                  name: "select_product",
                  slug: p.slug,
                  product: p.name,
                  list: "related_products",
                  index: i,
                }}
                className="group flex items-center gap-4 rounded-2xl border border-brand/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_24px_48px_-30px_rgb(67_35_111/0.5)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="relative block aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image
                    src={p.image.src}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-contain p-1"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-brand">
                    {p.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {p.tag}
                  </span>
                </span>
                <ArrowUpRightIcon
                  aria-hidden="true"
                  className="size-5 shrink-0 text-gold-dark transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </TrackedLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
