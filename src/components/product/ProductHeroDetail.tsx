import { ArrowRightIcon, MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { TrackedAnchor, TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { buttonVariants } from "@/components/ui/button";
import type { ProductDetail } from "@/lib/product-details";
import { inquiryHref } from "@/lib/product-links";
import { whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Product page hero: breadcrumb, h1, key specs, CTAs and the product visual. */
export function ProductHeroDetail({
  product,
  media,
}: {
  product: ProductDetail;
  /** Replaces the static image (petroleum branding switcher). */
  media?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="product-title"
      className="relative isolate overflow-hidden bg-[#150f26] text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_70%_at_80%_40%,rgb(111_66_193/0.45),transparent_70%),radial-gradient(35%_50%_at_0%_100%,rgb(244_180_0/0.14),transparent_70%)]"
      />
      <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-20">
        <div>
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-gold">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/products" className="hover:text-gold">
                  Products
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {product.name}
              </li>
            </ol>
          </nav>

          <p className="mb-3 text-sm font-semibold tracking-[0.16em] text-gold uppercase">
            {product.eyebrow}
          </p>
          <h1
            id="product-title"
            className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance md:text-5xl"
          >
            {product.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-white/80">
            {product.tagline}
          </p>

          <dl className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {product.keySpecs.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
              >
                <dt className="text-[11px] tracking-wider text-white/55 uppercase">
                  {s.label}
                </dt>
                <dd className="text-sm font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={inquiryHref(product.name)}
              event={{
                name: "cta_click",
                label: "Inquire about this",
                location: "product_hero",
                product: product.name,
              }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full bg-gold px-7 text-base font-semibold text-brand-dark hover:bg-gold-light",
              )}
            >
              Inquire about this
              <ArrowRightIcon aria-hidden="true" />
            </TrackedLink>
            <TrackedAnchor
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              event={{
                name: "contact_click",
                method: "whatsapp",
                location: `product_hero_${product.slug}`,
              }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-white/25 bg-white/5 px-7 text-base font-medium text-white backdrop-blur-md hover:bg-white/15 hover:text-white",
              )}
            >
              <MessageCircleIcon aria-hidden="true" />
              WhatsApp us
            </TrackedAnchor>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
          {media ?? (
            <div className="relative flex aspect-[16/10] items-center justify-center p-4 md:p-8">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                width={product.image.width}
                height={product.image.height}
                sizes="(min-width: 1024px) 640px, 90vw"
                loading="eager"
                fetchPriority="high"
                className="max-h-full w-auto object-contain"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
