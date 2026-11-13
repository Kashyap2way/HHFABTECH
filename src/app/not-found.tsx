import { ArrowRightIcon, HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import {
  ErrorLayout,
  errorPrimary,
  errorSecondary,
} from "@/components/errors/ErrorLayout";
import { TrackNotFound } from "@/components/errors/TrackNotFound";
import { SiteShell } from "@/components/layout/SiteShell";
import { buttonVariants } from "@/components/ui/button";
import { productLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  // The root not-found renders outside the (site) group, so it adds the site chrome itself.
  return (
    <SiteShell>
      <ErrorLayout
        code="404"
        eyebrow="Page not found"
        title="This page took a wrong turn"
        description="The link may be old or the page may have moved. Try one of our products below, or head back home."
        actions={
          <>
            <TrackedLink
              href="/"
              event={{
                name: "cta_click",
                label: "Back to home",
                location: "404",
              }}
              className={cn(buttonVariants({ size: "lg" }), errorPrimary)}
            >
              <HomeIcon aria-hidden="true" />
              Back to home
            </TrackedLink>
            <TrackedLink
              href="/contact"
              event={{
                name: "cta_click",
                label: "Contact us",
                location: "404",
              }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                errorSecondary,
              )}
            >
              Contact us
            </TrackedLink>
          </>
        }
      >
        <nav aria-label="Popular pages" className="mt-14 w-full max-w-3xl">
          <h2 className="text-xs font-medium tracking-[0.14em] text-white/55 uppercase">
            Popular products
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {productLinks.map((p) => (
              <li key={p.href}>
                <TrackedLink
                  href={p.href}
                  event={{
                    name: "cta_click",
                    label: p.label,
                    location: "404",
                    product: p.label,
                  }}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white/85 transition-colors hover:border-gold/40 hover:bg-white/10 hover:text-white"
                >
                  {p.label}
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-4 text-gold transition-transform group-hover:translate-x-0.5"
                  />
                </TrackedLink>
              </li>
            ))}
          </ul>
        </nav>
        <TrackNotFound />
      </ErrorLayout>
    </SiteShell>
  );
}
