import { ExternalLinkIcon } from "lucide-react";
import { TrackedAnchor } from "@/components/analytics/TrackedLink";
import { Container } from "@/components/sections/Container";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { contact } from "@/lib/site";

const embedSrc = `https://maps.google.com/maps?q=${contact.geo.latitude},${contact.geo.longitude}&z=15&output=embed`;

export function MapEmbed() {
  return (
    <section
      aria-labelledby="map-title"
      className="bg-[#f8f7fb] py-16 md:py-24"
    >
      <Container>
        <SectionHeading
          id="map-title"
          eyebrow="Visit us"
          title="Visit our manufacturing facility"
          description="We welcome customers to visit our factory in Sanathal, Ahmedabad and discuss their tanker requirements in person."
        />
        <div className="overflow-hidden rounded-3xl border border-brand/10 bg-white shadow-[0_30px_60px_-34px_rgb(21_15_38/0.4)]">
          <iframe
            src={embedSrc}
            title="Map showing the HH FABTECH factory in Sanathal, Ahmedabad"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block aspect-[4/3] w-full border-0 sm:aspect-[16/9] lg:aspect-[21/9]"
          />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
            <p className="text-sm text-muted-foreground">
              {contact.addressLines.join(" ")}
            </p>
            <TrackedAnchor
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              event={{
                name: "contact_click",
                method: "map",
                location: "contact_map",
              }}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:text-gold-dark"
            >
              Get directions
              <ExternalLinkIcon aria-hidden="true" className="size-4" />
            </TrackedAnchor>
          </div>
        </div>
      </Container>
    </section>
  );
}
