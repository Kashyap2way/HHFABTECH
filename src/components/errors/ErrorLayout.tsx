import type { ReactNode } from "react";
import { Container } from "@/components/sections/Container";

type ErrorLayoutProps = {
  /** Large status code shown as a backdrop, e.g. "404" */
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Primary and secondary actions */
  actions: ReactNode;
  /** Optional block under the actions (helpful links) */
  children?: ReactNode;
};

/** Shared branded layout for 404 and 500 pages (renders inside the root layout). */
export function ErrorLayout({
  code,
  eyebrow,
  title,
  description,
  actions,
  children,
}: ErrorLayoutProps) {
  return (
    <section
      aria-labelledby="error-title"
      className="relative isolate overflow-hidden bg-[#150f26] text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_30%,rgb(111_66_193/0.45),transparent_70%),radial-gradient(35%_40%_at_90%_90%,rgb(244_180_0/0.15),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_40%,#000,transparent)] bg-[linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:48px_48px]"
      />
      <Container className="flex min-h-[calc(100svh-var(--header-h)-2.25rem)] flex-col items-center justify-center py-20 text-center">
        <p
          aria-hidden="true"
          className="bg-gradient-to-b from-white/25 to-white/0 bg-clip-text text-[7rem] leading-none font-bold tracking-tight text-transparent select-none sm:text-[10rem] lg:text-[12rem]"
        >
          {code}
        </p>
        <p className="mt-2 text-sm font-semibold tracking-[0.18em] text-gold uppercase">
          {eyebrow}
        </p>
        <h1
          id="error-title"
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-5xl"
        >
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-white/75 md:text-lg">
          {description}
        </p>
        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {actions}
        </div>
        {children}
      </Container>
    </section>
  );
}

/** Pill button styles shared by the error pages. */
export const errorPrimary =
  "h-12 rounded-full bg-gold px-7 text-base font-semibold text-brand-dark hover:bg-gold-light";
export const errorSecondary =
  "h-12 rounded-full border-white/25 bg-white/5 px-7 text-base font-medium text-white backdrop-blur-md hover:bg-white/15 hover:text-white";
