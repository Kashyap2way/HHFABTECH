import { MapPinIcon } from "lucide-react";
import { TrackedAnchor } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { buttonVariants } from "@/components/ui/button";
import { contact } from "@/lib/site";
import { cn } from "@/lib/utils";

export function VisitStrip() {
  return (
    <section
      aria-labelledby="visit-title"
      className="bg-[#f8f7fb] py-12 md:py-16"
    >
      <Container>
        <div className="flex flex-col gap-6 rounded-3xl border border-brand/10 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-gold">
              <MapPinIcon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 id="visit-title" className="text-xl font-semibold text-brand">
                Visit our manufacturing facility
              </h2>
              <address className="mt-1 text-[15px] leading-relaxed text-muted-foreground not-italic">
                {contact.addressLines.join(" ")}
              </address>
            </div>
          </div>
          <TrackedAnchor
            href={contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            event={{
              name: "contact_click",
              method: "map",
              location: "about_visit",
            }}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 shrink-0 rounded-full px-6 font-semibold text-brand",
            )}
          >
            Get directions
            <span className="sr-only"> (opens Google Maps)</span>
          </TrackedAnchor>
        </div>
      </Container>
    </section>
  );
}
