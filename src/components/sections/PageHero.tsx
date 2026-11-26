import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./Container";

type Crumb = { name: string; href?: string };

/** Inner-page banner with background photo, breadcrumb, h1 and lead. */
export function PageHero({
  title,
  description,
  eyebrow,
  breadcrumbs,
  image = "/images/hero/hero2.webp",
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: readonly Crumb[];
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-white">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="-z-20 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgb(36_16_61/0.94)_0%,rgb(67_35_111/0.85)_55%,rgb(67_35_111/0.6)_100%)]"
      />
      <Container className="py-16 md:py-20 lg:py-24">
        {breadcrumbs ? (
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbs.map((c, i) => (
                <li key={c.name} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden="true">/</span> : null}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-gold">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-gold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-balance md:text-5xl lg:text-[3.5rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-white/85">
            {description}
          </p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
