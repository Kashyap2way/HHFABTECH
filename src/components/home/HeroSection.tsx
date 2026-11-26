import { ArrowRightIcon, CalculatorIcon, CheckIcon } from "lucide-react";
import Image, { getImageProps } from "next/image";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  { src: "/images/hero/hero2.webp", alt: "Stainless steel tanker" },
  { src: "/images/hero/hero3.webp", alt: "Chemical tanker" },
  { src: "/images/hero/hero4.webp", alt: "Vertical storage tanks" },
] as const;

const brands = ["IOCL", "HPCL", "Jio-bp", "Nayara", "Essar"] as const;
const trust = [
  "Hydro & leakage tested",
  "Custom compartments",
  "Pan-India delivery",
] as const;

/** First slide uses art direction: a portrait crop on phones, landscape above. */
function FirstSlide() {
  const common = {
    alt: "Petroleum tanker manufactured by HH FABTECH",
    sizes: "100vw",
  };
  const {
    props: { srcSet: mobile },
  } = getImageProps({
    ...common,
    src: "/images/hero/hero1-mobile.webp",
    width: 560,
    height: 640,
    quality: 75,
  });
  const {
    props: { srcSet: desktop, ...rest },
  } = getImageProps({
    ...common,
    src: "/images/hero/hero1.webp",
    width: 1658,
    height: 640,
    quality: 75,
    loading: "eager",
    fetchPriority: "high",
  });
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile} />
      <source media="(min-width: 768px)" srcSet={desktop} />
      {/* biome-ignore lint/a11y/useAltText: alt is in `rest` from getImageProps */}
      <img {...rest} className="size-full object-cover" />
    </picture>
  );
}

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden bg-brand-deep text-white lg:min-h-[calc(100svh-var(--header-h)-2.25rem)]"
    >
      {/* Crossfading photos. Phones only download the first one. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <div className="hero-slide absolute inset-0">
          <FirstSlide />
        </div>
        {slides.map((s, i) => (
          <div
            key={s.src}
            className="hero-slide absolute inset-0 max-md:hidden"
            style={{ animationDelay: `${(i + 1) * 6}s` }}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="100vw"
              quality={70}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Even overlay: dark at the edges, clear in the middle, so the centred copy stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_50%_45%,rgb(21_15_38/0.55),rgb(21_15_38/0.85)_100%),linear-gradient(180deg,rgb(21_15_38/0.45),rgb(21_15_38/0.2)_40%,rgb(21_15_38/0.85))]"
      />

      <Container className="flex flex-1 items-center justify-center py-16 md:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md md:text-sm">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-gold"
            />
            Tanker manufacturer
            <span className="max-sm:hidden"> in Ahmedabad</span> · Since 1967
          </p>

          <h1
            id="hero-title"
            className="text-[2.25rem] leading-[1.12] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]"
          >
            Petroleum, chemical &amp; water tankers{" "}
            <span className="text-gold">engineered to last</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-white/80 md:text-lg">
            HH FABTECH builds petroleum, diesel, chemical, stainless steel and
            water tankers, fuel bowsers and storage tanks to your capacity,
            compartment and branding needs.
          </p>

          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/contact#inquiry"
              event={{
                name: "cta_click",
                label: "Request a Quote",
                location: "home_hero",
              }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full bg-gold px-7 text-base font-semibold text-brand-dark hover:bg-gold-light",
              )}
            >
              Request a Quote
              <ArrowRightIcon aria-hidden="true" />
            </TrackedLink>
            <TrackedLink
              href="/products"
              event={{
                name: "cta_click",
                label: "Explore Products",
                location: "home_hero",
              }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-white/30 bg-white/10 px-7 text-base font-medium text-white backdrop-blur-md hover:bg-white/20 hover:text-white",
              )}
            >
              Explore Products
            </TrackedLink>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/75">
            {trust.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CheckIcon aria-hidden="true" className="size-4 text-gold" />
                {t}
              </li>
            ))}
          </ul>

          <TrackedLink
            href="/calculator"
            event={{
              name: "cta_click",
              label: "Volume Calculator",
              location: "home_hero",
            }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
          >
            <CalculatorIcon
              aria-hidden="true"
              className="size-4 shrink-0 max-sm:hidden"
            />
            Not sure about capacity? Try the free volume calculator
          </TrackedLink>
        </div>
      </Container>

      {/* Full-width brand strip anchors the bottom of the hero */}
      <div className="border-t border-white/10 bg-brand-deep/60 backdrop-blur-sm">
        <Container className="flex flex-col items-center gap-3 py-5 md:flex-row md:justify-center md:gap-10">
          <p className="text-xs font-medium tracking-[0.14em] text-white/60 uppercase">
            Built with approved branding for
          </p>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-base font-semibold tracking-wide text-white/85 md:gap-x-10">
            {brands.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}
